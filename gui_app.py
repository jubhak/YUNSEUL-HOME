# -*- coding: utf-8 -*-
"""YUNSEUL-HOME Server Control — Nginx + Node API pair GUI."""

from __future__ import annotations

import os
import sys
import traceback
from pathlib import Path

from PyQt6.QtCore import QEvent, QEventLoop, Qt, QThread, QTimer, pyqtSignal
from PyQt6.QtGui import QAction, QColor, QFont, QIcon, QPainter, QPixmap
from PyQt6.QtWidgets import (
    QApplication,
    QFrame,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMenu,
    QMessageBox,
    QPushButton,
    QPlainTextEdit,
    QSystemTrayIcon,
    QVBoxLayout,
    QWidget,
)

# 버튼 문구를 화면에 그린 뒤 실제 작업 시작까지 대기(ms)
UI_PAINT_DELAY_MS = 80

# Button labels
LBL_START = "서버 시작"
LBL_STARTING = "서버 시작 중..."
LBL_RUNNING = "서버 실행 중"
LBL_STOP = "서버 종료"
LBL_STOPPING = "서버 종료 중..."
LBL_RESTART = "서버 재시작"
LBL_RESTARTING = "서버 재시작 중..."

from server_manager import ServerManager, ServiceStatus, app_dir


DARK = """
QMainWindow, QWidget {
    background-color: #0f172a;
    color: #f1f5f9;
    font-family: 'Pretendard', 'Segoe UI', 'Malgun Gothic', sans-serif;
    font-size: 13px;
}
QWidget#shell {
    background-color: #0f172a;
    border: 1px solid #475569;
}
QFrame#titleBar {
    background-color: #1e293b;
    border: none;
    border-bottom: 1px solid #334155;
}
QLabel#titleBarLabel {
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 700;
}
QPushButton#winMinBtn, QPushButton#winCloseBtn {
    background: transparent;
    border: none;
    border-radius: 6px;
    min-width: 40px;
    max-width: 40px;
    min-height: 30px;
    max-height: 30px;
    font-size: 15px;
    font-weight: 700;
    color: #cbd5e1;
    padding: 0;
}
QPushButton#winMinBtn:hover {
    background-color: #334155;
    color: #f8fafc;
}
QPushButton#winCloseBtn:hover {
    background-color: #dc2626;
    color: #ffffff;
}
QFrame#card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
}
QLabel#title {
    font-size: 18px;
    font-weight: 800;
    color: #38bdf8;
}
QLabel#subtitle {
    color: #94a3b8;
    font-size: 12px;
}
QLabel#svcName {
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f0;
}
QLabel#svcDetail {
    color: #94a3b8;
    font-size: 12px;
}
QLabel#badgeOn {
    background-color: #14532d;
    color: #86efac;
    border: 1px solid #22c55e;
    border-radius: 999px;
    padding: 4px 12px;
    font-weight: 700;
}
QLabel#badgeOff {
    background-color: #450a0a;
    color: #fca5a5;
    border: 1px solid #ef4444;
    border-radius: 999px;
    padding: 4px 12px;
    font-weight: 700;
}
QLabel#pairOn {
    background-color: #0ea5e9;
    color: #0f172a;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 800;
}
QLabel#pairOff {
    background-color: #334155;
    color: #f8fafc;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
}
QPushButton {
    cursor: pointer;
}
QPushButton#startBtn {
    background-color: #16a34a;
    color: white;
    font-weight: 800;
    border: none;
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 14px;
}
QPushButton#startBtn:hover { background-color: #15803d; }
QPushButton#startBtn:disabled { background-color: #334155; color: #94a3b8; }
QPushButton#stopBtn {
    background-color: #dc2626;
    color: white;
    font-weight: 800;
    border: none;
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 14px;
}
QPushButton#stopBtn:hover { background-color: #b91c1c; }
QPushButton#stopBtn:disabled { background-color: #334155; color: #94a3b8; }
QPushButton#restartBtn {
    background-color: #d97706;
    color: white;
    font-weight: 800;
    border: none;
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 14px;
}
QPushButton#restartBtn:hover { background-color: #b45309; }
QPushButton#restartBtn:disabled { background-color: #334155; color: #94a3b8; }
QPushButton#refreshBtn {
    background-color: #2563eb;
    color: white;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
}
QPushButton#refreshBtn:hover { background-color: #1d4ed8; }
QPlainTextEdit {
    background-color: #020617;
    border: 1px solid #334155;
    border-radius: 10px;
    color: #cbd5e1;
    font-family: Consolas, 'Cascadia Mono', monospace;
    font-size: 12px;
    padding: 8px;
}
QStatusBar {
    background: #0f172a;
    color: #94a3b8;
}
"""


def make_icon() -> QIcon:
    pm = QPixmap(64, 64)
    pm.fill(QColor(0, 0, 0, 0))
    p = QPainter(pm)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    p.setBrush(QColor("#0ea5e9"))
    p.setPen(Qt.PenStyle.NoPen)
    p.drawRoundedRect(4, 4, 56, 56, 14, 14)
    p.setBrush(QColor("#22c55e"))
    p.drawEllipse(14, 18, 16, 16)
    p.setBrush(QColor("#f59e0b"))
    p.drawEllipse(34, 18, 16, 16)
    p.setBrush(QColor("#ffffff"))
    p.drawRoundedRect(18, 40, 28, 8, 4, 4)
    p.end()
    return QIcon(pm)


class Worker(QThread):
    done = pyqtSignal(bool, str)
    line = pyqtSignal(str)

    def __init__(self, fn, manager: ServerManager):
        super().__init__()
        self.fn = fn
        self.manager = manager

    def run(self):
        old = self.manager.log
        self.manager.log = lambda m: self.line.emit(str(m))
        try:
            self.fn()
            self.done.emit(True, "완료")
        except Exception as e:
            self.line.emit(f"오류: {e}")
            self.done.emit(False, str(e))
        finally:
            self.manager.log = old


class StatusCard(QFrame):
    def __init__(self, title: str):
        super().__init__()
        self.setObjectName("card")
        lay = QVBoxLayout(self)
        lay.setContentsMargins(16, 14, 16, 14)
        lay.setSpacing(8)
        top = QHBoxLayout()
        self.name = QLabel(title)
        self.name.setObjectName("svcName")
        self.badge = QLabel("중지")
        self.badge.setObjectName("badgeOff")
        self.badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        top.addWidget(self.name)
        top.addStretch(1)
        top.addWidget(self.badge)
        self.detail = QLabel("-")
        self.detail.setObjectName("svcDetail")
        self.detail.setWordWrap(True)
        lay.addLayout(top)
        lay.addWidget(self.detail)

    def apply(self, st: ServiceStatus):
        self.name.setText(st.name)
        self.detail.setText(st.detail or f"포트 {st.port}")
        if st.running:
            self.badge.setText("실행 중")
            self.badge.setObjectName("badgeOn")
        else:
            self.badge.setText("중지")
            self.badge.setObjectName("badgeOff")
        self.badge.style().unpolish(self.badge)
        self.badge.style().polish(self.badge)


class TitleBar(QFrame):
    """커스텀 타이틀바 — 이동 커서 + 내리기/종료 pointer (네이티브 버튼은 커서 변경 불가)."""

    def __init__(self, host: QMainWindow):
        super().__init__(host)
        self._host = host
        self.setObjectName("titleBar")
        self.setFixedHeight(40)
        self.setCursor(Qt.CursorShape.SizeAllCursor)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(12, 0, 6, 0)
        lay.setSpacing(6)

        icon = QLabel()
        icon.setPixmap(make_icon().pixmap(18, 18))
        icon.setFixedSize(18, 18)
        icon.setCursor(Qt.CursorShape.SizeAllCursor)

        label = QLabel("YUNSEUL-HOME Server")
        label.setObjectName("titleBarLabel")
        label.setCursor(Qt.CursorShape.SizeAllCursor)

        self.btn_min = QPushButton("─")
        self.btn_min.setObjectName("winMinBtn")
        self.btn_min.setToolTip("트레이로 내리기")
        self.btn_min.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_min.clicked.connect(host.showMinimized)

        self.btn_close = QPushButton("×")
        self.btn_close.setObjectName("winCloseBtn")
        self.btn_close.setToolTip("프로그램 종료")
        self.btn_close.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_close.clicked.connect(host.close)

        lay.addWidget(icon)
        lay.addWidget(label)
        lay.addStretch(1)
        lay.addWidget(self.btn_min)
        lay.addWidget(self.btn_close)

    def _is_window_btn(self, widget) -> bool:
        while widget is not None and widget is not self:
            if widget is self.btn_min or widget is self.btn_close:
                return True
            widget = widget.parentWidget()
        return False

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            # 내리기/종료 버튼이 아니면 시스템 창 이동
            child = self.childAt(event.position().toPoint())
            if self._is_window_btn(child):
                super().mousePressEvent(event)
                return
            wh = self._host.windowHandle()
            if wh is not None:
                QApplication.setOverrideCursor(Qt.CursorShape.SizeAllCursor)
                wh.startSystemMove()
                QApplication.restoreOverrideCursor()
                event.accept()
                return
        super().mousePressEvent(event)

    def mouseDoubleClickEvent(self, event):
        # 더블클릭으로 최대화하지 않음
        event.accept()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("YUNSEUL-HOME Server")
        self.setWindowIcon(make_icon())
        # 네이티브 타이틀바 대신 커스텀 — 커서(이동/pointer) 제어 가능
        self.setWindowFlags(
            Qt.WindowType.Window | Qt.WindowType.FramelessWindowHint
        )
        self.resize(560, 640)
        self.manager = ServerManager(log=self.append_log)
        self.worker: Worker | None = None
        self._busy = False
        self._job: str | None = None  # 'start' | 'stop' | 'restart' | None
        self._pending_restart = False
        self._force_quit = False
        self._tray_hint_shown = False
        self._both_running = False  # refresh / 작업 결과로만 갱신 (트레이 메뉴에서 재조회 금지)
        self._window_moving = False
        self._move_idle = QTimer(self)
        self._move_idle.setSingleShot(True)
        self._move_idle.setInterval(150)
        self._move_idle.timeout.connect(self._on_move_idle)

        shell = QWidget()
        shell.setObjectName("shell")
        self.setCentralWidget(shell)
        shell_lay = QVBoxLayout(shell)
        shell_lay.setContentsMargins(1, 1, 1, 1)
        shell_lay.setSpacing(0)

        self.title_bar = TitleBar(self)
        shell_lay.addWidget(self.title_bar)

        root = QWidget()
        shell_lay.addWidget(root, 1)
        layout = QVBoxLayout(root)
        layout.setContentsMargins(18, 14, 18, 18)
        layout.setSpacing(14)

        head = QVBoxLayout()
        title = QLabel("YUNSEUL-HOME Server")
        title.setObjectName("title")
        sub = QLabel("Nginx + Node API 를 함께 시작 · 종료합니다")
        sub.setObjectName("subtitle")
        head.addWidget(title)
        head.addWidget(sub)
        layout.addLayout(head)

        self.pair = QLabel("서버 상태 확인 중…")
        self.pair.setObjectName("pairOff")
        self.pair.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.pair)

        cards = QHBoxLayout()
        cards.setSpacing(12)
        self.nginx_card = StatusCard("Nginx")
        self.api_card = StatusCard("Node API")
        cards.addWidget(self.nginx_card)
        cards.addWidget(self.api_card)
        layout.addLayout(cards)

        row = QHBoxLayout()
        row.setSpacing(10)
        self.btn_start = QPushButton(LBL_START)
        self.btn_start.setObjectName("startBtn")
        self.btn_stop = QPushButton(LBL_STOP)
        self.btn_stop.setObjectName("stopBtn")
        self.btn_restart = QPushButton(LBL_RESTART)
        self.btn_restart.setObjectName("restartBtn")
        self.btn_refresh = QPushButton("새로고침")
        self.btn_refresh.setObjectName("refreshBtn")
        for b in (self.btn_start, self.btn_stop, self.btn_restart, self.btn_refresh):
            b.setCursor(Qt.CursorShape.PointingHandCursor)
        row.addWidget(self.btn_start, 2)
        row.addWidget(self.btn_stop, 2)
        row.addWidget(self.btn_restart, 2)
        row.addWidget(self.btn_refresh, 1)
        layout.addLayout(row)

        hint = QLabel(
            f"Nginx :{self.manager.nginx_port}  ·  Node API :{self.manager.api_port}\n"
            "둘 다 켜져야 홈페이지가 정상 동작합니다.\n"
            "내리기(─)는 트레이로 보냅니다. 트레이에서 다시 열 수 있습니다. X는 종료합니다."
        )
        hint.setObjectName("subtitle")
        hint.setWordWrap(True)
        layout.addWidget(hint)

        self.log = QPlainTextEdit()
        self.log.setReadOnly(True)
        self.log.setMaximumBlockCount(500)
        layout.addWidget(self.log, 1)

        self.btn_start.clicked.connect(self.on_start)
        self.btn_stop.clicked.connect(self.on_stop)
        self.btn_restart.clicked.connect(self.on_restart)
        self.btn_refresh.clicked.connect(self.refresh)

        self.timer = QTimer(self)
        self.timer.setInterval(2000)
        self.timer.timeout.connect(self.refresh)
        self.timer.start()

        self.setup_tray()

        self.append_log(f"설정: {self.manager.config_path}")
        self.append_log(f"Nginx: {self.manager.nginx_exe_path()}")
        self.append_log(f"API: {self.manager.api_entry_path()}")
        self.refresh()

    def setup_tray(self):
        if not QSystemTrayIcon.isSystemTrayAvailable():
            self.append_log("시스템 트레이를 사용할 수 없습니다.")
            self.tray = None
            self.tray_menu = None
            return
        self.tray = QSystemTrayIcon(make_icon(), self)
        self.tray.setToolTip("YUNSEUL-HOME Server")
        # 부모 + self 참조 필수 (로컬 QMenu는 GC되어 트레이 클릭/메뉴가 전부 死음)
        self.tray_menu = QMenu(self)
        self.act_show = QAction("프로그램 화면 보기", self)
        self.act_show.triggered.connect(self.show_from_tray)
        self.act_start = QAction(LBL_START, self)
        self.act_start.triggered.connect(self.on_start)
        self.act_stop = QAction(LBL_STOP, self)
        self.act_stop.triggered.connect(self.on_stop)
        self.act_restart = QAction("서버 전체 재시작", self)
        self.act_restart.triggered.connect(self.on_restart)
        self.act_quit = QAction("프로그램 종료", self)
        self.act_quit.triggered.connect(self.quit_app)
        self.tray_menu.addAction(self.act_show)
        self.tray_menu.addSeparator()
        self.tray_menu.addAction(self.act_start)
        self.tray_menu.addAction(self.act_stop)
        self.tray_menu.addAction(self.act_restart)
        self.tray_menu.addSeparator()
        self.tray_menu.addAction(self.act_quit)
        self.tray_menu.aboutToShow.connect(self.sync_tray_menu)
        self.tray.setContextMenu(self.tray_menu)
        self.tray.activated.connect(self.on_tray_activated)
        self.tray.show()
        self.sync_tray_menu()

    def sync_tray_menu(self):
        if not self.tray:
            return
        # 프로그램 화면 보기는 항상 표시
        self.act_show.setVisible(True)
        # aboutToShow에서 무거운 상태조회 금지 → 캐시만 사용
        if self._busy:
            self.act_start.setVisible(False)
            self.act_stop.setVisible(False)
            self.act_restart.setVisible(False)
            return
        running = self._both_running
        # 중지: 시작만 / 실행 중: 종료 + 전체 재시작만
        self.act_start.setVisible(not running)
        self.act_stop.setVisible(running)
        self.act_restart.setVisible(running)

    def show_from_tray(self):
        self.showNormal()
        self.setWindowState(self.windowState() & ~Qt.WindowState.WindowMinimized)
        self.raise_()
        self.activateWindow()
        app = QApplication.instance()
        if app is not None:
            app.setActiveWindow(self)

    def on_tray_activated(self, reason):
        # 더블클릭(및 좌클릭) → 프로그램 화면 다시 표시
        if reason in (
            QSystemTrayIcon.ActivationReason.DoubleClick,
            QSystemTrayIcon.ActivationReason.Trigger,
        ):
            self.show_from_tray()

    def hide_to_tray(self):
        """내리기(최소화) → 트레이. 더블클릭/메뉴로 다시 열 수 있음."""
        if not self.tray:
            return
        self.hide()
        self.setWindowState(Qt.WindowState.WindowNoState)
        if not self._tray_hint_shown:
            self._tray_hint_shown = True
            self.tray.showMessage(
                "YUNSEUL-HOME Server",
                "트레이로 보냈습니다. 더블클릭 또는 「프로그램 화면 보기」로 다시 열 수 있습니다.",
                QSystemTrayIcon.MessageIcon.Information,
                3000,
            )

    def changeEvent(self, event):
        # 내리기(─) → 트레이
        if (
            event.type() == QEvent.Type.WindowStateChange
            and self.tray
            and self.isMinimized()
            and not self._force_quit
        ):
            QTimer.singleShot(0, self.hide_to_tray)
        super().changeEvent(event)

    def moveEvent(self, event):
        # 드래그 중 상태폴링이 끼어들면 창이 버벅임 → 이동 중엔 잠시 중단
        if not self._window_moving:
            self._window_moving = True
            self.timer.stop()
            QApplication.setOverrideCursor(Qt.CursorShape.SizeAllCursor)
        self._move_idle.start()
        super().moveEvent(event)

    def _on_move_idle(self):
        self._window_moving = False
        while QApplication.overrideCursor() is not None:
            QApplication.restoreOverrideCursor()
        if not self._busy and not self._force_quit:
            self.timer.start()

    def closeEvent(self, event):
        # X → 프로그램 종료 확인 (트레이로 숨기지 않음)
        if self._force_quit:
            event.accept()
            return
        event.ignore()
        self.quit_app()

    def quit_app(self):
        # 종료 확인용은 소켓만 (빠른 체크)
        _, _, running = self.manager.pair_status(with_pids=False)
        self._both_running = running
        box = QMessageBox(self)
        box.setIcon(QMessageBox.Icon.Question)
        box.setWindowTitle("프로그램 종료")
        box.setStyleSheet(DARK)
        if running:
            # 서버 실행 중: 서버 종료 후 종료 / 취소 만
            box.setText("서버가 실행 중입니다.\n서버를 종료한 뒤 프로그램을 종료할까요?")
            box.setStandardButtons(
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.Cancel
            )
            box.setDefaultButton(QMessageBox.StandardButton.Cancel)
            box.button(QMessageBox.StandardButton.Yes).setText("서버 종료 후 종료")
            box.button(QMessageBox.StandardButton.Cancel).setText("취소")
            ans = box.exec()
            if ans != QMessageBox.StandardButton.Yes:
                return
            try:
                self.manager.stop_pair()
            except Exception as e:
                self.append_log(f"서버 종료 실패: {e}")
                fail = QMessageBox(self)
                fail.setIcon(QMessageBox.Icon.Warning)
                fail.setWindowTitle("종료 실패")
                fail.setText(f"서버 종료에 실패했습니다.\n{e}")
                fail.setStyleSheet(DARK)
                fail.exec()
                return
        else:
            # 서버 전부 종료 상태: 종료 / 취소
            box.setText("서버가 모두 종료된 상태입니다.\n프로그램을 종료할까요?")
            box.setStandardButtons(
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.Cancel
            )
            box.setDefaultButton(QMessageBox.StandardButton.Cancel)
            box.button(QMessageBox.StandardButton.Yes).setText("종료")
            box.button(QMessageBox.StandardButton.Cancel).setText("취소")
            ans = box.exec()
            if ans != QMessageBox.StandardButton.Yes:
                return

        self._force_quit = True
        if self.tray:
            self.tray.hide()
        QApplication.instance().quit()

    def append_log(self, message: str):
        self.log.appendPlainText(message)
        self.log.verticalScrollBar().setValue(self.log.verticalScrollBar().maximum())

    def set_pair_banner(self, text: str, on: bool):
        self.pair.setText(text)
        self.pair.setObjectName("pairOn" if on else "pairOff")
        self.pair.style().unpolish(self.pair)
        self.pair.style().polish(self.pair)

    def sync_action_buttons(self, both_running: bool | None = None):
        if both_running is None:
            both_running = self._both_running
        self.btn_refresh.setEnabled(not self._busy)

        if self._job == "start":
            self.btn_start.setText(LBL_STARTING)
            self.btn_stop.setText(LBL_STOP)
            self.btn_restart.setText(LBL_RESTART)
            self.btn_start.setEnabled(False)
            self.btn_stop.setEnabled(False)
            self.btn_restart.setEnabled(False)
            self.sync_tray_menu()
            return
        if self._job in ("stop", "restart"):
            self.btn_start.setText(LBL_RUNNING if both_running else LBL_START)
            self.btn_stop.setText(LBL_STOPPING if self._job == "stop" else LBL_STOP)
            self.btn_restart.setText(LBL_RESTARTING if self._job == "restart" else LBL_RESTART)
            if self._job == "restart":
                self.btn_stop.setText(LBL_STOPPING)
            self.btn_start.setEnabled(False)
            self.btn_stop.setEnabled(False)
            self.btn_restart.setEnabled(False)
            self.sync_tray_menu()
            return

        # 대기: 실행 중이면 시작=실행 중(비활성), 종료·재시작 활성
        self.btn_restart.setText(LBL_RESTART)
        if both_running:
            self.btn_start.setText(LBL_RUNNING)
            self.btn_stop.setText(LBL_STOP)
            self.btn_start.setEnabled(False)
            self.btn_stop.setEnabled(True)
            self.btn_restart.setEnabled(True)
        else:
            self.btn_start.setText(LBL_START)
            self.btn_stop.setText(LBL_STOP)
            self.btn_start.setEnabled(True)
            self.btn_stop.setEnabled(False)
            self.btn_restart.setEnabled(False)
        self.sync_tray_menu()

    def refresh(self):
        if self._window_moving:
            return
        # 주기 갱신은 소켓만 — PID/외부프로세스 조회 없음 (드래그 버벅임 방지)
        nginx, api, ok = self.manager.pair_status(with_pids=False)
        self._both_running = ok
        self.nginx_card.apply(nginx)
        self.api_card.apply(api)
        if self._job == "start":
            self.set_pair_banner(LBL_STARTING, False)
        elif self._job == "restart":
            self.set_pair_banner(LBL_RESTARTING, False)
        elif self._job == "stop":
            self.set_pair_banner(LBL_STOPPING, False)
        elif ok:
            self.set_pair_banner("서버 실행 중 — Nginx + Node API", True)
        else:
            parts = [
                "Nginx ON" if nginx.running else "Nginx OFF",
                "Node ON" if api.running else "Node OFF",
            ]
            self.set_pair_banner("서버 중지 — " + " / ".join(parts), False)
        self.sync_action_buttons(ok)
        self.statusBar().showMessage(
            f"사이트 {self.manager.site_url}  ·  둘 다 실행되어야 함"
        )

    def _flush_ui(self):
        """버튼/배너 문구가 실제로 그려지도록 이벤트 루프를 한 번 돌린다."""
        for w in (self.btn_start, self.btn_stop, self.btn_restart, self.pair):
            w.update()
            w.repaint()
        QApplication.processEvents(QEventLoop.ProcessEventsFlag.AllEvents)

    def _paint_busy_ui(self, job: str):
        """① 버튼명/배너 먼저 변경 → ② 화면에 그린 뒤 → ③ 호출측에서 작업 시작."""
        self._busy = True
        self._job = job
        self.timer.stop()

        # 1) 문구를 최우선으로 바꾼다 (비활성화보다 앞)
        if job == "start":
            self.btn_start.setText(LBL_STARTING)
            self.btn_stop.setText(LBL_STOP)
            self.btn_restart.setText(LBL_RESTART)
            self.set_pair_banner(LBL_STARTING, False)
        elif job == "restart":
            self.btn_start.setText(LBL_RUNNING)
            self.btn_stop.setText(LBL_STOPPING)
            self.btn_restart.setText(LBL_RESTARTING)
            self.set_pair_banner(LBL_RESTARTING, False)
        else:  # stop
            self.btn_start.setText(LBL_RUNNING)
            self.btn_stop.setText(LBL_STOPPING)
            self.btn_restart.setText(LBL_RESTART)
            self.set_pair_banner(LBL_STOPPING, False)

        self.btn_start.setEnabled(False)
        self.btn_stop.setEnabled(False)
        self.btn_restart.setEnabled(False)
        self.btn_refresh.setEnabled(False)

        # 2) 느린 상태조회 전에 반드시 화면에 그림
        self._flush_ui()
        self.sync_tray_menu()

        if job == "start":
            self.append_log("—— 서버 시작 ——")
        elif job == "restart":
            self.append_log("—— 서버 전체 재시작 (종료 → 시작) ——")
        else:
            self.append_log("—— 서버 종료 ——")
        self._flush_ui()

    def _begin_worker(self, fn):
        if self.worker and self.worker.isRunning():
            return
        self.worker = Worker(fn, self.manager)
        self.worker.line.connect(self.append_log)
        self.worker.done.connect(self.on_job_done)
        self.worker.start()

    def _run_job_after_paint(self, job: str, fn):
        """버튼 문구를 먼저 보여 준 뒤, 짧게 기다렸다가 실제 작업을 시작한다."""
        self._paint_busy_ui(job)
        QTimer.singleShot(UI_PAINT_DELAY_MS, lambda: self._begin_worker(fn))

    def on_job_done(self, ok: bool, message: str):
        job = self._job
        pending = self._pending_restart
        self._busy = False
        self._job = None
        self.timer.start()

        # 재시작: 종료가 끝나면 이어서 시작
        if pending and job == "restart":
            self._pending_restart = False
            self.refresh()
            if ok:
                self.append_log("종료 완료 → 서버 시작으로 이어갑니다")
                QTimer.singleShot(0, self.on_start)
                return
            box = QMessageBox(self)
            box.setIcon(QMessageBox.Icon.Warning)
            box.setWindowTitle("재시작 실패")
            box.setText(f"종료 단계에서 실패했습니다.\n{message}")
            box.setStyleSheet(DARK)
            box.exec()
            return

        self._pending_restart = False
        self.refresh()
        if not ok:
            box = QMessageBox(self)
            box.setIcon(QMessageBox.Icon.Warning)
            box.setWindowTitle("실패")
            box.setText(message)
            box.setStyleSheet(DARK)
            box.exec()

    def on_start(self):
        if self._busy:
            return
        # ① 「서버 시작 중...」 표시 → ② 그다음 시작 처리
        self._run_job_after_paint("start", self.manager.start_pair)

    def on_stop(self):
        if self._busy:
            return
        self._pending_restart = False
        # ① 「서버 종료 중...」 표시 → ② 그다음 종료 처리
        self._run_job_after_paint("stop", self.manager.stop_pair)

    def on_restart(self):
        if self._busy:
            return
        if not self._both_running:
            return
        # 종료 → (완료 후) 시작
        self._pending_restart = True
        self._run_job_after_paint("restart", self.manager.stop_pair)


def main():
    # Ensure local imports work when frozen or launched from elsewhere.
    os.chdir(app_dir())
    if str(app_dir()) not in sys.path:
        sys.path.insert(0, str(app_dir()))
    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)  # X로 숨겨도 트레이에서 유지
    app.setStyle("Fusion")
    app.setWindowIcon(make_icon())
    win = MainWindow()
    win.setStyleSheet(DARK)
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        raise
