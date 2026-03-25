import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/useAppStore';
import { ScriptCard } from '../components\ScriptCard';
import { ClickScript } from '../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { scripts, startPlayback } = useAppStore();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleScriptPress = (script: ClickScript) => {
    navigation.navigate('ScriptDetail', { scriptId: script.id });
  };

  const handleScriptEdit = (script: ClickScript) => {
    navigation.navigate('ScriptEdit', { scriptId: script.id });
  };

  const handleScriptPlay = (script: ClickScript) => {
    if (script.events.length === 0) {
      Alert.alert('提示', '该脚本没有点击事件');
      return;
    }
    navigation.navigate('Playback', { scriptId: script.id });
  };

  const handleCreateScript = (mode: 'record' | 'manual') => {
    setShowCreateMenu(false);
    navigation.navigate('Recording', { mode });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>还没有脚本</Text>
      <Text style={styles.emptySubtitle}>
        点击右下角按钮创建你的第一个自动点击脚本
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>自动点击器</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 脚本列表 */}
      <FlatList
        data={scripts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScriptCard
            script={item}
            onPress={() => handleScriptPress(item)}
            onEdit={() => handleScriptEdit(item)}
            onPlay={() => handleScriptPlay(item)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          scripts.length === 0 ? styles.emptyList : styles.list
        }
      />

      {/* 创建菜单 */}
      {showCreateMenu && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowCreateMenu(false)}
        >
          <View style={styles.createMenu}>
            <TouchableOpacity
              style={styles.createMenuItem}
              onPress={() => handleCreateScript('record')}
            >
              <Text style={styles.createMenuIcon}>⏺</Text>
              <View style={styles.createMenuTextContainer}>
                <Text style={styles.createMenuTitle}>录制点击</Text>
                <Text style={styles.createMenuSubtitle}>
                  录制你的点击操作过程
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.createMenuItem}
              onPress={() => handleCreateScript('manual')}
            >
              <Text style={styles.createMenuIcon}>👆</Text>
              <View style={styles.createMenuTextContainer}>
                <Text style={styles.createMenuTitle}>手动设置</Text>
                <Text style={styles.createMenuSubtitle}>
                  按顺序点击屏幕设置位置
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* 创建按钮 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateMenu(!showCreateMenu)}
      >
        <Text style={styles.fabIcon}>{showCreateMenu ? '✕' : '+'}</Text>
      </TouchableOpacity>

      {/* 定时任务入口 */}
      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => navigation.navigate('Schedule')}
      >
        <Text style={styles.scheduleIcon}>⏰</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  list: {
    paddingVertical: 8,
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
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  createMenu: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  createMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  createMenuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  createMenuTextContainer: {
    flex: 1,
  },
  createMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  createMenuSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
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
    zIndex: 101,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  scheduleButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 101,
  },
  scheduleIcon: {
    fontSize: 20,
  },
});
