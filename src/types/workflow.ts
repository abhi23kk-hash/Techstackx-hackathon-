export type AppSource =
  | 'gmail'
  | 'excel'
  | 'crm'
  | 'slack'
  | 'browser'
  | 'filesystem'
  | 'terminal'
  | 'stripe';

export type ActionType =
  | 'read_email'
  | 'download_attachment'
  | 'open_app'
  | 'search_customer'
  | 'update_crm_record'
  | 'send_slack_message'
  | 'read_spreadsheet'
  | 'write_spreadsheet_row'
  | 'copy_clipboard'
  | 'paste_clipboard'
  | 'keystroke_sequence'
  | 'file_moved'
  | 'http_request';

export type AutomationTierId =
  | 'tier1_api'
  | 'tier2_app'
  | 'tier3_accessibility'
  | 'tier4_browser'
  | 'tier5_vision';

export interface AutomationTierConfig {
  id: AutomationTierId;
  name: string;
  reliability: number; // 0 - 100%
  latencyMs: number;
  description: string;
  badge: string;
  color: string;
}

export interface DesktopEvent {
  id: string;
  timestamp: number;
  app: AppSource;
  appName: string;
  windowTitle: string;
  actionType: ActionType;
  actionLabel: string;
  targetSelector?: string;
  targetElement?: string;
  payload: Record<string, any>;
  durationMs: number;
  confidence: number;
}

export interface WorkflowCondition {
  field: string;
  operator: 'exists' | 'equals' | 'contains' | 'greater_than';
  value: any;
  ifFalseAction: 'fail' | 'escalate_to_human' | 'skip';
  description: string;
}

export interface WorkflowStep {
  id: string;
  order: number;
  title: string;
  description: string;
  app: AppSource;
  actionType: ActionType;
  preferredTier: AutomationTierId;
  activeTier: AutomationTierId;
  availableTiers: AutomationTierId[];
  parameters: Record<string, any>;
  variablesIn: string[];
  variablesOut: string[];
  condition?: WorkflowCondition;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'healed' | 'waiting_approval';
  latencyMs?: number;
  failureReason?: string;
  healedFrom?: AutomationTierId;
}

export interface DiscoveredWorkflow {
  id: string;
  title: string;
  intent: string;
  summary: string;
  category: 'Customer Ops' | 'Finance & Accounting' | 'Sales Engineering' | 'IT Support';
  status: 'discovered' | 'approved' | 'active' | 'paused';
  repetitionCount: number;
  similarityScore: number; // e.g. 0.94
  avgManualSeconds: number;
  avgAutomatedSeconds: number;
  minutesSavedPerRun: number;
  totalRuns: number;
  totalMinutesSaved: number;
  trigger: {
    type: 'event' | 'schedule' | 'manual' | 'ai_observer';
    sourceApp: AppSource;
    description: string;
    samplePayload?: Record<string, any>;
  };
  steps: WorkflowStep[];
  discoveredAt: string;
  lastRunAt?: string;
  healingEventsCount: number;
  tags: string[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 - 100
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface GamificationState {
  userLevel: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  totalTasksAutomated: number;
  totalMinutesSaved: number;
  cognitiveLoadSavedHours: number;
  hourlyDollarRate: number;
  badges: AchievementBadge[];
}

export interface ExecutionLogItem {
  id: string;
  timestamp: string;
  workflowId: string;
  stepId?: string;
  stepTitle?: string;
  tierUsed?: AutomationTierId;
  type: 'info' | 'success' | 'warning' | 'error' | 'healed';
  message: string;
  details?: Record<string, any>;
}

export interface TransitionMetric {
  fromApp: AppSource;
  toApp: AppSource;
  count: number;
  avgDelaySec: number;
  percentage: number;
}
