import { POSItem, SauceType } from './types';

// Sauce consumption mapping: which sauces are consumed by which menu items
export const POS_MENU_ITEMS: POSItem[] = [
  // Chicken Meals
  { id: 'cm1', name: '2pc Chicken Meal', category: 'Chicken Meals', price: 12.90 },
  { id: 'cm2', name: '3pc Chicken Meal', category: 'Chicken Meals', price: 15.90 },
  { id: 'cm3', name: '5pc Chicken Meal', category: 'Chicken Meals', price: 22.90 },
  { id: 'cm4', name: 'Chicken Fillet Burger Meal', category: 'Chicken Meals', price: 13.90 },
  
  // Burger Meals
  { id: 'bm1', name: 'MB Classic Burger', category: 'Burger Meals', price: 10.90 },
  { id: 'bm2', name: 'MB Spicy Burger', category: 'Burger Meals', price: 11.90 },
  { id: 'bm3', name: 'MB Double Burger', category: 'Burger Meals', price: 14.90 },
  
  // MB Specials
  { id: 'ms1', name: 'MB Value Pack', category: 'MB Specials', price: 19.90 },
  { id: 'ms2', name: 'MB Family Feast', category: 'MB Specials', price: 45.90 },
  { id: 'ms3', name: 'MB Rice Box', category: 'MB Specials', price: 11.90 },
  
  // Sharing Meals
  { id: 'sm1', name: '8pc Sharing Meal', category: 'Sharing Meals', price: 32.90 },
  { id: 'sm2', name: '12pc Sharing Meal', category: 'Sharing Meals', price: 45.90 },
  { id: 'sm3', name: '16pc Party Pack', category: 'Sharing Meals', price: 59.90 },
  
  // Kids Meals
  { id: 'km1', name: 'Kids Chicken Meal', category: 'Kids Meals', price: 8.90 },
  { id: 'km2', name: 'Kids Burger Meal', category: 'Kids Meals', price: 8.90 },
  
  // Sauces - these directly consume sauce inventory
  { 
    id: 's1', 
    name: 'Cheese Sauce', 
    category: 'Sauces', 
    price: 1.50,
    sauceConsumption: { 'Cheese': 1 }
  },
  { 
    id: 's2', 
    name: 'Garlic Sauce', 
    category: 'Sauces', 
    price: 1.50,
    sauceConsumption: { 'Garlic': 1 }
  },
  { 
    id: 's3', 
    name: 'BBQ Sauce', 
    category: 'Sauces', 
    price: 1.50,
    sauceConsumption: { 'Smoke BBQ': 1 }
  },
  { 
    id: 's4', 
    name: 'Sweet & Sour Sauce', 
    category: 'Sauces', 
    price: 1.50,
    sauceConsumption: { 'Sweet & Sour': 1 }
  },
  { 
    id: 's5', 
    name: 'Coleslaw Regular', 
    category: 'Sauces', 
    price: 2.50,
    sauceConsumption: { 'Coleslaw Regular': 1 }
  },
  { 
    id: 's6', 
    name: 'Coleslaw Large', 
    category: 'Sauces', 
    price: 4.50,
    sauceConsumption: { 'Coleslaw Large': 1 }
  },
  
  // Desserts
  { id: 'd1', name: 'Apple Pie', category: 'Desserts', price: 3.50 },
  { id: 'd2', name: 'Ice Cream Sundae', category: 'Desserts', price: 4.50 },
  { id: 'd3', name: 'Brownie', category: 'Desserts', price: 4.00 },
  
  // Drinks
  { id: 'dr1', name: 'Soft Drink (Regular)', category: 'Drinks', price: 3.50 },
  { id: 'dr2', name: 'Soft Drink (Large)', category: 'Drinks', price: 4.50 },
  { id: 'dr3', name: 'Water', category: 'Drinks', price: 3.00 },
  { id: 'dr4', name: 'Juice', category: 'Drinks', price: 4.00 },
  { id: 'dr5', name: 'Milkshake', category: 'Drinks', price: 5.50 },
];

// Get items by category
export function getItemsByCategory(category: string): POSItem[] {
  return POS_MENU_ITEMS.filter(item => item.category === category);
}

// Get total sauce consumption for an order
export function calculateSauceConsumption(items: { itemId: string; qty: number }[]): Partial<Record<SauceType, number>> {
  const consumption: Partial<Record<SauceType, number>> = {};
  
  items.forEach(item => {
    const menuItem = POS_MENU_ITEMS.find(m => m.id === item.itemId);
    if (menuItem?.sauceConsumption) {
      Object.entries(menuItem.sauceConsumption).forEach(([sauce, qty]) => {
        const sauceType = sauce as SauceType;
        consumption[sauceType] = (consumption[sauceType] || 0) + (qty * item.qty);
      });
    }
  });
  
  return consumption;
}