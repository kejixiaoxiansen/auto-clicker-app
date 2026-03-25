# 自动点击器 App

一款功能完整的 Android 自动点击器应用，支持录制点击轨迹、多脚本管理、调速和定时执行。

## ✨ 核心功能

### 1. 录制模式
- **实时录制**：记录屏幕上的所有点击操作和时间间隔
- **手动设置**：按1,2,3,4顺序手动点击屏幕设置位置
- **事件类型**：支持普通点击、长按、滑动

### 2. 脚本管理
- 保存多个点击脚本
- 编辑脚本名称、描述、播放速度、循环次数
- 复制和删除脚本
- 查看脚本详情和事件列表

### 3. 播放控制
- **调速功能**：0.5x - 5x 速度调节
- **循环播放**：支持设置循环次数或无限循环
- **进度显示**：实时显示执行进度
- **暂停/继续**：随时控制播放状态

### 4. 定时任务
- 精确到毫秒的定时执行
- 支持单次、每天、每周重复
- 任务开关控制

### 5. 悬浮控制
- 全局悬浮按钮，随时控制录制和播放
- 可拖拽位置
- 显示当前状态

## 📱 界面预览

### 主界面
- 脚本列表展示
- 快速创建脚本（录制/手动）
- 定时任务入口

### 录制界面
- 全屏录制覆盖层
- 实时显示点击位置标记
- 计时器和事件计数
- 暂停/保存控制

### 播放界面
- 点击位置实时指示
- 进度条显示
- 速度调节
- 循环控制

### 设置界面
- 显示设置（点击指示器）
- 反馈设置（震动、声音）
- 播放设置（默认速度、自动保存）
- 数据统计

## 🛠 技术栈

### 前端
- **React Native 0.73** - 跨平台框架
- **TypeScript** - 类型安全
- **Zustand** - 状态管理
- **React Navigation** - 页面导航
- **date-fns** - 日期处理

### 原生 (Android)
- **Kotlin** - 原生开发语言
- **Accessibility Service** - 无障碍服务执行点击
- **WindowManager** - 悬浮窗实现
- **GestureDescription** - 手势模拟

## 📋 系统要求

- **Android 7.0+** (API 24)
- **无障碍服务权限** - 必需
- **悬浮窗权限** - 必需

## 🚀 快速开始

### 1. 安装依赖
```bash
cd auto-clicker-app
npm install
```

### 2. 构建 APK
```bash
cd android
./gradlew assembleRelease
```

### 3. 安装应用
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

### 4. 启用权限
1. 打开系统设置 → 无障碍 → 自动点击器 → 开启
2. 打开应用 → 授予悬浮窗权限

## 📁 项目结构

```
auto-clicker-app/
├── src/
│   ├── components/           # UI组件
│   │   ├── FloatingControl.tsx      # 悬浮控制按钮
│   │   ├── RecordingOverlay.tsx     # 录制覆盖层
│   │   └── ScriptCard.tsx           # 脚本卡片
│   ├── screens/              # 页面
│   │   ├── HomeScreen.tsx           # 首页
│   │   ├── RecordingScreen.tsx      # 录制页面
│   │   ├── PlaybackScreen.tsx       # 播放页面
│   │   ├── ScheduleScreen.tsx       # 定时任务
│   │   ├── ScriptDetailScreen.tsx   # 脚本详情
│   │   ├── ScriptEditScreen.tsx     # 脚本编辑
│   │   └── SettingsScreen.tsx       # 设置
│   ├── stores/               # 状态管理
│   │   └── useAppStore.ts           # Zustand store
│   ├── services/             # 原生服务
│   │   └── NativeClickService.ts    # 原生点击桥接
│   ├── hooks/                # 自定义Hooks
│   │   └── useClickExecutor.ts      # 点击执行逻辑
│   ├── types/                # TypeScript类型
│   │   └── index.ts
│   └── navigation/           # 导航配置
│       └── AppNavigator.tsx
├── android/                  # Android原生代码
│   └── app/src/main/java/com/autoclicker/
│       ├── AutoClickerAccessibilityService.kt  # 无障碍服务
│       ├── AutoClickerModule.kt                # RN桥接
│       └── AutoClickerPackage.kt               # 包注册
├── App.tsx                   # 应用入口
├── package.json
└── BUILD_GUIDE.md           # 详细构建指南
```

## 🔧 核心实现

### 录制点击
```typescript
// 捕获屏幕触摸事件
const handleScreenPress = (event) => {
  const { locationX, locationY } = event.nativeEvent;
  addRecordedEvent({
    x: locationX,
    y: locationY,
    type: 'tap',
    timestamp: Date.now() - recordingStartTime,
  });
};
```

### 执行点击 (Android原生)
```kotlin
// 使用AccessibilityService执行手势
private fun executeClick(x: Float, y: Float, duration: Long) {
    val path = Path()
    path.moveTo(x, y)
    
    val gesture = GestureDescription.Builder()
        .addStroke(GestureDescription.StrokeDescription(path, 0, duration))
        .build()
    
    dispatchGesture(gesture, callback, null)
}
```

### 调速播放
```typescript
// 根据速度调整延迟
const delay = event.timestamp / playbackSpeed;
setTimeout(() => {
    NativeClickService.performClick(event.x, event.y);
}, delay);
```

## ⚠️ 注意事项

1. **无障碍服务**：必须在系统设置中手动开启，否则无法执行点击
2. **电池优化**：部分设备需要关闭电池优化以保持后台运行
3. **安全限制**：某些应用（如银行、支付类）可能阻止自动点击
4. **Android版本**：需要 Android 7.0+ 支持手势模拟

## 📝 更新日志

### v1.0.0
- ✅ 录制点击功能
- ✅ 手动设置点击位置
- ✅ 多脚本管理
- ✅ 调速播放 (0.5x - 5x)
- ✅ 循环播放
- ✅ 定时任务
- ✅ 悬浮控制
- ✅ 数据持久化

## 📄 许可

MIT License

---

**注意**：本应用仅供学习和自动化测试使用，请遵守相关法律法规和应用使用条款。
