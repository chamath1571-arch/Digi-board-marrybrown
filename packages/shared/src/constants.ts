import { User, ChickenType, SauceType, POSCategory } from './types';

// Seed Users
export const SEED_USERS: User[] = [
  { payrollId: '1001', name: 'Sankar', role: 'head_staff' },
  { payrollId: '1002', name: 'Manager One', role: 'shift_manager' },
  { payrollId: '1003', name: 'Staff One', role: 'staff' },
  { payrollId: '1004', name: 'Staff Two', role: 'staff' },
];

// Chicken Types (bone-in only)
export const CHICKEN_TYPES: ChickenType[] = [
  'Bone-in Original',
  'Bone-in Spicy',
];

// Sauce Types
export const SAUCE_TYPES: SauceType[] = [
  'Cheese',
  'Smoke BBQ',
  'Garlic',
  'Sweet & Sour',
  'Coleslaw Regular',
  'Coleslaw Large',
];

// Time Slots for Chicken Production
export const TIME_SLOTS = [
  '10am-11am',
  '11am-12pm',
  '12pm-1pm',
  '1pm-2pm',
  '2pm-3pm',
  '3pm-4pm',
  '4pm-5pm',
  '5pm-6pm',
  '6pm-7pm',
  '7pm-8pm',
  '8pm-9pm',
];

// POS Categories
export const POS_CATEGORIES: POSCategory[] = [
  'Chicken Meals',
  'Burger Meals',
  'MB Specials',
  'Sharing Meals',
  'Kids Meals',
  'Sauces',
  'Desserts',
  'Drinks',
];

// Sauce Expiry Rules (in days from production)
export const SAUCE_EXPIRY_RULES: Partial<Record<SauceType, number>> = {
  'Coleslaw Regular': 3, // Including production day
  'Coleslaw Large': 3,
};

// Low Stock Threshold
export const LOW_STOCK_THRESHOLD = 20;

// Expiring Soon Threshold (in hours)
export const EXPIRING_SOON_HOURS = 24;

// Pieces per head
export const PIECES_PER_HEAD = 9;

// Forecast adjustment factor
export const FORECAST_ADJUSTMENT = 1.10;

// Days of week
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mandatory Tasks
export const MANDATORY_TASKS = [
  { name: 'Cook backup rice at 12:00pm', isFridayOnly: false },
  { name: 'Prepare ingredients for burgers and rice dishes', isFridayOnly: false },
  { name: 'Refill cheese sauce', isFridayOnly: false },
  { name: 'Refill mayonnaise', isFridayOnly: false },
  { name: 'Refill other condiments', isFridayOnly: false },
  { name: 'Marinate chickens', isFridayOnly: false },
  { name: 'Restock consumables (cardboard boxes, drink cups, paper bags, napkins)', isFridayOnly: false },
  { name: 'Oil change — weekly (Friday only)', isFridayOnly: true },
];

// Theme Colors
export const THEME_COLORS = {
  primary: '#C0392B',
  secondary: '#E67E22',
  background: '#FFFFFF',
  text: '#222222',
};

// Note Labels
export const NOTE_LABELS = ['important', 'critical', 'tips'] as const;