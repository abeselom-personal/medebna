import DiscountRule from '../model/discount/discountRule.model.js';
import Room from '../model/room/room.model.js';

// Existing discount functions remain the same
export const createDiscountRule = async (data) => {
    const discount = new DiscountRule({
        ...data,
        enabled: data.enabled ?? true
    });
    return await discount.save();
};

export const createDiscountRulesForTarget = async (targetId, targetType, discounts) => {
    if (!Array.isArray(discounts) || discounts.length === 0) return [];
    const discountDocs = await DiscountRule.insertMany(
        discounts.map(d => ({
            ...d,
            target: targetId,
            targetType
        }))
    );
    return discountDocs;
};

export const getRoomDiscounts = async (roomId) => {
    const room = await Room.findById(roomId)
        .populate({
            path: 'discountRules',
            match: { enabled: true }
        })
        .populate({
            path: 'currentDiscounts.discountId',
            match: { enabled: true }
        });

    if (!room) throw new Error('Room not found');

    const now = new Date();
    const activeDiscounts = room.currentDiscounts.filter(d =>
        d.isActive &&
        (!d.activeFrom || d.activeFrom <= now) &&
        (!d.activeTo || d.activeTo >= now)
    );

    return {
        allDiscountRules: room.discountRules,
        activeDiscounts: activeDiscounts.map(d => d.discountId)
    };
};

// Enhanced with pricing calculation capabilities
export const calculatePricingEstimate = async ({
    itemId,
    kind = 'Room',
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
    currency = 'ETB'
}) => {
    // Validate required fields
    if (!itemId || !checkIn || !checkOut) {
        throw new Error('Missing required fields: itemId, checkIn, checkOut');
    }

    // Get room details (assuming kind is 'Room' for this example)
    const room = await Room.findById(itemId);
    if (!room) {
        throw new Error('Room not found');
    }

    // Validate currency availability
    const priceObj = room.price.find(p => p.currency === currency);
    if (!priceObj) {
        throw new Error(`Price not available in ${currency}`);
    }

    // Calculate stay duration
    const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );

    // Calculate base price
    const basePricePerNight = priceObj.amount;
    const basePrice = basePricePerNight * nights;

    // Calculate required rooms based on capacity
    const roomCapacity = room.numberOfAdults + room.numberOfChildren;
    const totalGuests = adults + (children * 0.5);
    const roomsNeeded = Math.ceil(totalGuests / roomCapacity);
    const totalBasePrice = basePrice * roomsNeeded;

    const applicableDiscounts = await calculateApplicableDiscounts(
        itemId,
        kind,
        {
            daysBooked: nights,
            adults,
            children,
            totalGuests: adults + children
            // Add any other relevant context fields
        }
    );

    // Calculate cumulative discount effect
    const discountResult = applyMultipleDiscounts(totalBasePrice, applicableDiscounts);

    return {
        itemId,
        roomName: room.name,
        checkIn,
        checkOut,
        nights,
        adults,
        children,
        roomsNeeded,
        currency,
        pricing: {
            basePricePerNight,
            basePrice,
            totalBasePrice,
            ...discountResult, // Includes finalPrice, appliedDiscounts, etc.
            availableDiscounts: applicableDiscounts.length
        },
        capacity: {
            maxAdults: room.numberOfAdults,
            maxChildren: room.numberOfChildren,
            totalCapacity: roomCapacity
        },
        availableCurrencies: room.price.map(p => ({
            currency: p.currency,
            amount: p.amount
        }))
    };
};

// Existing discount calculation function (enhanced)
export const calculateApplicableDiscounts = async (itemId, kind, context) => {
    const now = new Date();
    const discounts = await DiscountRule.find({
        target: itemId,
        targetType: kind,
        enabled: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
    }).sort({ discountPercent: -1 }); // Sort by highest discount first

    if (!discounts.length) return [];

    const applicableDiscounts = [];

    for (const discount of discounts) {
        const valid = discount.conditions.every(condition => {
            const value = context[condition.key];
            if (value === undefined) return false;

            switch (condition.operator) {
                case '>=': return value >= condition.value;
                case '<=': return value <= condition.value;
                case '==': return value === condition.value;
                case '>': return value > condition.value;
                case '<': return value < condition.value;
                default: return false;
            }
        });

        if (valid) {
            applicableDiscounts.push({
                discount: discount.discountPercent,
                discountId: discount._id,
                discountName: discount.title,
                conditions: discount.conditions
            });
        }
    }

    return applicableDiscounts;
};

// New function to calculate cumulative discount effect
const applyMultipleDiscounts = (basePrice, discounts) => {
    let currentPrice = basePrice;
    const appliedDiscounts = [];
    let totalDiscountPercent = 0;

    // Apply each discount sequentially
    for (const discount of discounts) {
        const discountAmount = (currentPrice * discount.discount) / 100;
        appliedDiscounts.push({
            ...discount,
            appliedAmount: discountAmount
        });
        currentPrice -= discountAmount;
        totalDiscountPercent += discount.discount;
    }

    return {
        finalPrice: currentPrice,
        totalDiscountPercent,
        appliedDiscounts,
        totalDiscountAmount: basePrice - currentPrice
    };
};
