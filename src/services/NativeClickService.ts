import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { AutoClickerModule } = NativeModules;

// 创建事件发射器
const autoClickerEmitter = AutoClickerModule ? new NativeEventEmitter(AutoClickerModule) : null;

/**
 * 原生点击服务
 * 用于与Android原生代码通信，执行实际点击操作
 */
export class NativeClickService {
  
  /**
   * 检查是否支持原生点击（Android）
   */
  static isSupported(): boolean {
    return Platform.OS === 'android' && !!AutoClickerModule;
  }

  /**
   * 检查无障碍服务是否启用
   */
  static async isAccessibilityServiceEnabled(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      return await AutoClickerModule.isAccessibilityServiceEnabled();
    } catch (error) {
      console.error('检查无障碍服务失败:', error);
      return false;
    }
  }

  /**
   * 打开无障碍服务设置
   */
  static openAccessibilitySettings(): void {
    if (!this.isSupported()) return;
    AutoClickerModule.openAccessibilitySettings();
  }

  /**
   * 检查悬浮窗权限
   */
  static async canDrawOverlays(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      return await AutoClickerModule.canDrawOverlays();
    } catch (error) {
      console.error('检查悬浮窗权限失败:', error);
      return false;
    }
  }

  /**
   * 请求悬浮窗权限
   */
  static requestOverlayPermission(): void {
    if (!this.isSupported()) return;
    AutoClickerModule.requestOverlayPermission();
  }

  /**
   * 执行点击
   * @param x X坐标
   * @param y Y坐标
   * @param duration 持续时间（毫秒）
   */
  static performClick(x: number, y: number, duration: number = 100): void {
    if (!this.isSupported()) {
      console.warn('原生点击仅在Android上支持');
      return;
    }
    AutoClickerModule.performClick(x, y, duration);
  }

  /**
   * 执行长按
   * @param x X坐标
   * @param y Y坐标
   * @param duration 持续时间（毫秒）
   */
  static performLongPress(x: number, y: number, duration: number = 1000): void {
    if (!this.isSupported()) {
      console.warn('原生长按仅在Android上支持');
      return;
    }
    AutoClickerModule.performLongPress(x, y, duration);
  }

  /**
   * 执行滑动
   * @param startX 起始X坐标
   * @param startY 起始Y坐标
   * @param endX 结束X坐标
   * @param endY 结束Y坐标
   * @param duration 持续时间（毫秒）
   */
  static performSwipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 500
  ): void {
    if (!this.isSupported()) {
      console.warn('原生滑动仅在Android上支持');
      return;
    }
    AutoClickerModule.performSwipe(startX, startY, endX, endY, duration);
  }

  /**
   * 显示悬浮控制窗口
   */
  static showFloatingWindow(): void {
    if (!this.isSupported()) return;
    AutoClickerModule.showFloatingWindow();
  }

  /**
   * 隐藏悬浮控制窗口
   */
  static hideFloatingWindow(): void {
    if (!this.isSupported()) return;
    AutoClickerModule.hideFloatingWindow();
  }

  /**
   * 获取屏幕尺寸
   */
  static async getScreenSize(): Promise<{ width: number; height: number; density: number }> {
    if (!this.isSupported()) {
      return { width: 0, height: 0, density: 1 };
    }
    try {
      return await AutoClickerModule.getScreenSize();
    } catch (error) {
      console.error('获取屏幕尺寸失败:', error);
      return { width: 0, height: 0, density: 1 };
    }
  }

  /**
   * 添加事件监听器
   */
  static addEventListener(eventName: string, callback: (data: any) => void) {
    if (!autoClickerEmitter) return null;
    return autoClickerEmitter.addListener(eventName, callback);
  }

  /**
   * 移除事件监听器
   */
  static removeEventListener(subscription: any) {
    if (subscription) {
      subscription.remove();
    }
  }
}

export default NativeClickService;
