import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppStore } from '../stores/useAppStore';

type ScriptEditScreenRouteProp = RouteProp<
  { ScriptEdit: { scriptId: string } },
  'ScriptEdit'
>;

export const ScriptEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScriptEditScreenRouteProp>();
  const { scriptId } = route.params;
  
  const { getScript, updateScript } = useAppStore();
  const script = getScript(scriptId);

  const [name, setName] = useState(script?.name || '');
  const [description, setDescription] = useState(script?.description || '');
  const [speed, setSpeed] = useState(script?.speed || 1);
  const [loopCount, setLoopCount] = useState(script?.loopCount || 1);

  if (!script) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>脚本不存在</Text>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入脚本名称');
      return;
    }

    updateScript(scriptId, {
      name: name.trim(),
      description: description.trim(),
      speed,
      loopCount,
    });

    Alert.alert('成功', '脚本已更新', [
      { text: '确定', onPress: () => navigation.goBack() },
    ]);
  };

  const speedOptions = [0.5, 1, 1.5, 2, 3, 5];

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>编辑脚本</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 基本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          <View style={styles.card}>
            <Text style={styles.label}>脚本名称 *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="输入脚本名称"
              maxLength={50}
            />

            <Text style={styles.label}>描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="输入脚本描述（可选）"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>

        {/* 播放设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放设置</Text>
          <View style={styles.card}>
            <Text style={styles.label}>播放速度</Text>
            <View style={styles.speedOptions}>
              {speedOptions.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.speedOption,
                    speed === s && styles.speedOptionActive,
                  ]}
                  onPress={() => setSpeed(s)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      speed === s && styles.speedOptionTextActive,
                    ]}
                  >
                    {s}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>循环次数</Text>
            <View style={styles.loopContainer}>
              <TouchableOpacity
                style={styles.loopButton}
                onPress={() => setLoopCount(Math.max(0, loopCount - 1))}
              >
                <Text style={styles.loopButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.loopCount}>
                {loopCount === 0 ? '无限循环' : `${loopCount} 次`}
              </Text>
              <TouchableOpacity
                style={styles.loopButton}
                onPress={() => setLoopCount(loopCount + 1)}
              >
                <Text style={styles.loopButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>设置为 0 表示无限循环</Text>
          </View>
        </View>

        {/* 事件统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>事件统计</Text>
          <View style={styles.card}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>点击事件数</Text>
              <Text style={styles.statValue}>{script.events.length} 个</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>总时长</Text>
              <Text style={styles.statValue}>
                {script.events.length > 0
                  ? `${(script.events[script.events.length - 1].timestamp / 1000).toFixed(2)} 秒`
                  : '0 秒'}
              </Text>
            </View>
          </View>
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
  },
  saveButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    padding: 8,
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
    padding: 16,
  },
  label: {
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
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  speedOption: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  speedOptionActive: {
    backgroundColor: '#2196F3',
  },
  speedOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  speedOptionTextActive: {
    color: '#fff',
  },
  loopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loopButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  loopCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 80,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
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
