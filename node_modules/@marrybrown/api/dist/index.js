import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SAUCE_TYPES, SEED_USERS, SAUCE_EXPIRY_RULES, LOW_STOCK_THRESHOLD, EXPIRING_SOON_HOURS, calculateSauceConsumption } from '@marrybrown/shared';
const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, '../data.json');
app.use(cors());
app.use(express.json());
// Initialize data store
function initDataStore() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    }
    // Initialize with seed data
    const initialData = {
        users: SEED_USERS,
        sauceBatches: [],
        orders: [],
        audits: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
}
function saveDataStore(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
let dataStore = initDataStore();
// Helper: Calculate sauce status
function calculateSauceStatus(batch) {
    if (!batch.expiryAt && !batch.computedExpiryAt) {
        return 'safe';
    }
    const expiryDate = new Date(batch.expiryAt || batch.computedExpiryAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilExpiry < 0) {
        return 'expired';
    }
    else if (hoursUntilExpiry <= EXPIRING_SOON_HOURS) {
        return 'expiring_soon';
    }
    return 'safe';
}
// Helper: Compute expiry date for sauces with rules
function computeExpiryDate(createdAt, sauceType) {
    const expiryDays = SAUCE_EXPIRY_RULES[sauceType];
    if (!expiryDays) {
        return null;
    }
    const created = new Date(createdAt);
    created.setDate(created.getDate() + expiryDays);
    return created.toISOString();
}
// Auth: Login
app.post('/auth/login', (req, res) => {
    const { payrollId } = req.body;
    const user = dataStore.users.find(u => u.payrollId === payrollId);
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid payroll ID' });
    }
    return res.json({ success: true, data: { user } });
});
// Users: Get all
app.get('/users', (req, res) => {
    res.json({ success: true, data: dataStore.users });
});
// Sauces: Get all batches and inventory
app.get('/sauces', (req, res) => {
    // Update statuses
    dataStore.sauceBatches.forEach(batch => {
        batch.status = calculateSauceStatus(batch);
    });
    // Calculate inventory by sauce type
    const inventory = SAUCE_TYPES.map(sauceType => {
        const batches = dataStore.sauceBatches.filter(b => b.sauceType === sauceType);
        const totalRemaining = batches.reduce((sum, b) => sum + b.portionsRemaining, 0);
        const expiringSoonCount = batches.filter(b => b.status === 'expiring_soon').length;
        const expiredCount = batches.filter(b => b.status === 'expired').length;
        return {
            sauceType,
            totalRemaining,
            batches,
            lowStock: totalRemaining <= LOW_STOCK_THRESHOLD,
            expiringSoonCount,
            expiredCount
        };
    });
    saveDataStore(dataStore);
    res.json({ success: true, data: inventory });
});
// Sauces: Add batch
app.post('/sauces/batches', (req, res) => {
    const { sauceType, portionsAdded, expiryAt, preparedBy } = req.body;
    if (!sauceType || !portionsAdded || !preparedBy) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const createdAt = new Date().toISOString();
    const computedExpiryAt = computeExpiryDate(createdAt, sauceType);
    const batch = {
        id: uuidv4(),
        sauceType,
        portionsAdded,
        portionsRemaining: portionsAdded,
        preparedBy,
        createdAt,
        expiryAt: expiryAt || null,
        computedExpiryAt,
        status: 'safe'
    };
    batch.status = calculateSauceStatus(batch);
    dataStore.sauceBatches.push(batch);
    // Create audit
    const audit = {
        id: uuidv4(),
        action: 'CREATE_SAUCE_BATCH',
        entity: 'SauceBatch',
        entityId: batch.id,
        performedBy: preparedBy,
        timestamp: createdAt,
        details: `Added ${portionsAdded} portions of ${sauceType}`
    };
    dataStore.audits.push(audit);
    saveDataStore(dataStore);
    return res.json({ success: true, data: batch });
});
// Sauces: Delete batch (discard expired)
app.delete('/sauces/batches/:id', (req, res) => {
    const { id } = req.params;
    const { discardedBy } = req.body;
    const batchIndex = dataStore.sauceBatches.findIndex(b => b.id === id);
    if (batchIndex === -1) {
        return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    const batch = dataStore.sauceBatches[batchIndex];
    // Create audit entry
    const audit = {
        id: uuidv4(),
        action: 'BATCH_DISCARDED',
        entity: 'SauceBatch',
        entityId: batch.id,
        performedBy: discardedBy || { payrollId: 'unknown', name: 'Unknown', role: 'staff' },
        timestamp: new Date().toISOString(),
        details: `Discarded expired batch: ${batch.portionsRemaining} portions of ${batch.sauceType}`
    };
    dataStore.audits.push(audit);
    // Remove the batch
    dataStore.sauceBatches.splice(batchIndex, 1);
    saveDataStore(dataStore);
    return res.json({ success: true, data: { discardedBatch: batch } });
});
// Orders: Create order
app.post('/orders', (req, res) => {
    const { items, createdBy } = req.body;
    if (!items || !items.length || !createdBy) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    // Calculate sauce consumption
    const consumption = calculateSauceConsumption(items);
    // Deduct from sauce inventory (simple total deduction)
    // TODO: Implement FIFO by earliest expiry before production deployment
    for (const [sauceType, qtyNeeded] of Object.entries(consumption)) {
        if (!qtyNeeded)
            continue;
        let remaining = qtyNeeded;
        const batches = dataStore.sauceBatches
            .filter(b => b.sauceType === sauceType && b.portionsRemaining > 0 && b.status !== 'expired')
            .sort((a, b) => {
            // Sort by expiry date (earliest first), then by creation date
            const aExpiry = a.expiryAt || a.computedExpiryAt || '9999-12-31';
            const bExpiry = b.expiryAt || b.computedExpiryAt || '9999-12-31';
            return new Date(aExpiry).getTime() - new Date(bExpiry).getTime();
        });
        for (const batch of batches) {
            if (remaining <= 0)
                break;
            const deduct = Math.min(batch.portionsRemaining, remaining);
            batch.portionsRemaining -= deduct;
            remaining -= deduct;
        }
    }
    const order = {
        id: uuidv4(),
        items,
        createdAt: new Date().toISOString(),
        createdBy,
        totals: {
            itemCount: items.reduce((sum, item) => sum + item.qty, 0)
        }
    };
    dataStore.orders.push(order);
    // Create audit
    const audit = {
        id: uuidv4(),
        action: 'CREATE_ORDER',
        entity: 'Order',
        entityId: order.id,
        performedBy: createdBy,
        timestamp: order.createdAt,
        details: `Order with ${order.totals?.itemCount} items`
    };
    dataStore.audits.push(audit);
    saveDataStore(dataStore);
    return res.json({ success: true, data: order });
});
// Orders: Get recent orders
app.get('/orders', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const orders = [...dataStore.orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    res.json({ success: true, data: orders });
});
// Audits: Get all
app.get('/audits', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const audits = [...dataStore.audits]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    res.json({ success: true, data: audits });
});
// Audits: Create
app.post('/audits', (req, res) => {
    const audit = {
        id: uuidv4(),
        ...req.body,
        timestamp: req.body.timestamp || new Date().toISOString()
    };
    dataStore.audits.push(audit);
    saveDataStore(dataStore);
    res.json({ success: true, data: audit });
});
// Reset: Clear all data (dev only)
app.post('/reset', (req, res) => {
    dataStore = {
        users: SEED_USERS,
        sauceBatches: [],
        orders: [],
        audits: []
    };
    saveDataStore(dataStore);
    res.json({ success: true, message: 'Data reset to seed state' });
});
// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'API is running' });
});
app.listen(PORT, () => {
    console.log(`MarryBrown API server running on http://localhost:${PORT}`);
});
