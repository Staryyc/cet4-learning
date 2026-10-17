@echo off
title 四级备考 · 本地服务器
cd /d "%~dp0"
echo ============================================
echo    四级备考 · 个人学习网页
echo    正在启动本地服务器 (127.0.0.1:8000)
echo ============================================
echo.
start "CET4Server" /min python -m http.server 8000 --bind 127.0.0.1
timeout /t 2 >nul
start "" http://127.0.0.1:8000/
echo 服务器已启动,浏览器已打开。
echo 如需停止服务,请关闭最小化的 CET4Server 窗口。
echo.
pause
