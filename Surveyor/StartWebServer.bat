:: Start Python Webserver with CGI Capability
@echo off
title Python Web Server
:: Change directory to location of this batch file
:: Must be the directory containing index.html
REM use the following line if hostname does not resolve your IP address
REM SETLOCAL
REM for /f "tokens=2 delims=[]" %%f in ('ping -4 -n 1 %computername% ^|find /i "pinging"') do set IP=%%f
cd %~dp0
echo.
echo * * * * * * * * *  P Y T H O N   W E B   S E R V E R  * * * * * * * * * * * * *
echo *
echo * Use HTTP://%computername%:8000/index.html
echo *                      in your web browser URL to run a Survey.
echo *
echo * Or HTTP://%computername%:8000/html/login.html
echo *           in your web browser URL to Administer Users and Create Surveys.
echo *
echo * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
echo.
echo This console will wait for the Web Server to Exit.
echo Type: 'Control+C' to stop the server, then answer: 'y' to Exit the job.
echo.
echo Starting Python CGI Web Server on %DATE% at %TIME%...
c:\Python27\python -m CGIHTTPServer 8000
