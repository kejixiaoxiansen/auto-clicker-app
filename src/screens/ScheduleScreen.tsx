import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DatePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '../stores/useAppStore';
import { ScheduledTask } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { scripts, scheduledTasks, addScheduledTask, deleteScheduledTask, toggleScheduledTask } = useAppStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'once' | 'daily' | 'weekly'>('once');

  const handleAddTask = () => {
    if (!selectedScriptId) {
      Alert.alert('提示', '请选择要执行的脚本');
      return;
    }

    const taskId = addScheduledTask({
      scriptId: selectedScriptId,
      executeAt: selectedDate.getTime(),
      repeat: repeatMode,
      enabled: true,
    });

    setShowAddModal(false);
    setSelectedScriptId('');
    setSelectedDate(new Date());
    setRepeatMode('once');
    
    Alert.alert('成功', '定时任务已添加');
  };

  const getScriptName = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    return script?.name || '未知脚本';
  };

  const formatExecuteTime = (timestamp: number) => {
    return format(timestamp, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  };

  const getRepeatText = (repeat: ScheduledTask['repeat']) => {
    switch (repeat) {
      case 'daily': return '每天';
      case 'weekly': return '每周';
      default: return '仅一次';
    }
  };

  const renderTaskItem = ({ item }: { item: ScheduledTask }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.scriptName}>{getScriptName(item.scriptId)}</Text>
          <Text style={styles.executeTime}>{formatExecuteTime(item.executeAt)}</Text>
          <View style={styles.repeatBadge}>
            <Text style={styles.repeatText}>{getRepeatText(item.repeat)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, item.enabled && styles.toggleButtonActive]}
          onPress={() => toggleScheduledTask(item.id)}
        >
          <Text style={[styles.toggleText, item.enabled && styles.toggleTextActive]}>
            {item.enabled ? '开启' : '关闭'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            '确认删除',
            '确定要删除这个定时任务吗？',
            [
              { text: '取消', style: 'cancel' },
              { text: '删除', style: 'destructive', onPress: () => deleteScheduledTask(item.id) },
            ]
          );
        }}
      >
        <Text style={styles.deleteText}>删除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>定时任务</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 任务列表 */}
      <FlatList
        data={scheduledTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>暂无定时任务</Text>
            <Text style={styles.emptySubtitle}>点击右下角添加定时任务</Text>
          </View>
        }
        contentContainerStyle={scheduledTasks.length === 0 ? styles.emptyList : styles.list}
      />

      {/* 添加按钮 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (scripts.length === 0) {
            Alert.alert('提示', '请先创建一个脚本');
            return;
          }
          setShowAddModal(true);
          setSelectedScriptId(scripts[0]?.id || '');
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* 添加任务弹窗 */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加定时任务</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 脚本选择 */}
              <Text style={styles.sectionLabel}>选择脚本</Text>
              <View style={styles.scriptList}>
                {scripts.map((script) => (
                  <TouchableOpacity
                    key={script.id}
                    style={[
                      styles.scriptItem,
                      selectedScriptId === script.id && styles.scriptItemSelected,
                    ]}
                    onPress={() => setSelectedScriptId(script.id)}
                  >
                    <Text
                      style={[
                        styles.scriptItemText,
                        selectedScriptId === script.id && styles.scriptItemTextSelected,
                      ]}
                    >
                      {script.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 执行时间 */}
              <Text style={styles.sectionLabel}>执行时间</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {format(selectedDate, 'yyyy年MM月dd日 HH:mm:ss')}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DatePicker
                  value={selectedDate}
                  mode="datetime"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}

              {/* 重复设置 */}
              <Text style={styles.sectionLabel}>重复</Text>
              <View style={styles.repeatOptions}>
                {(['once', 'daily', 'weekly'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.repeatOption,
                      repeatMode === mode && styles.repeatOptionSelected,
                    ]}
                    onPress={() => setRepeatMode(mode)}
                  >
                    <Text
                      style={[
                        styles.repeatOptionText,
                        repeatMode === mode && styles.repeatOptionTextSelected,
                      ]}
                    >
                      {mode === 'once' ? '仅一次' : mode === 'daily' ? '每天' : '每周'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* 按钮 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.saveButtonText}>添加</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 24,
    color: '#333',
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
  },
  scriptName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  executeTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  repeatBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  repeatText: {
    fontSize: 12,
    color: '#1976D2',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontSize: 12,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  deleteText: {
    color: '#F44336',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  scriptList: {
    marginBottom: 20,
  },
  scriptItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  scriptItemSelected: {
    backgroundColor: '#2196F3',
  },
  scriptItemText: {
    fontSize: 14,
    color: '#333',
  },
  scriptItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  repeatOptions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  repeatOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  repeatOptionSelected: {
    backgroundColor: '#2196F3',
  },
  repeatOptionText: {
    fontSize: 14,
    color: '#333',
  },
  repeatOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
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
