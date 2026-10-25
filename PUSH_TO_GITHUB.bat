@echo off
chcp 65001 > nul
title PUSH CODE LEN GITHUB - MTGOLF
echo ========================================================
echo   ĐANG ĐẨY (PUSH) MÃ NGUỒN LÊN GITHUB: vptdmt/mtgolf
echo ========================================================
echo.
git push -u origin main
echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo [THANH CONG] Da day code len https://github.com/vptdmt/mtgolf !
) else (
    echo [CHU Y] Neu bao loi xung dot hoac can dang nhap:
    echo 1. Hay dang nhap tai khoan GitHub khi trinh duyet bat len.
    echo 2. Hoac chay lenh: git push -u origin main --force
)
echo ========================================================
pause
