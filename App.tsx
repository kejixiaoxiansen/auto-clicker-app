import React, { useEffect } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/stores/useAppStore';

const App: React.FC = () => {
  const { settings } = useAppStore();

  useEffect(() => {
    // 请求必要权限
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // 请求悬浮窗权限
        const overlayPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW,
          {
            title: '需要悬浮窗权限',
            message: '自动点击器需要悬浮窗权限才能在其他应用上显示控制按钮',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );

        // 请求存储权限
        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '需要存储权限',
            message: '用于保存点击脚本数据',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );

        if (overlayPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            '权限不足',
            '悬浮窗权限是必需的，请在设置中开启',
            [
              { text: '知道了', onPress: () => {} },
            ]
          );
        }
      } catch (err) {
        console.warn('权限请求失败:', err);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <View style={styles.container}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;
