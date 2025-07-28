// services/discount.service.js
import DiscountRule from '../model/discount/discountRule.model.js';
import Room from '../model/room/room.model.js';

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

// Fixed getRoomDiscounts function
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

// Fixed discount calculation function
export const calculateApplicableDiscount = async (itemId, kind, context) => {
    const now = new Date();
    const discounts = await DiscountRule.find({
        target: itemId,
        targetType: kind,
        enabled: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
    });

    if (!discounts.length) return { discount: 0, discountId: null, discountName: null };

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
            return {
                discount: discount.discountPercent,
                discountId: discount._id,
                discountName: discount.title
            };
        }
    }

    return { discount: 0, discountId: null, discountName: null };
};
