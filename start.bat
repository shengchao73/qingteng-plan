@echo off
chcp 65001
echo 正在检查运行环境...

:: 检查Node.js是否安装
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js环境，请先安装Node.js
    echo 您可以从 https://nodejs.org 下载安装包
    pause
    exit /b 1
)



:: 启动服务器
echo 正在启动服务器...
start /B npm start

:: 等待服务器启动
timeout /t 2 /nobreak > nul

:: 打开浏览器
echo 正在打开浏览器...
start http://localhost:3000

echo 启动完成！
echo 如需关闭服务器，请直接关闭此窗口
pause > nul