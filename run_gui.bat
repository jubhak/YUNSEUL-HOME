@echo off
chcp 65001 > nul
cd /d "%~dp0"
title YUNSEUL-HOME Server
echo ========================================================
echo   YUNSEUL-HOME Server : Nginx + Node API 세트 제어
echo ========================================================
python app.py
if errorlevel 1 pause
