import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useAppStore } from '../stores/useAppStore';
import { ClickEvent } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecordingOverlayProps {
  mode: 'record' | 'manual';
  onSave: () => void;
  onCancel: () => void;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  mode,
  onSave,
  onCancel,
}) => {
  const { 
    recordingStatus, 
    recordedEvents,
    addRecordedEvent, 
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAppStore();

  const [manualStep, setManualStep] = useState(1);
  const [clickMarkers, setClickMarkers] = useState<Array<{ x: number; y: number; step: number }>>([]);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  // 处理屏幕点击
  const handleScreenPress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    if (mode === 'manual') {
      // 手动模式：按顺序记录点击位置
      const newEvent: ClickEvent = {
        id: '',
        x: locationX,
        y: locationY,
        timestamp: manualStep * 1000, // 每个点击间隔1秒
        type: 'tap',
      };
      
      addRecordedEvent(newEvent);
      setClickMarkers(prev => [...prev, { x: locationX, y: locationY, step: manualStep }]);
      setManualStep(prev => prev + 1);
      
      // 闪烁效果
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    } else {
      // 录制模式：记录带时间戳的点击
      const newEvent: ClickEvent = {
        id: '',
        x: locationX,
        y: locationY,
        timestamp: Date.now(), // 时间戳在store中计算
        type: 'tap',
      };
      
      addRecordedEvent(newEvent);
    }
  }, [mode, manualStep, addRecordedEvent, fadeAnim]);

  // 处理长按
  const handleLongPress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    const newEvent: ClickEvent = {
      id: '',
      x: locationX,
      y: locationY,
      timestamp: Date.now(),
      type: 'longPress',
      duration: 1000, // 默认1秒长按
    };
    
    addRecordedEvent(newEvent);
  }, [addRecordedEvent]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
  };

  const getRecordingTime = () => {
    const store = useAppStore.getState();
    if (store.recordingStartTime === 0) return '00:00.00';
    return formatTime(Date.now() - store.recordingStartTime);
  };

  return (
    <View style={styles.container}>
      {/* 点击捕获层 */}
      <TouchableOpacity
        style={styles.touchLayer}
        activeOpacity={1}
        onPress={handleScreenPress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        {/* 点击标记 */}
        {clickMarkers.map((marker, index) => (
          <Animated.View
            key={index}
            style={[
              styles.clickMarker,
              {
                left: marker.x - 20,
                top: marker.y - 20,
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.markerText}>{marker.step}</Text>
          </Animated.View>
        ))}

        {/* 实时点击标记（录制模式） */}
        {mode === 'record' && recordedEvents.map((event, index) => (
          <View
            key={event.id || index}
            style={[
              styles.clickMarker,
              {
                left: event.x - 15,
                top: event.y - 15,
                backgroundColor: event.type === 'longPress' ? '#FF9800' : '#4CAF50',
              },
            ]}
          >
            <Text style={styles.markerText}>{index + 1}</Text>
          </View>
        ))}
      </TouchableOpacity>

      {/* 顶部控制栏 */}
      <View style={styles.topBar}>
        <View style={styles.timerContainer}>
          <View style={[
            styles.recordingIndicator,
            recordingStatus === 'recording' && styles.recordingActive
          ]} />
          <Text style={styles.timerText}>
            {mode === 'record' ? getRecordingTime() : `步骤 ${manualStep}`}
          </Text>
        </View>
        
        <Text style={styles.eventCount}>
          {recordedEvents.length} 个点击
        </Text>
      </View>

      {/* 底部控制栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
          <Text style={styles.controlButtonText}>取消</Text>
        </TouchableOpacity>

        {mode === 'record' && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              recordingStatus === 'paused' ? styles.resumeButton : styles.pauseButton,
            ]}
            onPress={() => {
              if (recordingStatus === 'paused') {
                resumeRecording();
              } else {
                pauseRecording();
              }
            }}
          >
            <Text style={styles.controlButtonText}>
              {recordingStatus === 'paused' ? '继续' : '暂停'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.saveButton]}
          onPress={() => {
            stopRecording();
            onSave();
          }}
          disabled={recordedEvents.length === 0}
        >
          <Text style={[styles.controlButtonText, styles.saveButtonText]}>
            保存 ({recordedEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 提示文字 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {mode === 'manual'
            ? `点击屏幕设置第 ${manualStep} 个位置`
            : '点击屏幕录制点击，长按录制长按事件'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  clickMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
    marginRight: 8,
  },
  recordingActive: {
    backgroundColor: '#F44336',
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  eventCount: {
    color: '#fff',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 80,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    fontWeight: 'bold',
  },
  hintContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 50,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
