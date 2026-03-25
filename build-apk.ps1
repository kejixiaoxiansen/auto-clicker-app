# 自动点击器App - APK构建脚本 (PowerShell)
$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$Message]" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[错误] $Message" -ForegroundColor Red
}

Clear-Host
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "   自动点击器App - APK构建脚本" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# 检查Node.js
Write-Step "1/6"
Write-Host "检查Node.js环境..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js已安装: $nodeVersion"
} catch {
    Write-Error "未找到Node.js，请先安装Node.js 18+"
    Write-Host "下载地址: https://nodejs.org/"
    Read-Host "按回车键退出"
    exit 1
}

# 检查Java
Write-Step "2/6"
Write-Host "检查Java环境..."
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Success "Java已安装"
    Write-Host "  $javaVersion"
} catch {
    Write-Error "未找到Java JDK，请先安装JDK 11或17"
    Write-Host "下载地址: https://adoptium.net/"
    Read-Host "按回车键退出"
    exit 1
}

# 检查Android SDK
Write-Step "3/6"
Write-Host "检查Android SDK..."
$androidSdk = $env:ANDROID_SDK_ROOT
if (-not $androidSdk) {
    $androidSdk = $env:ANDROID_HOME
}
if ($androidSdk) {
    Write-Success "Android SDK: $androidSdk"
} else {
    Write-Warning "未设置ANDROID_SDK_ROOT环境变量"
    Write-Host "请设置Android SDK路径或安装Android Studio"
    Write-Host "下载地址: https://developer.android.com/studio"
}

# 安装依赖
Write-Step "4/6"
Write-Host "安装项目依赖..."
try {
    npm install
    Write-Success "依赖安装完成"
} catch {
    Write-Error "依赖安装失败"
    Write-Host $_.Exception.Message
    Read-Host "按回车键退出"
    exit 1
}

# 构建APK
Write-Step "5/6"
Write-Host "开始构建APK..."
Set-Location android

try {
    # 清理旧构建
    Write-Host "清理旧构建..."
    .\gradlew clean --quiet
    
    # 构建Release版本
    Write-Host "构建Release APK..."
    .\gradlew assembleRelease
    
    Write-Success "APK构建成功"
} catch {
    Write-Error "APK构建失败"
    Write-Host $_.Exception.Message
    Set-Location ..
    Read-Host "按回车键退出"
    exit 1
}

Set-Location ..

# 复制APK到输出目录
Write-Step "6/6"
Write-Host "复制APK文件..."
if (-not (Test-Path "output")) {
    New-Item -ItemType Directory -Name "output" | Out-Null
}

$sourceApk = "android\app\build\outputs\apk\release\app-release.apk"
$destApk = "output\AutoClicker-v1.0.0.apk"

Copy-Item $sourceApk $destApk -Force

Write-Success "APK已复制到: $destApk"

# 显示文件信息
$fileInfo = Get-Item $destApk
$fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   构建成功！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "APK文件信息:" -ForegroundColor Yellow
Write-Host "  文件名: $($fileInfo.Name)"
Write-Host "  大小: $fileSizeMB MB"
Write-Host "  路径: $($fileInfo.FullName)"
Write-Host ""
Write-Host "安装方法:" -ForegroundColor Yellow
Write-Host "  1. 将APK传输到Android手机"
Write-Host "  2. 在手机上点击安装"
Write-Host "  3. 允许安装未知来源应用"
Write-Host "  4. 开启无障碍服务权限"
Write-Host ""
Write-Host "使用说明:" -ForegroundColor Yellow
Write-Host "  • Android 7.0+ 必需"
Write-Host "  • 需要开启无障碍服务"
Write-Host "  • 需要悬浮窗权限"
Write-Host ""

Read-Host "按回车键退出"
