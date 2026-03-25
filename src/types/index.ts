// 点击事件类型
export interface ClickEvent {
  id: string;
  x: number;
  y: number;
  timestamp: number; // 相对于脚本开始的时间（毫秒）
  type: 'tap' | 'longPress' | 'swipe';
  duration?: number; // 长按或滑动的持续时间
  endX?: number; // 滑动结束位置
  endY?: number;
}

// 点击脚本
export interface ClickScript {
  id: string;
  name: string;
  description?: string;
  events: ClickEvent[];
  createdAt: number;
  updatedAt: number;
  loopCount: number; // 循环次数，0表示无限循环
  speed: number; // 速度倍数 (0.5x - 5x)
}

// 录制状态
export type RecordingStatus = 'idle' | 'recording' | 'paused';

// 播放状态
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'waiting';

// 应用状态
export interface AppState {
  // 录制相关
  recordingStatus: RecordingStatus;
  recordingStartTime: number;
  recordedEvents: ClickEvent[];
  
  // 播放相关
  playbackStatus: PlaybackStatus;
  currentScript: ClickScript | null;
  currentEventIndex: number;
  playbackStartTime: number;
  
  // 定时任务
  scheduledTasks: ScheduledTask[];
}

// 定时任务
export interface ScheduledTask {
  id: string;
  scriptId: string;
  executeAt: number; // 执行时间戳
  repeat: 'once' | 'daily' | 'weekly';
  enabled: boolean;
}

// 悬浮窗配置
export interface FloatingConfig {
  x: number;
  y: number;
  visible: boolean;
  opacity: number;
}

// 设置
export interface Settings {
  showClickIndicator: boolean;
  clickIndicatorSize: number;
  clickIndicatorColor: string;
  defaultSpeed: number;
  autoSave: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}
