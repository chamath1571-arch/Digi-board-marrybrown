// User Types
export type UserRole = 'staff' | 'shift_manager' | 'head_staff';

export interface User {
  payrollId: string;
  name: string;
  role: UserRole;
}

// Audit Types
export interface Audit {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: User;
  timestamp: string;
  details?: string;
}

// Chicken Production Types
export type ChickenType = 
  | 'Bone-in Original' 
  | 'Bone-in Spicy';

export interface ChickenLogEntry {
  id: string;
  date: string;
  timeSlot: string;
  chickenType: ChickenType;
  headsDropped: number;
  pieces: number; // headsDropped x 9
  submittedBy: User;
  timestamp: string;
}

// Sauce Types
export type SauceType = 
  | 'Cheese' 
  | 'Smoke BBQ' 
  | 'Garlic' 
  | 'Sweet & Sour' 
  | 'Coleslaw Regular' 
  | 'Coleslaw Large';

export type SauceBatchStatus = 'safe' | 'expiring_soon' | 'expired';

export interface SauceBatch {
  id: string;
  sauceType: SauceType;
  portionsAdded: number;
  portionsRemaining: number;
  preparedBy: User;
  createdAt: string;
  expiryAt: string | null;
  computedExpiryAt: string | null;
  status: SauceBatchStatus;
}

export interface SauceInventory {
  sauceType: SauceType;
  totalRemaining: number;
  batches: SauceBatch[];
  lowStock: boolean;
  expiringSoonCount: number;
  expiredCount: number;
}

// POS Types
export type POSCategory = 
  | 'Chicken Meals' 
  | 'Burger Meals' 
  | 'MB Specials' 
  | 'Sharing Meals' 
  | 'Kids Meals' 
  | 'Sauces' 
  | 'Desserts' 
  | 'Drinks';

export interface POSItem {
  id: string;
  name: string;
  category: POSCategory;
  price?: number;
  sauceConsumption?: Partial<Record<SauceType, number>>;
}

export interface OrderItem {
  itemId: string;
  name: string;
  qty: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  createdAt: string;
  createdBy: User;
  totals?: {
    itemCount: number;
  };
}

// Shift Types
export type ShiftArea = 'FOH' | 'BOH';

export interface Shift {
  id: string;
  date: string;
  memberName: string;
  area: ShiftArea;
  startTime: string;
  endTime: string;
}

export interface WeeklyRoster {
  id: string;
  weekStartDate: string;
  published: boolean;
  shifts: Shift[];
}

export interface DailyOverride {
  id: string;
  date: string;
  shifts: Shift[];
  createdBy: User;
  createdAt: string;
}

// Task Types
export type TaskLabel = 'mandatory' | 'variable';

export interface Task {
  id: string;
  name: string;
  label: TaskLabel;
  completed: boolean;
  completedBy?: User | null;
  completedAt?: string;
  isFridayOnly?: boolean;
}

export interface TaskHistoryEntry {
  id: string;
  taskName: string;
  completedBy: User;
  completedAt: string;
}

// Notes & Alerts Types
export type NoteLabel = 'important' | 'critical' | 'tips';

export interface Note {
  id: string;
  message: string;
  label: NoteLabel;
  postedBy: User;
  postedAt: string;
  active: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  payrollId: string;
}

export interface LoginResponse {
  user: User;
}

// Sauce Batch Request
export interface CreateSauceBatchRequest {
  sauceType: SauceType;
  portionsAdded: number;
  expiryAt?: string | null;
}

// Order Request
export interface CreateOrderRequest {
  items: OrderItem[];
}