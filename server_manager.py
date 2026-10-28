# -*- coding: utf-8 -*-
"""YUNSEUL-HOME: nginx + Node API pair control."""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)


def app_dir() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def default_config_path() -> Path:
    return app_dir() / "config.json"


@dataclass
class ServiceStatus:
    name: str
    running: bool
    port: int
    detail: str = ""
    pid: int | None = None


class ServerManager:
    def __init__(self, config_path: Path | None = None, log: Callable[[str], None] | None = None):
        self.config_path = Path(config_path) if config_path else default_config_path()
        self.log = log or (lambda _m: None)
        self.cfg = self._load_config()
        self._node_proc: subprocess.Popen | None = None

    def _read_json(self, path: Path) -> dict:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            return data if isinstance(data, dict) else {}
        except Exception as e:
            self.log(f"설정 읽기 실패 ({path.name}): {e}")
            return {}

    def _load_config(self) -> dict:
        base = {
            "nginx_dir": str(Path.home() / "nginx"),
            "nginx_exe": "nginx.exe",
            "nginx_port": 777,
            "node_exe": "node",
            "api_dir": str((app_dir() / "api").resolve()),
            "api_entry": "server.mjs",
            "api_port": 7780,
            "site_url": "http://127.0.0.1:777/",
        }
        # Bundled config inside PyInstaller archive.
        meipass = getattr(sys, "_MEIPASS", None)
        if meipass:
            bundled = Path(meipass) / "config.json"
            if bundled.exists():
                base.update(self._read_json(bundled))
        # Prefer config next to the script/exe.
        if self.config_path.exists():
            base.update(self._read_json(self.config_path))
        api_dir = Path(base["api_dir"])
        if not api_dir.is_absolute():
            api_dir = (app_dir() / api_dir).resolve()
            base["api_dir"] = str(api_dir)
        nginx_dir = Path(base["nginx_dir"])
        if not nginx_dir.is_absolute():
            nginx_dir = nginx_dir.resolve()
            base["nginx_dir"] = str(nginx_dir)
        return base

    def save_config(self) -> None:
        self.config_path.write_text(json.dumps(self.cfg, ensure_ascii=False, indent=2), encoding="utf-8")

    @property
    def nginx_port(self) -> int:
        return int(self.cfg.get("nginx_port", 777))

    @property
    def api_port(self) -> int:
        return int(self.cfg.get("api_port", 7780))

    @property
    def site_url(self) -> str:
        return str(self.cfg.get("site_url") or f"http://127.0.0.1:{self.nginx_port}/")

    def port_open(self, port: int, host: str = "127.0.0.1", timeout: float = 0.05) -> bool:
        """빠른 TCP 체크. UI 폴링용이라 타임아웃을 짧게 둔다."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        try:
            sock.connect((host, int(port)))
            return True
        except OSError:
            return False
        finally:
            sock.close()

    def _pids_listening(self, port: int) -> list[int]:
        # netstat 한 번이면 끝 — PowerShell Get-NetTCPConnection 은 UI를 수 초씩 멈춘다.
        try:
            out = subprocess.check_output(
                ["netstat", "-ano", "-p", "tcp"],
                text=True,
                encoding="utf-8",
                errors="ignore",
                creationflags=CREATE_NO_WINDOW,
                timeout=3,
            )
        except Exception:
            return []
        port_s = str(int(port))
        found: list[int] = []
        for line in out.splitlines():
            if "LISTENING" not in line:
                continue
            parts = line.split()
            if len(parts) < 5:
                continue
            local = parts[1]
            if ":" not in local:
                continue
            if local.rsplit(":", 1)[-1] != port_s:
                continue
            try:
                pid = int(parts[-1])
            except ValueError:
                continue
            if pid and pid not in found:
                found.append(pid)
        return found

    def _cmdline(self, pid: int) -> str:
        # wmic 한 줄 — PowerShell CIM 보다 훨씬 가벼움
        try:
            out = subprocess.check_output(
                ["wmic", "process", "where", f"ProcessId={int(pid)}", "get", "CommandLine", "/value"],
                text=True,
                encoding="utf-8",
                errors="ignore",
                creationflags=CREATE_NO_WINDOW,
                timeout=3,
            )
            for line in out.splitlines():
                if line.startswith("CommandLine="):
                    return line.split("=", 1)[1].strip()
            return ""
        except Exception:
            return ""

    def nginx_exe_path(self) -> Path:
        return Path(self.cfg["nginx_dir"]) / self.cfg.get("nginx_exe", "nginx.exe")

    def api_entry_path(self) -> Path:
        return Path(self.cfg["api_dir"]) / self.cfg.get("api_entry", "server.mjs")

    def nginx_status(self, *, with_pids: bool = False) -> ServiceStatus:
        port = self.nginx_port
        if not self.nginx_exe_path().exists():
            return ServiceStatus("Nginx", False, port, f"nginx 없음: {self.nginx_exe_path()}")
        running = self.port_open(port)
        pid = None
        detail = f"포트 {port}"
        if with_pids and running:
            pids = self._pids_listening(port)
            if pids:
                pid = pids[0]
                detail = f"포트 {port} · PID {', '.join(map(str, pids))}"
        return ServiceStatus("Nginx", running, port, detail, pid)

    def api_status(self, *, with_pids: bool = False) -> ServiceStatus:
        port = self.api_port
        if not self.api_entry_path().exists():
            return ServiceStatus("Node API", False, port, f"API 없음: {self.api_entry_path()}")
        running = self.port_open(port)
        pid = None
        detail = f"포트 {port}"
        if with_pids and running:
            pids = self._pids_listening(port)
            ours: list[int] = []
            for p in pids:
                cmd = self._cmdline(p).lower()
                api_dir = str(self.cfg["api_dir"]).lower().replace("\\", "/")
                if "server.mjs" in cmd or api_dir in cmd.replace("\\", "/"):
                    ours.append(p)
            use = ours or pids
            if use:
                pid = use[0]
                detail = f"포트 {port} · PID {', '.join(map(str, use))}"
        return ServiceStatus("Node API", running, port, detail, pid)

    def pair_status(self, *, with_pids: bool = False) -> tuple[ServiceStatus, ServiceStatus, bool]:
        # UI 폴링은 with_pids=False (소켓만) — PID/PowerShell 조회는 종료 시에만
        nginx = self.nginx_status(with_pids=with_pids)
        api = self.api_status(with_pids=with_pids)
        return nginx, api, nginx.running and api.running

    def _run(self, args: list[str], cwd: Path | None = None, wait: bool = False) -> subprocess.CompletedProcess | subprocess.Popen:
        kwargs = {
            "cwd": str(cwd) if cwd else None,
            "creationflags": CREATE_NO_WINDOW,
        }
        if wait:
            return subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=20, **kwargs)
        return subprocess.Popen(
            args,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            **kwargs,
        )

    def start_api(self) -> None:
        if self.port_open(self.api_port):
            self.log(f"Node API 이미 실행 중 (:{self.api_port})")
            return
        entry = self.api_entry_path()
        if not entry.exists():
            raise FileNotFoundError(f"API 파일을 찾을 수 없습니다: {entry}")
        node = self.cfg.get("node_exe") or "node"
        self.log(f"Node API 시작: {node} {entry.name}")
        self._node_proc = self._run([node, entry.name], cwd=Path(self.cfg["api_dir"]), wait=False)  # type: ignore[assignment]
        self._wait_port(self.api_port, timeout=12, label="Node API")

    def start_nginx(self) -> None:
        if self.port_open(self.nginx_port):
            self.log(f"Nginx 이미 실행 중 (:{self.nginx_port})")
            return
        exe = self.nginx_exe_path()
        if not exe.exists():
            raise FileNotFoundError(f"nginx를 찾을 수 없습니다: {exe}")
        self.log(f"Nginx 시작: {exe}")
        self._run([str(exe)], cwd=exe.parent, wait=False)
        self._wait_port(self.nginx_port, timeout=8, label="Nginx")

    def _wait_port(self, port: int, timeout: float, label: str) -> None:
        deadline = time.time() + timeout
        while time.time() < deadline:
            if self.port_open(port):
                self.log(f"{label} 준비됨 (:{port})")
                return
            time.sleep(0.25)
        raise TimeoutError(f"{label}가 {timeout:.0f}초 안에 포트 {port}를 열지 못했습니다.")

    def stop_nginx(self) -> None:
        exe = self.nginx_exe_path()
        if exe.exists():
            self.log("Nginx 종료 신호 전송 (-s stop)")
            try:
                self._run([str(exe), "-s", "stop"], cwd=exe.parent, wait=True)
            except Exception as e:
                self.log(f"nginx -s stop 실패: {e}")
        # Fallback: kill listeners on nginx port if still up.
        time.sleep(0.4)
        if self.port_open(self.nginx_port):
            for pid in self._pids_listening(self.nginx_port):
                self._kill_pid(pid)
        # Master/worker leftovers named nginx.exe
        try:
            subprocess.run(
                ["taskkill", "/F", "/IM", "nginx.exe"],
                capture_output=True,
                text=True,
                creationflags=CREATE_NO_WINDOW,
                timeout=10,
            )
        except Exception:
            pass
        self.log("Nginx 종료 완료")

    def stop_api(self) -> None:
        if self._node_proc and self._node_proc.poll() is None:
            self.log(f"Node API 프로세스 종료 (PID {self._node_proc.pid})")
            try:
                self._node_proc.terminate()
                self._node_proc.wait(timeout=3)
            except Exception:
                try:
                    self._node_proc.kill()
                except Exception:
                    pass
            self._node_proc = None
        for pid in self._pids_listening(self.api_port):
            cmd = self._cmdline(pid).lower()
            if "server.mjs" in cmd or not cmd:
                self._kill_pid(pid)
            elif str(self.cfg["api_dir"]).lower().replace("\\", "/") in cmd.replace("\\", "/"):
                self._kill_pid(pid)
        # If something else still holds 7780 after our stop attempt, leave a note.
        time.sleep(0.3)
        if self.port_open(self.api_port):
            for pid in self._pids_listening(self.api_port):
                self.log(f"포트 {self.api_port} 잔여 PID {pid} 강제 종료")
                self._kill_pid(pid)
        self.log("Node API 종료 완료")

    def _kill_pid(self, pid: int) -> None:
        try:
            subprocess.run(
                ["taskkill", "/F", "/PID", str(pid)],
                capture_output=True,
                text=True,
                creationflags=CREATE_NO_WINDOW,
                timeout=10,
            )
            self.log(f"PID {pid} 종료")
        except Exception as e:
            self.log(f"PID {pid} 종료 실패: {e}")

    def start_pair(self) -> None:
        # API first so nginx proxy has a backend.
        self.start_api()
        self.start_nginx()
        nginx, api, ok = self.pair_status()
        if not ok:
            raise RuntimeError(
                f"서버 시작 실패 — Nginx={'ON' if nginx.running else 'OFF'}, "
                f"Node={'ON' if api.running else 'OFF'}"
            )
        self.log("서버 시작 완료 (Nginx + Node API)")

    def stop_pair(self) -> None:
        # Stop frontend first, then API.
        self.stop_nginx()
        self.stop_api()
        self.log("서버 종료 완료")
