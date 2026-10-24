@echo off
chcp 65001 > nul
title CHECK-IN GOLF MƯỜNG THANH 2026
echo ========================================================
echo   KHỞI CHẠY HỆ THỐNG CHECK-IN GIẢI GOLF MƯỜNG THANH 2026
echo ========================================================
echo Đang mở trình duyệt và máy chủ...
start http://localhost:8080
python server.py
pause
