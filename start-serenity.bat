@echo off
setlocal

cd /d "%~dp0"

echo Starting Serenity...
echo.
echo This launcher will automatically choose another port if 5173 or 8787 is already in use.
echo Close this window to stop the local dev services.
echo.

npm run dev

echo.
echo Serenity stopped. Press any key to close this window.
pause > nul
