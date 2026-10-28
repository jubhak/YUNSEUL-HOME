@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo Building YUNSEUL-HOME-SERVER.exe ...
python -m PyInstaller --noconfirm --distpath . --workpath build YUNSEUL-HOME-SERVER.spec
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)
echo.
echo Done: %~dp0YUNSEUL-HOME-SERVER.exe
echo config.json next to the exe overrides bundled settings.
pause
