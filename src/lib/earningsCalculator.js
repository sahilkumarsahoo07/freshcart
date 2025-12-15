/**
 * Centralized earnings calculation for delivery partners
 * This ensures consistency across the application
 */

const EARNINGS_CONFIG = {
    BASE_EARNING: 30,        // Base earning per delivery in ₹
    PER_ITEM_BONUS: 5,       // Bonus per item in ₹
    DISTANCE_BONUS: 10,      // Distance bonus per delivery in ₹ (fixed for now)
};

/**
 * Calculate delivery earnings for a single order
 * @param {Object} order - Order object with items array
 * @returns {Object} Earnings breakdown
 */
export function calculateOrderEarnings(order) {
    const itemCount = order.items?.length || 0;

    const baseEarning = EARNINGS_CONFIG.BASE_EARNING;
    const itemBonus = itemCount * EARNINGS_CONFIG.PER_ITEM_BONUS;
    const distanceBonus = EARNINGS_CONFIG.DISTANCE_BONUS;

    const totalEarning = baseEarning + itemBonus + distanceBonus;

    return {
        baseEarning,
        itemBonus,
        distanceBonus,
        totalEarning,
        itemCount,
    };
}

/**
 * Calculate total earnings from multiple orders
 * @param {Array} orders - Array of order objects
 * @returns {Object} Aggregated earnings breakdown
 */
export function calculateTotalEarnings(orders) {
    if (!orders || orders.length === 0) {
        return {
            totalEarnings: 0,
            totalBaseEarnings: 0,
            totalItemBonuses: 0,
            totalDistanceBonuses: 0,
            totalOrders: 0,
            totalItems: 0,
            averagePerDelivery: 0,
        };
    }

    let totalBaseEarnings = 0;
    let totalItemBonuses = 0;
    let totalDistanceBonuses = 0;
    let totalItems = 0;

    orders.forEach(order => {
        const earnings = calculateOrderEarnings(order);
        totalBaseEarnings += earnings.baseEarning;
        totalItemBonuses += earnings.itemBonus;
        totalDistanceBonuses += earnings.distanceBonus;
        totalItems += earnings.itemCount;
    });

    const totalEarnings = totalBaseEarnings + totalItemBonuses + totalDistanceBonuses;
    const averagePerDelivery = orders.length > 0 ? totalEarnings / orders.length : 0;

    return {
        totalEarnings,
        totalBaseEarnings,
        totalItemBonuses,
        totalDistanceBonuses,
        totalOrders: orders.length,
        totalItems,
        averagePerDelivery: Math.round(averagePerDelivery * 100) / 100, // Round to 2 decimals
    };
}

/**
 * Get earnings configuration
 * @returns {Object} Current earnings configuration
 */
export function getEarningsConfig() {
    return { ...EARNINGS_CONFIG };
}
