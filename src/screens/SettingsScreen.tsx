import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/useAppStore';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateSettings, scripts, scheduledTasks, clearRecordedEvents } = useAppStore();

  const handleClearAllData = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有数据吗？这将删除所有脚本和定时任务，此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            // 清除所有脚本
            scripts.forEach(script => {
              useAppStore.getState().deleteScript(script.id);
            });
            clearRecordedEvents();
            Alert.alert('完成', '所有数据已清除');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    type = 'switch',
  }: {
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button' | 'info';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#ddd', true: '#81C784' }}
          thumbColor={value ? '#4CAF50' : '#f4f3f4'}
        />
      )}
      {type === 'button' && (
        <Text style={styles.arrow}>›</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 显示设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>显示设置</Text>
          <View style={styles.card}>
            <SettingItem
              title="显示点击指示器"
              subtitle="执行时显示点击位置标记"
              value={settings.showClickIndicator}
              onValueChange={(value) => updateSettings({ showClickIndicator: value })}
            />
            <View style={styles.divider} />
            <SettingItem
              title="点击指示器大小"
              subtitle={`当前: ${settings.clickIndicatorSize}px`}
              type="info"
            />
          </View>
        </View>

        {/* 反馈设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>反馈设置</Text>
          <View style={styles.card}>
            <SettingItem
              title="震动反馈"
              subtitle="执行点击时震动"
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
            />
            <View style={styles.divider} />
            <SettingItem
              title="声音提示"
              subtitle="执行点击时播放声音"
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
            />
          </View>
        </View>

        {/* 播放设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放设置</Text>
          <View style={styles.card}>
            <SettingItem
              title="默认播放速度"
              subtitle={`当前: ${settings.defaultSpeed}x`}
              type="info"
            />
            <View style={styles.divider} />
            <SettingItem
              title="自动保存录制"
              subtitle="录制结束后自动保存"
              value={settings.autoSave}
              onValueChange={(value) => updateSettings({ autoSave: value })}
            />
          </View>
        </View>

        {/* 数据统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据统计</Text>
          <View style={styles.card}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>脚本数量</Text>
              <Text style={styles.statValue}>{scripts.length} 个</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>定时任务</Text>
              <Text style={styles.statValue}>{scheduledTasks.length} 个</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>总点击事件</Text>
              <Text style={styles.statValue}>
                {scripts.reduce((sum, s) => sum + s.events.length, 0)} 个
              </Text>
            </View>
          </View>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <View style={styles.card}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>应用名称</Text>
              <Text style={styles.aboutValue}>自动点击器</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>版本</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>系统要求</Text>
              <Text style={styles.aboutValue}>Android 7.0+</Text>
            </View>
          </View>
        </View>

        {/* 危险操作 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>危险操作</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
            <Text style={styles.dangerButtonText}>清除所有数据</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    color: '#666',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#333',
  },
  aboutValue: {
    fontSize: 16,
    color: '#666',
  },
  dangerTitle: {
    color: '#F44336',
  },
  dangerButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  bottomPadding: {
    height: 40,
  },
});
