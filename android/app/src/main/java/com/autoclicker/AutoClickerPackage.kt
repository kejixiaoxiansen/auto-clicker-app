package com.autoclicker

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

/**
 * React Native Package
 * 注册原生模块
 */
class AutoClickerPackage : ReactPackage {
    
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> {
        return mutableListOf()
    }
    
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): MutableList<NativeModule> {
        return mutableListOf(AutoClickerModule(reactContext))
    }
}
