package com.autoclicker

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.annotation.RequiresApi
nimport com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native 桥接模块
 * 用于JS与原生代码通信
 */
class AutoClickerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val TAG = "AutoClickerModule"
        
        // 事件名称
        const val EVENT_CLICK_COMPLETED = "onClickCompleted"
        const val EVENT_SERVICE_CONNECTED = "onServiceConnected"
        const val EVENT_RECORD_CLICK = "onRecordClick"
        const val EVENT_PLAY_CLICK = "onPlayClick"
        const val EVENT_STOP_CLICK = "onStopClick"
    }
    
    override fun getName(): String {
        return "AutoClickerModule"
    }
    
    /**
     * 检查无障碍服务是否启用
     */
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val enabled = AutoClickerAccessibilityService.instance != null
        promise.resolve(enabled)
    }
    
    /**
     * 打开无障碍服务设置
     */
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        currentReactApplicationContext.startActivity(intent)
    }
    
    /**
     * 检查悬浮窗权限
     */
    @ReactMethod
    fun canDrawOverlays(promise: Promise) {
        val canDraw = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(currentReactApplicationContext)
        } else {
            true
        }
        promise.resolve(canDraw)
    }
    
    /**
     * 请求悬浮窗权限
     */
    @ReactMethod
    fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(currentReactApplicationContext)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${currentReactApplicationContext.packageName}")
                )
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                currentReactApplicationContext.startActivity(intent)
            }
        }
    }
    
    /**
     * 执行点击
     */
    @ReactMethod
    fun performClick(x: Double, y: Double, duration: Double) {
        Log.d(TAG, "执行点击: ($x, $y), 持续时间: $duration")
        AutoClickerAccessibilityService.performClick(x.toFloat(), y.toFloat(), duration.toLong())
    }
    
    /**
     * 执行长按
     */
    @ReactMethod
    fun performLongPress(x: Double, y: Double, duration: Double) {
        Log.d(TAG, "执行长按: ($x, $y), 持续时间: $duration")
        AutoClickerAccessibilityService.performLongPress(x.toFloat(), y.toFloat(), duration.toLong())
    }
    
    /**
     * 执行滑动
     */
    @ReactMethod
    fun performSwipe(startX: Double, startY: Double, endX: Double, endY: Double, duration: Double) {
        Log.d(TAG, "执行滑动: ($startX, $startY) -> ($endX, $endY), 持续时间: $duration")
        AutoClickerAccessibilityService.performSwipe(
            startX.toFloat(), startY.toFloat(),
            endX.toFloat(), endY.toFloat(),
            duration.toLong()
        )
    }
    
    /**
     * 显示悬浮控制窗口
     */
    @ReactMethod
    fun showFloatingWindow() {
        AutoClickerAccessibilityService.instance?.showFloatingWindow()
    }
    
    /**
     * 隐藏悬浮控制窗口
     */
    @ReactMethod
    fun hideFloatingWindow() {
        AutoClickerAccessibilityService.instance?.removeFloatingWindow()
    }
    
    /**
     * 添加监听器
     */
    @ReactMethod
    fun addListener(eventName: String) {
        // 监听器已在模块初始化时设置
    }
    
    /**
     * 移除监听器
     */
    @ReactMethod
    fun removeListeners(count: Int) {
        // 清理工作
    }
    
    /**
     * 获取屏幕尺寸
     */
    @ReactMethod
    fun getScreenSize(promise: Promise) {
        val displayMetrics = currentReactApplicationContext.resources.displayMetrics
        val map = Arguments.createMap()
        map.putInt("width", displayMetrics.widthPixels)
        map.putInt("height", displayMetrics.heightPixels)
        map.putDouble("density", displayMetrics.density.toDouble())
        promise.resolve(map)
    }
    
    /**
     * 发送事件到React Native
     */
    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
