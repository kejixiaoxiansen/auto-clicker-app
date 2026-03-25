import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppStore } from '../stores/useAppStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ScriptDetailScreenRouteProp = RouteProp<
  { ScriptDetail: { scriptId: string } },
  'ScriptDetail'
>;

export const ScriptDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScriptDetailScreenRouteProp>();
  const { scriptId } = route.params;
  
  const { getScript, deleteScript, duplicateScript } = useAppStore();
  const script = getScript(scriptId);

  if (!script) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>脚本不存在</Text>
      </View>
    );
  }

  const formatDuration = () => {
    if (script.events.length === 0) return '0秒';
    const lastEvent = script.events[script.events.length - 1];
    const durationMs = lastEvent.timestamp + (lastEvent.duration || 0);
    const seconds = Math.ceil(durationMs / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      `确定要删除脚本 "${script.name}" 吗？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            deleteScript(scriptId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDuplicate = () => {
    const newId = duplicateScript(scriptId);
    if (newId) {
      Alert.alert('成功', '脚本已复制');
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'tap': return '点击';
      case 'longPress': return '长按';
      case 'swipe': return '滑动';
      default: return type;
    }
  };

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {script.name}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('ScriptEdit', { scriptId })}>
          <Text style={styles.editButton}>编辑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 基本信息卡片 */}
        <View style={styles.infoCard}>
          {script.description ? (
            <Text style={styles.description}>{script.description}</Text>
          ) : null}
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{script.events.length}</Text>
              <Text style={styles.statLabel}>点击次数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration()}</Text>
              <Text style={styles.statLabel}>总时长</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{script.speed}x</Text>
              <Text style={styles.statLabel}>播放速度</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{script.loopCount === 0 ? '∞' : script.loopCount}</Text>
              <Text style={styles.statLabel}>循环次数</Text>
            </View>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              创建时间: {format(script.createdAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </Text>
            <Text style={styles.timeText}>
              更新时间: {format(script.updatedAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </Text>
          </View>
        </View>

        {/* 点击事件列表 */}
        <Text style={styles.sectionTitle}>点击事件列表</Text>
        
        {script.events.length === 0 ? (
          <View style={styles.emptyEvents}>
            <Text style={styles.emptyText}>暂无点击事件</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {script.events.map((event, index) => (
              <View key={event.id || index} style={styles.eventItem}>
                <View style={styles.eventNumber}>
                  <Text style={styles.eventNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventType}>
                    {getEventTypeText(event.type)}
                  </Text>
                  <Text style={styles.eventPosition}>
                    位置: ({Math.round(event.x)}, {Math.round(event.y)})
                  </Text>
                  <Text style={styles.eventTime}>
                    时间: {(event.timestamp / 1000).toFixed(2)}秒
                  </Text>
                  {event.duration && (
                    <Text style={styles.eventDuration}>
                      持续: {(event.duration / 1000).toFixed(2)}秒
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={() => navigation.navigate('Playback', { scriptId })}
          >
            <Text style={styles.actionButtonText}>▶ 开始执行</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.duplicateButton]}
            onPress={handleDuplicate}
          >
            <Text style={styles.actionButtonText}>📋 复制脚本</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              🗑 删除脚本
            </Text>
          </TouchableOpacity>
        </View>

        {/* 底部留白 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    fontSize: 16,
    color: '#2196F3',
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  timeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyEvents: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  eventsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventDetails: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventPosition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  eventDuration: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  duplicateButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  bottomPadding: {
    height: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 100,
  },
});
