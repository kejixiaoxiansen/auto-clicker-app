# 自动点击器App - 快速开始

## 🚀 三种使用方式

### 方式一：直接安装APK（最简单）
如果你已经有编译好的APK文件：

1. 将 `AutoClicker-v1.0.0.apk` 复制到手机
2. 在手机上点击安装
3. 开启无障碍服务权限
4. 开始使用！

---

### 方式二：从源码构建APK
如果你有Android开发环境：

#### 环境准备
1. 安装 **Node.js 18+**: https://nodejs.org/
2. 安装 **Java JDK 17**: https://adoptium.net/
3. 安装 **Android Studio**: https://developer.android.com/studio

#### 一键构建
```powershell
# PowerShell
.\build-apk.ps1
```

或

```batch
:: CMD
build-apk.bat
```

构建完成后，APK文件在 `output/AutoClicker-v1.0.0.apk`

---

### 方式三：在线预览（无需安装）
打开 `demo/index.html` 在浏览器中预览App界面和交互。

---

## 📋 目录说明

```
auto-clicker-app/
├── src/                    # React Native 源代码
│   ├── components/         # UI组件
│   ├── screens/            # 页面
│   ├── stores/             # 状态管理
│   └── ...
├── android/                # Android原生代码
│   ├── app/                # 应用代码
│   └── gradle/             # Gradle配置
├── demo/                   # 网页演示
│   └── index.html          # 在线预览
├── output/                 # 构建输出
│   └── AutoClicker-v1.0.0.apk  # 生成的APK
├── build-apk.bat           # Windows构建脚本(CMD)
├── build-apk.ps1           # Windows构建脚本(PowerShell)
├── package-for-release.bat # 打包发布脚本
├── README.md               # 项目说明
├── INSTALL.md              # 详细安装指南
├── BUILD_GUIDE.md          # 构建指南
└── QUICK_START.md          # 本文件
```

---

## ⚡ 快速构建检查清单

构建前请确认：

- [ ] Node.js 已安装 (`node --version`)
- [ ] Java JDK 已安装 (`java -version`)
- [ ] Android SDK 已配置 (`echo %ANDROID_SDK_ROOT%`)
- [ ] 已运行 `npm install` 安装依赖

---

## 🔧 常见问题

### Q: 没有Android开发环境怎么办？
**A:** 可以：
1. 找有环境的朋友帮忙构建
2. 使用GitHub Actions等CI服务自动构建
3. 使用Expo等云服务构建

### Q: 构建失败怎么办？
**A:** 检查：
1. 所有环境变量是否正确设置
2. Android SDK是否包含必要的构建工具
3. 查看 `android/gradle.properties` 配置

### Q: 安装后无法点击？
**A:** 必须开启无障碍服务：
```
设置 → 无障碍 → 已安装的服务 → 自动点击器 → 开启
```

---

## 📱 支持设备

- Android 7.0+ (API 24+)
- 支持arm64和armeabi架构
- 需要无障碍服务权限

---

## 🆘 需要帮助？

查看详细文档：
- `INSTALL.md` - 完整安装指南
- `BUILD_GUIDE.md` - 详细构建说明
- `README.md` - 项目介绍和功能说明
