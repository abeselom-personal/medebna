import DiscountRule from '../model/discount/discountRule.model.js'
import Room from '../model/room/room.model.js'

export const addDiscountToRoom = async (roomId, discountId, activeFrom, activeTo) => {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    const discount = await DiscountRule.findById(discountId);
    if (!discount) throw new Error('Discount rule not found');

    // Check if discount is already applied
    const existingDiscount = room.currentDiscounts.find(d =>
        d.discountId.equals(discountId) && d.isActive
    );

    if (existingDiscount) {
        throw new Error('This discount is already active for this room');
    }

    room.discountRules.push(discountId);
    room.currentDiscounts.push({
        discountId,
        activeFrom: activeFrom || new Date(),
        activeTo: activeTo || discount.validTo,
        isActive: true
    });

    return room.save();
};

export const removeDiscountFromRoom = async (roomId, discountId) => {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    // Remove from discountRules array
    room.discountRules = room.discountRules.filter(id => !id.equals(discountId));

    // Mark as inactive in currentDiscounts
    room.currentDiscounts = room.currentDiscounts.map(d => {
        if (d.discountId.equals(discountId)) {
            return { ...d.toObject(), isActive: false };
        }
        return d;
    });

    return room.save();
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

    // Filter active discounts within their validity period
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

export const getDiscounts = async () => {
    return await DiscountRule.find({ enabled: true });
};




export const createDiscountRule = async (data) => {
    const {
        target,
        targetType,
        title,
        conditions,
        discountPercent,
        maxDiscount,
        validFrom,
        validTo,
        enabled
    } = data

    const discount = new DiscountRule({
        target,
        targetType,
        title,
        conditions,
        discountPercent,
        maxDiscount,
        validFrom,
        validTo,
        enabled: enabled ?? true
    })

    return await discount.save()
}
export const createDiscountRulesForTarget = async (targetId, targetType, discounts) => {
    if (!Array.isArray(discounts) || discounts.length === 0) return []

    const discountDocs = await DiscountRule.insertMany(
        discounts.map(d => ({
            ...d,
            target: targetId,
            targetType
        }))
    )
    return discountDocs
}
