import { useEffect, useRef, useCallback } from 'react';
import { Vibration } from 'react-native';
import { useAppStore } from '../stores/useAppStore';
import { NativeClickService } from '../services/NativeClickService';
import { ClickEvent } from '../types';

/**
 * 点击执行Hook
 * 管理点击脚本的执行逻辑
 */
export const useClickExecutor = () => {
  const {
    playbackStatus,
    currentScript,
    currentEventIndex,
    playbackSpeed,
    isLooping,
    loopCount,
    currentLoop,
    nextEvent,
    stopPlayback,
    incrementLoop,
    settings,
  } = useAppStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);

  // 清理定时器
  const clearExecutionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 执行单个点击事件
  const executeEvent = useCallback((event: ClickEvent) => {
    // 执行原生点击
    switch (event.type) {
      case 'tap':
        NativeClickService.performClick(event.x, event.y, event.duration || 100);
        break;
      case 'longPress':
        NativeClickService.performLongPress(event.x, event.y, event.duration || 1000);
        break;
      case 'swipe':
        if (event.endX !== undefined && event.endY !== undefined) {
          NativeClickService.performSwipe(
            event.x,
            event.y,
            event.endX,
            event.endY,
            event.duration || 500
          );
        }
        break;
    }

    // 震动反馈
    if (settings.vibrationEnabled) {
      Vibration.vibrate(50);
    }
  }, [settings.vibrationEnabled]);

  // 执行下一个事件
  const executeNextEvent = useCallback(() => {
    if (!currentScript || playbackStatus !== 'playing') {
      return;
    }

    if (currentEventIndex >= currentScript.events.length) {
      // 当前循环完成
      if (isLooping && (loopCount === 0 || currentLoop < loopCount - 1)) {
        // 继续下一轮循环
        incrementLoop();
        useAppStore.setState({ currentEventIndex: 0 });
        
        // 循环间隔500ms
        timeoutRef.current = setTimeout(() => {
          executeNextEvent();
        }, 500);
      } else {
        // 所有循环完成
        stopPlayback();
      }
      return;
    }

    const event = currentScript.events[currentEventIndex];
    
    // 计算延迟时间（考虑速度）
    let delay = 0;
    if (currentEventIndex === 0) {
      delay = event.timestamp / playbackSpeed;
    } else {
      const prevEvent = currentScript.events[currentEventIndex - 1];
      delay = (event.timestamp - prevEvent.timestamp) / playbackSpeed;
    }

    // 确保最小延迟
    delay = Math.max(delay, 50);

    timeoutRef.current = setTimeout(() => {
      if (useAppStore.getState().playbackStatus === 'playing') {
        executeEvent(event);
        nextEvent();
      }
    }, delay);
  }, [
    currentScript,
    currentEventIndex,
    playbackStatus,
    playbackSpeed,
    isLooping,
    loopCount,
    currentLoop,
    executeEvent,
    nextEvent,
    stopPlayback,
    incrementLoop,
  ]);

  // 监听播放状态变化
  useEffect(() => {
    if (playbackStatus === 'playing' && !isExecutingRef.current) {
      isExecutingRef.current = true;
      executeNextEvent();
    } else if (playbackStatus !== 'playing') {
      isExecutingRef.current = false;
      clearExecutionTimeout();
    }

    return () => {
      clearExecutionTimeout();
    };
  }, [playbackStatus, currentEventIndex, executeNextEvent, clearExecutionTimeout]);

  // 监听脚本变化（重新开始播放时）
  useEffect(() => {
    if (currentScript && playbackStatus === 'playing' && currentEventIndex === 0) {
      executeNextEvent();
    }
  }, [currentScript?.id]);

  return {
    isExecuting: isExecutingRef.current,
    clearExecutionTimeout,
  };
};

export default useClickExecutor;
