@echo off
setlocal
cd /d "%~dp0"
set "FLOODCARE_STAFF_PASSWORD=FCSFight"
echo FloodCare Easy Start - Staff password: FCSFight
echo Open http://127.0.0.1:8765/staff.html
echo Keep this window open while using FloodCare.
py run.py --port 8765
if errorlevel 1 echo Could not start. Check the error above. Python must be installed.
pause
