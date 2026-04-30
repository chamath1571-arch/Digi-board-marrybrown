# MarryBrown Plenty Valley - DigiBoard System

A comprehensive operations dashboard and POS system for MarryBrown Plenty Valley (Australia), replacing the physical whiteboard with a digital solution for managing daily kitchen operations.

## Features

### Dashboard (DigiBoard)
- **Chicken Production Log**: Track hourly chicken production with weekly summaries and demand forecasting
- **Sauce Tracker**: Monitor sauce inventory with expiry alerts and low stock warnings
- **Special Notes & Alerts**: Management announcements with priority labels
- **Task Management**: Daily mandatory tasks with auto-reset and Friday-specific tasks
- **Weekly Digital Roster**: Staff scheduling with FOH/BOH separation
- **Daily Shift Board**: Override shifts without mutating weekly roster

### POS System
- **ABACUS-like Ordering**: Category-based menu with cart management
- **Sauce Consumption Tracking**: Automatic inventory deduction based on orders
- **Order History**: View recent orders

### Authentication
- Payroll ID-based login
- Role-based permissions (staff, shift_manager, head_staff)

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **API**: Express.js with JSON file persistence
- **Build Tool**: Vite
- **Package Manager**: npm workspaces

## Project Structure

```
marrybrown-plenty-valley/
├── apps/
│   ├── dashboard/     # Operations dashboard (port 5173)
│   ├── pos/           # POS system (port 5174)
│   └── api/           # Express API (port 4000)
├── packages/
│   └── shared/        # Shared types, constants, and helpers
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### Running the Applications

```bash
# Run API server
npm run dev:api

# Run Dashboard (in another terminal)
npm run dev:dashboard

# Run POS (in another terminal)
npm run dev:pos

# Run all concurrently
npm run dev
```

### Accessing the Apps

- Dashboard: http://localhost:5173
- POS: http://localhost:5174
- API: http://localhost:4000

## Demo Users

| Payroll ID | Name | Role |
|------------|------|------|
| 1001 | Sankar | Head Staff |
| 1002 | Manager One | Shift Manager |
| 1003 | Staff One | Staff |
| 1004 | Staff Two | Staff |

## Sauce Types

- Cheese
- Smoke BBQ
- Garlic
- Sweet & Sour
- Coleslaw Regular
- Coleslaw Large

## Expiry Rules

- **Coleslaw Regular/Large**: Auto-expire 3 days from production
- **Other sauces**: Manual expiry date (optional)

## Status Indicators

- 🟢 **Green (Safe)**: Expiry > 24 hours away
- 🟡 **Amber (Expiring Soon)**: Expiry within 24 hours
- 🔴 **Red (Expired)**: Past expiry date, remove immediately

## API Endpoints

- `POST /auth/login` - Login with payroll ID
- `GET /users` - List all users
- `GET /sauces` - Get sauce inventory
- `POST /sauces/batches` - Add sauce batch
- `POST /orders` - Create order (updates sauce inventory)
- `GET /orders` - List recent orders
- `POST /reset` - Reset demo data

## License

Private - MarryBrown Plenty Valley