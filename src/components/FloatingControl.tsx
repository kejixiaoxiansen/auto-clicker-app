import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useAppStore } from '../stores/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingControlProps {
  onOpenMain: () => void;
}

export const FloatingControl: React.FC<FloatingControlProps> = ({ onOpenMain }) => {
  const { 
    recordingStatus, 
    playbackStatus, 
    startRecording, 
    stopRecording, 
    pausePlayback, 
    resumePlayback, 
    stopPlayback,
    recordedEvents,
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 70, y: 100 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 拖拽手势
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        // 吸附到边缘
        const currentX = (pan.x as any).__getValue();
        const currentY = (pan.y as any).__getValue();
        
        const targetX = currentX > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - 70 : 10;
        const targetY = Math.max(50, Math.min(SCREEN_HEIGHT - 150, currentY));
        
        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 8,
        }).start();
      },
    })
  ).current;

  // 按钮动画
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getStatusColor = () => {
    if (recordingStatus === 'recording') return '#F44336';
    if (recordingStatus === 'paused') return '#FF9800';
    if (playbackStatus === 'playing') return '#4CAF50';
    if (playbackStatus === 'paused') return '#FF9800';
    return '#2196F3';
  };

  const getStatusText = () => {
    if (recordingStatus === 'recording') return '录制中';
    if (recordingStatus === 'paused') return '暂停录制';
    if (playbackStatus === 'playing') return '执行中';
    if (playbackStatus === 'paused') return '暂停执行';
    return '点击器';
  };

  const handleRecordToggle = () => {
    if (recordingStatus === 'idle') {
      startRecording();
    } else {
      stopRecording();
    }
    setIsExpanded(false);
  };

  const handlePlayToggle = () => {
    if (playbackStatus === 'playing') {
      pausePlayback();
    } else if (playbackStatus === 'paused') {
      resumePlayback();
    }
    setIsExpanded(false);
  };

  const handleStop = () => {
    if (recordingStatus !== 'idle') {
      stopRecording();
    }
    if (playbackStatus !== 'idle') {
      stopPlayback();
    }
    setIsExpanded(false);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* 主按钮 */}
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: getStatusColor() }]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.mainButtonText}>
            {recordingStatus === 'recording' ? '⏺' : 
             playbackStatus === 'playing' ? '▶' : '⚡'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* 状态标签 */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* 展开菜单 */}
      {isExpanded && (
        <View style={styles.menu}>
          {/* 录制按钮 */}
          <TouchableOpacity
            style={[
              styles.menuButton,
              recordingStatus === 'recording' && styles.activeButton,
            ]}
            onPress={handleRecordToggle}
          >
            <Text style={styles.menuButtonText}>
              {recordingStatus === 'idle' ? '⏺ 开始录制' : '⏹ 停止录制'}
            </Text>
          </TouchableOpacity>

          {/* 播放/暂停按钮 */}
          {(playbackStatus === 'playing' || playbackStatus === 'paused') && (
            <TouchableOpacity
              style={[styles.menuButton, styles.activeButton]}
              onPress={handlePlayToggle}
            >
              <Text style={styles.menuButtonText}>
                {playbackStatus === 'playing' ? '⏸ 暂停' : '▶ 继续'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 停止按钮 */}
          {(recordingStatus !== 'idle' || playbackStatus !== 'idle') && (
            <TouchableOpacity
              style={[styles.menuButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Text style={styles.menuButtonText}>⏹ 停止</Text>
            </TouchableOpacity>
          )}

          {/* 打开主界面 */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              setIsExpanded(false);
              onOpenMain();
            }}
          >
            <Text style={styles.menuButtonText}>📱 打开主界面</Text>
          </TouchableOpacity>

          {/* 事件计数 */}
          {recordedEvents.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                已录制 {recordedEvents.length} 个点击
              </Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 9999,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  mainButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menu: {
    position: 'absolute',
    top: 70,
    left: -50,
    width: 160,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: '#f5f5f5',
  },
  activeButton: {
    backgroundColor: '#E3F2FD',
  },
  stopButton: {
    backgroundColor: '#FFEBEE',
  },
  menuButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  countBadge: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});
