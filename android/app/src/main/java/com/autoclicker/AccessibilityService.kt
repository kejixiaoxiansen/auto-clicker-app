package com.autoclicker

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * 自动点击器无障碍服务
 * 用于执行实际的点击操作
 */
class AutoClickerAccessibilityService : AccessibilityService() {
    
    companion object {
        private const val TAG = "AutoClickerService"
        var instance: AutoClickerAccessibilityService? = null
        
        // 从React Native调用的点击方法
        fun performClick(x: Float, y: Float, duration: Long = 100) {
            instance?.executeClick(x, y, duration)
        }
        
        fun performLongPress(x: Float, y: Float, duration: Long = 1000) {
            instance?.executeLongPress(x, y, duration)
        }
        
        fun performSwipe(startX: Float, startY: Float, endX: Float, endY: Float, duration: Long = 500) {
            instance?.executeSwipe(startX, startY, endX, endY, duration)
        }
    }
    
    private var floatingView: View? = null
    private var windowManager: WindowManager? = null
    private val handler = Handler(Looper.getMainLooper())
    
    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "无障碍服务已连接")
        
        // 发送事件到React Native
        sendEventToReactNative("onServiceConnected", null)
    }
    
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // 处理无障碍事件
    }
    
    override fun onInterrupt() {
        Log.d(TAG, "无障碍服务被中断")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        instance = null
        removeFloatingWindow()
        Log.d(TAG, "无障碍服务已销毁")
    }
    
    /**
     * 执行点击操作
     */
    private fun executeClick(x: Float, y: Float, duration: Long) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            Log.e(TAG, "需要Android 7.0或更高版本")
            return
        }
        
        val path = Path()
        path.moveTo(x, y)
        
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, duration))
            .build()
        
        val result = dispatchGesture(gesture, object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                super.onCompleted(gestureDescription)
                Log.d(TAG, "点击完成: ($x, $y)")
                sendEventToReactNative("onClickCompleted", Arguments.createMap().apply {
                    putDouble("x", x.toDouble())
                    putDouble("y", y.toDouble())
                })
            }
            
            override fun onCancelled(gestureDescription: GestureDescription?) {
                super.onCancelled(gestureDescription)
                Log.e(TAG, "点击被取消")
            }
        }, null)
        
        if (!result) {
            Log.e(TAG, "点击执行失败")
        }
    }
    
    /**
     * 执行长按操作
     */
    private fun executeLongPress(x: Float, y: Float, duration: Long) {
        executeClick(x, y, duration)
    }
    
    /**
     * 执行滑动操作
     */
    private fun executeSwipe(startX: Float, startY: Float, endX: Float, endY: Float, duration: Long) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            Log.e(TAG, "需要Android 7.0或更高版本")
            return
        }
        
        val path = Path()
        path.moveTo(startX, startY)
        path.lineTo(endX, endY)
        
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, duration))
            .build()
        
        dispatchGesture(gesture, null, null)
    }
    
    /**
     * 显示悬浮控制窗口
     */
    fun showFloatingWindow() {
        if (floatingView != null) return
        
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        
        params.gravity = Gravity.TOP or Gravity.START
        params.x = 0
        params.y = 100
        
        floatingView = LayoutInflater.from(this).inflate(R.layout.floating_control, null)
        
        // 设置按钮点击事件
        floatingView?.findViewById<Button>(R.id.btnRecord)?.setOnClickListener {
            sendEventToReactNative("onRecordClick", null)
        }
        
        floatingView?.findViewById<Button>(R.id.btnPlay)?.setOnClickListener {
            sendEventToReactNative("onPlayClick", null)
        }
        
        floatingView?.findViewById<Button>(R.id.btnStop)?.setOnClickListener {
            sendEventToReactNative("onStopClick", null)
        }
        
        windowManager?.addView(floatingView, params)
    }
    
    /**
     * 移除悬浮窗口
     */
    fun removeFloatingWindow() {
        if (floatingView != null && windowManager != null) {
            windowManager?.removeView(floatingView)
            floatingView = null
        }
    }
    
    /**
     * 发送事件到React Native
     */
    private fun sendEventToReactNative(eventName: String, params: WritableMap?) {
        try {
            val reactContext = (application as MainApplication).reactNativeHost.reactInstanceManager.currentReactContext
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        } catch (e: Exception) {
            Log.e(TAG, "发送事件失败: ${e.message}")
        }
    }
}
