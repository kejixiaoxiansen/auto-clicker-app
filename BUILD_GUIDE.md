# 自动点击器 App - 构建指南

## 项目概述
基于 React Native + Kotlin 的 Android 自动点击器应用。

## 环境要求
- Node.js >= 18
- JDK >= 11
- Android Studio (最新版)
- Android SDK (API 24+)

## 构建步骤

### 1. 安装依赖
```bash
cd auto-clicker-app
npm install
```

### 2. 配置 Android 项目
```bash
cd android
```

### 3. 构建 Release APK
```bash
cd android
./gradlew assembleRelease
```

APK 输出路径:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 4. 安装到设备
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## 权限配置

### 必需权限
1. **无障碍服务** - 用于执行点击操作
2. **悬浮窗权限** - 用于显示控制按钮

### 启用步骤
1. 安装应用后，打开系统设置
2. 进入 无障碍 → 自动点击器
3. 开启无障碍服务
4. 返回应用，授予悬浮窗权限

## 项目结构
```
auto-clicker-app/
├── src/
│   ├── components/       # UI组件
│   ├── screens/          # 页面
│   ├── stores/           # 状态管理 (Zustand)
│   ├── services/         # 原生服务桥接
│   ├── hooks/            # 自定义Hooks
│   ├── types/            # TypeScript类型
│   └── navigation/       # 导航配置
├── android/              # Android原生代码
│   └── app/src/main/java/com/autoclicker/
│       ├── AutoClickerAccessibilityService.kt  # 无障碍服务
│       ├── AutoClickerModule.kt                # RN桥接模块
│       └── AutoClickerPackage.kt               # RN包注册
└── App.tsx              # 应用入口
```

## 核心功能实现

### 1. 录制点击
- 使用 `RecordingOverlay` 组件捕获屏幕触摸
- 记录坐标和时间戳
- 支持手动顺序设置和实时录制两种模式

### 2. 执行点击
- 通过 `AutoClickerAccessibilityService` 执行实际点击
- 使用 Android Accessibility API 的 `dispatchGesture`
- 支持调速 (0.5x - 5x)

### 3. 定时任务
- 使用 `ScheduledTask` 管理定时执行
- 支持单次、每天、每周重复

## 注意事项

### Android 版本要求
- 最低: Android 7.0 (API 24)
- 推荐: Android 10+ (API 29+)

### 无障碍服务
- 必须在系统设置中手动开启
- 部分设备可能需要关闭电池优化

### 悬浮窗权限
- Android 6.0+ 需要动态申请
- 部分国产ROM需要额外设置

## 调试

### 查看日志
```bash
adb logcat -s AutoClickerService AutoClickerModule
```

### 开发模式运行
```bash
npx react-native run-android
```

## 常见问题

### Q: 点击不生效？
A: 检查无障碍服务是否已启用

### Q: 悬浮窗不显示？
A: 检查悬浮窗权限是否已授予

### Q: 定时任务不执行？
A: 检查电池优化设置，将应用设为不优化

## 技术栈
- React Native 0.73
- TypeScript
- Zustand (状态管理)
- React Navigation
- Kotlin (原生模块)
- Android Accessibility Service
