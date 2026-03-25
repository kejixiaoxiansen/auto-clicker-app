import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ClickScript } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ScriptCardProps {
  script: ClickScript;
  onPress: () => void;
  onEdit: () => void;
  onPlay: () => void;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  onPress,
  onEdit,
  onPlay,
}) => {
  const { deleteScript, duplicateScript } = useAppStore();

  const formatDuration = (events: ClickScript['events']) => {
    if (events.length === 0) return '0秒';
    const lastEvent = events[events.length - 1];
    const durationMs = lastEvent.timestamp + (lastEvent.duration || 0);
    const seconds = Math.ceil(durationMs / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const handleLongPress = () => {
    Alert.alert(
      script.name,
      '选择操作',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '编辑',
          onPress: onEdit,
        },
        {
          text: '复制',
          onPress: () => {
            duplicateScript(script.id);
          },
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '确认删除',
              `确定要删除脚本 "${script.name}" 吗？`,
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '删除',
                  style: 'destructive',
                  onPress: () => deleteScript(script.id),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {script.name}
          </Text>
          {script.loopCount > 1 && (
            <View style={styles.loopBadge}>
              <Text style={styles.loopText}>循环×{script.loopCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.playButton} onPress={onPlay}>
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
      </View>

      {script.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {script.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>👆</Text>
          <Text style={styles.statText}>{script.events.length} 个点击</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⏱</Text>
          <Text style={styles.statText}>{formatDuration(script.events)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⚡</Text>
          <Text style={styles.statText}>{script.speed}x</Text>
        </View>
      </View>

      <Text style={styles.date}>
        更新于 {format(script.updatedAt, 'MM-dd HH:mm', { locale: zhCN })}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  loopBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  loopText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  playIcon: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
