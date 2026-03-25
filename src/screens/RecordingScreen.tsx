import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppStore } from '../stores/useAppStore';
import { RecordingOverlay } from '../components\RecordingOverlay';

type RecordingScreenRouteProp = RouteProp<
  { Recording: { mode: 'record' | 'manual' } },
  'Recording'
>;

export const RecordingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RecordingScreenRouteProp>();
  const { mode } = route.params;
  
  const { 
    recordedEvents, 
    clearRecordedEvents, 
    addScript,
    tempScriptName,
    setTempScriptName,
  } = useAppStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scriptName, setScriptName] = useState(tempScriptName || '');
  const [scriptDescription, setScriptDescription] = useState('');
  const [isRecording, setIsRecording] = useState(true);

  const handleSave = () => {
    if (!scriptName.trim()) {
      Alert.alert('提示', '请输入脚本名称');
      return;
    }

    if (recordedEvents.length === 0) {
      Alert.alert('提示', '没有可保存的点击事件');
      return;
    }

    // 计算事件之间的相对时间
    let lastTimestamp = 0;
    const processedEvents = recordedEvents.map((event, index) => ({
      ...event,
      timestamp: index === 0 ? 0 : event.timestamp - recordedEvents[0].timestamp,
    }));

    const scriptId = addScript({
      name: scriptName.trim(),
      description: scriptDescription.trim(),
      events: processedEvents,
      loopCount: 1,
      speed: 1,
    });

    clearRecordedEvents();
    setTempScriptName('');
    setShowSaveModal(false);
    
    Alert.alert(
      '保存成功',
      '脚本已保存',
      [
        {
          text: '继续录制',
          onPress: () => {
            setIsRecording(true);
          },
        },
        {
          text: '返回首页',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (recordedEvents.length > 0) {
      Alert.alert(
        '确认取消',
        '确定要放弃当前的录制吗？',
        [
          { text: '继续录制', style: 'cancel' },
          {
            text: '放弃',
            style: 'destructive',
            onPress: () => {
              clearRecordedEvents();
              setTempScriptName('');
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <RecordingOverlay
          mode={mode}
          onSave={() => {
            setIsRecording(false);
            setShowSaveModal(true);
          }}
          onCancel={handleCancel}
        />
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>录制完成</Text>
          <Text style={styles.previewSubtitle}>
            共录制 {recordedEvents.length} 个点击事件
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setIsRecording(true)}
          >
            <Text style={styles.continueButtonText}>继续录制</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 保存脚本弹窗 */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>保存脚本</Text>
            
            <Text style={styles.inputLabel}>脚本名称 *</Text>
            <TextInput
              style={styles.input}
              value={scriptName}
              onChangeText={setScriptName}
              placeholder="输入脚本名称"
              maxLength={50}
              autoFocus
            />

            <Text style={styles.inputLabel}>描述（可选）</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={scriptDescription}
              onChangeText={setScriptDescription}
              placeholder="输入脚本描述"
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
