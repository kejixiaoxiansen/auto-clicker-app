@echo off
chcp 65001 >nul
echo ==========================================
echo   自动点击器App - 发布打包工具
echo ==========================================
echo.

set "RELEASE_DIR=AutoClicker-Release-v1.0.0"
set "RELEASE_ZIP=AutoClicker-Release-v1.0.0.zip"

echo [1/5] 创建发布目录...
if exist "%RELEASE_DIR%" rmdir /s /q "%RELEASE_DIR%"
mkdir "%RELEASE_DIR%"

echo [2/5] 复制核心文件...
mkdir "%RELEASE_DIR%\src"
xcopy /s /e /i "src" "%RELEASE_DIR%\src\" >nul

copy "App.tsx" "%RELEASE_DIR%\" >nul
copy "index.js" "%RELEASE_DIR%\" >nul
copy "package.json" "%RELEASE_DIR%\" >nul
copy "tsconfig.json" "%RELEASE_DIR%\" >nul
copy "app.json" "%RELEASE_DIR%\" >nul

echo [3/5] 复制Android项目...
mkdir "%RELEASE_DIR%\android"
xcopy /s /e /i "android" "%RELEASE_DIR%\android\" >nul

echo [4/5] 复制文档...
copy "README.md" "%RELEASE_DIR%\" >nul
copy "INSTALL.md" "%RELEASE_DIR%\" >nul
copy "BUILD_GUIDE.md" "%RELEASE_DIR%\" >nul
copy "build-apk.bat" "%RELEASE_DIR%\" >nul
copy "build-apk.ps1" "%RELEASE_DIR%\" >nul

echo [5/5] 创建ZIP压缩包...
if exist "%RELEASE_ZIP%" del "%RELEASE_ZIP%"
powershell -Command "Compress-Archive -Path '%RELEASE_DIR%' -DestinationPath '%RELEASE_ZIP%' -Force"

rmdir /s /q "%RELEASE_DIR%"

echo.
echo ==========================================
echo   打包完成！
echo ==========================================
echo.
echo 发布包: %RELEASE_ZIP%
echo.
for %%I in ("%RELEASE_ZIP%") do echo 文件大小: %%~zI bytes
echo.
echo 包含内容:
echo   - 完整源代码
echo   - Android原生代码
echo   - 构建脚本 (bat + ps1)
echo   - 安装指南
echo   - 构建指南
echo.
echo 使用方法:
echo   1. 解压 %RELEASE_ZIP%
echo   2. 运行 build-apk.bat 构建APK
echo   3. 或查看 INSTALL.md 了解安装方法
echo.
pause
