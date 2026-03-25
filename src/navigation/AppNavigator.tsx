import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { RecordingScreen } from '../screens/RecordingScreen';
import { PlaybackScreen } from '../screens/PlaybackScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { ScriptDetailScreen } from '../screens/ScriptDetailScreen';
import { ScriptEditScreen } from '../screens/ScriptEditScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Recording: { mode: 'record' | 'manual' };
  Playback: { scriptId: string };
  Schedule: undefined;
  ScriptDetail: { scriptId: string };
  ScriptEdit: { scriptId: string };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="Recording" 
          component={RecordingScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Playback" 
          component={PlaybackScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="ScriptDetail" component={ScriptDetailScreen} />
        <Stack.Screen name="ScriptEdit" component={ScriptEditScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
