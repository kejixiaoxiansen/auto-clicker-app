@echo off
chcp 65001 >nul
echo ==========================================
echo   自动点击器App - APK构建脚本
echo ==========================================
echo.

REM 检查Node.js
echo [1/6] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Node.js，请先安装Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js已安装

REM 检查Java
echo [2/6] 检查Java环境...
java -version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Java JDK，请先安装JDK 11或17
    echo 下载地址: https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java已安装

REM 检查Android SDK
echo [3/6] 检查Android SDK...
if not defined ANDROID_SDK_ROOT (
    if not defined ANDROID_HOME (
        echo [警告] 未设置ANDROID_SDK_ROOT环境变量
        echo 请设置Android SDK路径或安装Android Studio
        pause
    ) else (
        set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
        echo [OK] 使用ANDROID_HOME: %ANDROID_HOME%
    )
) else (
    echo [OK] Android SDK: %ANDROID_SDK_ROOT%
)

REM 安装依赖
echo [4/6] 安装项目依赖...
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [OK] 依赖安装完成

REM 构建APK
echo [5/6] 开始构建APK...
cd android

REM 清理旧构建
call .\gradlew clean

REM 构建Release版本
call .\gradlew assembleRelease
if errorlevel 1 (
    echo [错误] APK构建失败
    cd ..
    pause
    exit /b 1
)

cd ..

REM 复制APK到输出目录
echo [6/6] 复制APK文件...
if not exist "output" mkdir output

copy "android\app\build\outputs\apk\release\app-release.apk" "output\AutoClicker-v1.0.0.apk" >nul

echo.
echo ==========================================
echo   构建成功！
echo ==========================================
echo.
echo APK文件位置:
echo   output\AutoClicker-v1.0.0.apk
echo.
echo 文件大小:
for %%I in ("output\AutoClicker-v1.0.0.apk") do echo   %%~zI bytes
echo.
echo 安装方法:
echo   1. 将APK传输到Android手机
echo   2. 在手机上点击安装
echo   3. 允许安装未知来源应用
echo   4. 开启无障碍服务权限
echo.
pause
