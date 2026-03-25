import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ClickScript, 
  ClickEvent, 
  RecordingStatus, 
  PlaybackStatus,
  ScheduledTask,
  Settings 
} from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppStore {
  // 脚本列表
  scripts: ClickScript[];
  
  // 录制状态
  recordingStatus: RecordingStatus;
  recordingStartTime: number;
  recordedEvents: ClickEvent[];
  tempScriptName: string;
  
  // 播放状态
  playbackStatus: PlaybackStatus;
  currentScript: ClickScript | null;
  currentEventIndex: number;
  playbackSpeed: number;
  isLooping: boolean;
  loopCount: number;
  currentLoop: number;
  
  // 定时任务
  scheduledTasks: ScheduledTask[];
  
  // 设置
  settings: Settings;
  
  // 操作方法 - 脚本管理
  addScript: (script: Omit<ClickScript, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateScript: (id: string, updates: Partial<ClickScript>) => void;
  deleteScript: (id: string) => void;
  getScript: (id: string) => ClickScript | undefined;
  duplicateScript: (id: string) => string;
  
  // 操作方法 - 录制
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  addRecordedEvent: (event: Omit<ClickEvent, 'id' | 'timestamp'>) => void;
  clearRecordedEvents: () => void;
  setTempScriptName: (name: string) => void;
  
  // 操作方法 - 播放
  startPlayback: (script: ClickScript) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  nextEvent: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setLooping: (looping: boolean) => void;
  setLoopCount: (count: number) => void;
  incrementLoop: () => void;
  resetPlayback: () => void;
  
  // 操作方法 - 定时任务
  addScheduledTask: (task: Omit<ScheduledTask, 'id'>) => string;
  updateScheduledTask: (id: string, updates: Partial<ScheduledTask>) => void;
  deleteScheduledTask: (id: string) => void;
  toggleScheduledTask: (id: string) => void;
  
  // 操作方法 - 设置
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  showClickIndicator: true,
  clickIndicatorSize: 20,
  clickIndicatorColor: '#FF5722',
  defaultSpeed: 1,
  autoSave: true,
  vibrationEnabled: true,
  soundEnabled: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      scripts: [],
      recordingStatus: 'idle',
      recordingStartTime: 0,
      recordedEvents: [],
      tempScriptName: '',
      playbackStatus: 'idle',
      currentScript: null,
      currentEventIndex: 0,
      playbackSpeed: 1,
      isLooping: false,
      loopCount: 1,
      currentLoop: 0,
      scheduledTasks: [],
      settings: defaultSettings,
      
      // 脚本管理
      addScript: (script) => {
        const id = uuidv4();
        const now = Date.now();
        const newScript: ClickScript = {
          ...script,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          scripts: [...state.scripts, newScript],
        }));
        return id;
      },
      
      updateScript: (id, updates) => {
        set((state) => ({
          scripts: state.scripts.map((script) =>
            script.id === id
              ? { ...script, ...updates, updatedAt: Date.now() }
              : script
          ),
        }));
      },
      
      deleteScript: (id) => {
        set((state) => ({
          scripts: state.scripts.filter((script) => script.id !== id),
          scheduledTasks: state.scheduledTasks.filter((task) => task.scriptId !== id),
        }));
      },
      
      getScript: (id) => {
        return get().scripts.find((script) => script.id === id);
      },
      
      duplicateScript: (id) => {
        const script = get().getScript(id);
        if (!script) return '';
        
        const newId = uuidv4();
        const now = Date.now();
        const duplicatedScript: ClickScript = {
          ...script,
          id: newId,
          name: `${script.name} (复制)`,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          scripts: [...state.scripts, duplicatedScript],
        }));
        return newId;
      },
      
      // 录制控制
      startRecording: () => {
        set({
          recordingStatus: 'recording',
          recordingStartTime: Date.now(),
          recordedEvents: [],
        });
      },
      
      pauseRecording: () => {
        set({ recordingStatus: 'paused' });
      },
      
      resumeRecording: () => {
        set({ recordingStatus: 'recording' });
      },
      
      stopRecording: () => {
        set({ recordingStatus: 'idle' });
      },
      
      addRecordedEvent: (event) => {
        const now = Date.now();
        const timestamp = now - get().recordingStartTime;
        
        const newEvent: ClickEvent = {
          ...event,
          id: uuidv4(),
          timestamp,
        };
        
        set((state) => ({
          recordedEvents: [...state.recordedEvents, newEvent],
        }));
      },
      
      clearRecordedEvents: () => {
        set({ recordedEvents: [] });
      },
      
      setTempScriptName: (name) => {
        set({ tempScriptName: name });
      },
      
      // 播放控制
      startPlayback: (script) => {
        set({
          playbackStatus: 'playing',
          currentScript: script,
          currentEventIndex: 0,
          playbackStartTime: Date.now(),
          currentLoop: 0,
        });
      },
      
      pausePlayback: () => {
        set({ playbackStatus: 'paused' });
      },
      
      resumePlayback: () => {
        set({ playbackStatus: 'playing' });
      },
      
      stopPlayback: () => {
        set({
          playbackStatus: 'idle',
          currentEventIndex: 0,
          currentLoop: 0,
        });
      },
      
      nextEvent: () => {
        const { currentScript, currentEventIndex } = get();
        if (!currentScript) return;
        
        const nextIndex = currentEventIndex + 1;
        if (nextIndex >= currentScript.events.length) {
          // 当前循环结束
          const { isLooping, loopCount, currentLoop } = get();
          if (isLooping && (loopCount === 0 || currentLoop < loopCount - 1)) {
            set({
              currentEventIndex: 0,
              currentLoop: currentLoop + 1,
            });
          } else {
            set({ playbackStatus: 'idle', currentEventIndex: 0, currentLoop: 0 });
          }
        } else {
          set({ currentEventIndex: nextIndex });
        }
      },
      
      setPlaybackSpeed: (speed) => {
        set({ playbackSpeed: Math.max(0.1, Math.min(5, speed)) });
      },
      
      setLooping: (looping) => {
        set({ isLooping: looping });
      },
      
      setLoopCount: (count) => {
        set({ loopCount: Math.max(0, count) });
      },
      
      incrementLoop: () => {
        set((state) => ({ currentLoop: state.currentLoop + 1 }));
      },
      
      resetPlayback: () => {
        set({
          playbackStatus: 'idle',
          currentEventIndex: 0,
          currentLoop: 0,
        });
      },
      
      // 定时任务
      addScheduledTask: (task) => {
        const id = uuidv4();
        const newTask: ScheduledTask = { ...task, id };
        set((state) => ({
          scheduledTasks: [...state.scheduledTasks, newTask],
        }));
        return id;
      },
      
      updateScheduledTask: (id, updates) => {
        set((state) => ({
          scheduledTasks: state.scheduledTasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },
      
      deleteScheduledTask: (id) => {
        set((state) => ({
          scheduledTasks: state.scheduledTasks.filter((task) => task.id !== id),
        }));
      },
      
      toggleScheduledTask: (id) => {
        set((state) => ({
          scheduledTasks: state.scheduledTasks.map((task) =>
            task.id === id ? { ...task, enabled: !task.enabled } : task
          ),
        }));
      },
      
      // 设置
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: 'auto-clicker-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        scripts: state.scripts,
        scheduledTasks: state.scheduledTasks,
        settings: state.settings,
      }),
    }
  )
);
