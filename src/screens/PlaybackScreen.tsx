import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppStore } from '../stores/useAppStore';
import { ClickEvent } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PlaybackScreenRouteProp = RouteProp<
  { Playback: { scriptId: string } },
  'Playback'
>;

export const PlaybackScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PlaybackScreenRouteProp>();
  const { scriptId } = route.params;
  
  const {
    getScript,
    playbackStatus,
    currentEventIndex,
    playbackSpeed,
    isLooping,
    loopCount,
    currentLoop,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    setPlaybackSpeed,
    setLooping,
    setLoopCount,
    resetPlayback,
  } = useAppStore();

  const script = getScript(scriptId);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!script) {
      Alert.alert('错误', '脚本不存在');
      navigation.goBack();
      return;
    }

    // 开始播放
    startPlayback(script);

    return () => {
      stopPlayback();
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [scriptId]);

  // 更新进度
  useEffect(() => {
    if (!script || playbackStatus === 'idle') return;

    const totalEvents = script.events.length;
    const currentProgress = totalEvents > 0 ? (currentEventIndex / totalEvents) * 100 : 0;
    setProgress(currentProgress);

    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentEventIndex, script, playbackStatus]);

  // 执行点击事件
  useEffect(() => {
    if (playbackStatus !== 'playing' || !script) return;

    const executeNextEvent = async () => {
      if (currentEventIndex >= script.events.length) {
        // 所有事件执行完毕
        if (isLooping && (loopCount === 0 || currentLoop < loopCount - 1)) {
          // 继续循环
          setTimeout(() => {
            useAppStore.getState().incrementLoop();
            useAppStore.setState({ currentEventIndex: 0 });
          }, 500);
        }
        return;
      }

      const event = script.events[currentEventIndex];
      const adjustedDelay = event.timestamp / playbackSpeed;

      // 等待到执行时间
      setTimeout(() => {
        if (useAppStore.getState().playbackStatus === 'playing') {
          // 执行点击（这里需要调用原生模块）
          executeClick(event);
          useAppStore.getState().nextEvent();
        }
      }, adjustedDelay);
    };

    executeNextEvent();
  }, [currentEventIndex, playbackStatus, script, playbackSpeed]);

  const executeClick = (event: ClickEvent) => {
    // 实际执行点击需要原生模块支持
    console.log(`执行点击: (${event.x}, ${event.y}), 类型: ${event.type}`);
    
    // 触发震动反馈
    if (useAppStore.getState().settings.vibrationEnabled) {
      // Vibration.vibrate(50);
    }
  };

  const handleScreenPress = () => {
    setShowControls(!showControls);
    
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    
    if (showControls) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2, 3, 5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (!script || script.events.length === 0) return 0;
    const lastEvent = script.events[script.events.length - 1];
    return lastEvent.timestamp + (lastEvent.duration || 0);
  };

  if (!script) return null;

  return (
    <View style={styles.container}>
      {/* 点击指示器 */}
      {playbackStatus === 'playing' && script.events.map((event, index) => {
        if (index <= currentEventIndex) {
          return (
            <View
              key={event.id || index}
              style={[
                styles.clickIndicator,
                {
                  left: event.x - 15,
                  top: event.y - 15,
                  backgroundColor: index === currentEventIndex ? '#4CAF50' : 'rgba(76, 175, 80, 0.3)',
                  transform: [{ scale: index === currentEventIndex ? 1.2 : 1 }],
                },
              ]}
            >
              <Text style={styles.indicatorText}>{index + 1}</Text>
            </View>
          );
        }
        return null;
      })}

      {/* 点击区域（用于显示/隐藏控制栏） */}
      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={handleScreenPress}
      />

      {/* 控制栏 */}
      {showControls && (
        <View style={styles.controlsContainer}>
          {/* 顶部信息栏 */}
          <View style={styles.topBar}>
            <Text style={styles.scriptName} numberOfLines={1}>
              {script.name}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 进度条 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }) },
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                事件 {currentEventIndex + 1} / {script.events.length}
              </Text>
              <Text style={styles.progressText}>
                {formatTime(getTotalDuration() / playbackSpeed)}
              </Text>
            </View>
          </View>

          {/* 播放控制 */}
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSpeedChange}
            >
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainControlButton}
              onPress={() => {
                if (playbackStatus === 'playing') {
                  pausePlayback();
                } else {
                  resumePlayback();
                }
              }}
            >
              <Text style={styles.mainControlIcon}>
                {playbackStatus === 'playing' ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                resetPlayback();
                startPlayback(script);
              }}
            >
              <Text style={styles.controlIcon}>↻</Text>
            </TouchableOpacity>
          </View>

          {/* 循环设置 */}
          <View style={styles.loopContainer}>
            <TouchableOpacity
              style={[styles.loopButton, isLooping && styles.loopButtonActive]}
              onPress={() => setLooping(!isLooping)}
            >
              <Text style={[styles.loopButtonText, isLooping && styles.loopButtonTextActive]}>
                循环 {isLooping ? (loopCount === 0 ? '∞' : `${currentLoop + 1}/${loopCount}`) : '关'}
              </Text>
            </TouchableOpacity>

            {isLooping && (
              <View style={styles.loopCountContainer}>
                <TouchableOpacity
                  onPress={() => setLoopCount(Math.max(0, loopCount - 1))}
                >
                  <Text style={styles.loopCountButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.loopCountText}>
                  {loopCount === 0 ? '∞' : loopCount}
                </Text>
                <TouchableOpacity
                  onPress={() => setLoopCount(loopCount + 1)}
                >
                  <Text style={styles.loopCountButton}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 状态提示 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {playbackStatus === 'playing' ? '执行中...' : 
           playbackStatus === 'paused' ? '已暂停' : '已停止'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  touchArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  clickIndicator: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scriptName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    color: '#fff',
    fontSize: 24,
    padding: 8,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  mainControlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainControlIcon: {
    fontSize: 32,
    color: '#fff',
  },
  controlIcon: {
    fontSize: 24,
    color: '#fff',
  },
  speedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loopContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loopButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 16,
  },
  loopButtonActive: {
    backgroundColor: '#4CAF50',
  },
  loopButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  loopButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loopCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loopCountButton: {
    color: '#fff',
    fontSize: 20,
    paddingHorizontal: 12,
  },
  loopCountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  statusContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
