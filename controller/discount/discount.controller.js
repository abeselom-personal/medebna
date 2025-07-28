import * as discountService from '../../services/discount.service.js';

export const addDiscount = async (req, res) => {
    try {
        const { roomId, discountId } = req.params;
        const { activeFrom, activeTo } = req.body;

        const room = await discountService.addDiscountToRoom(
            roomId,
            discountId,
            activeFrom,
            activeTo
        );

        res.status(200).json({ message: 'Discount added to room', data: room });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createDiscountRule = async (req, res) => {
    try {
        const discount = await discountService.createDiscountRule(req.body);
        res.status(201).json(discount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const removeDiscount = async (req, res) => {

    try {
        const { roomId, discountId } = req.params;
        const room = await discountService.removeDiscountFromRoom(roomId, discountId);
        res.status(200).json({ message: 'Discount removed from room', data: room });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getRoomDiscounts = async (req, res) => {
    try {
        const { roomId } = req.params;
        const discounts = await discountService.getRoomDiscounts(roomId);
        res.status(200).json({ message: 'Room discounts retrieved', data: discounts });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getDiscounts = async (req, res) => {
    try {
        const discounts = await discountService.getDiscounts();
        res.status(200).json({ message: 'Room discounts retrieved', data: discounts });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getDiscountCalculation = async (req, res) => {
    try {
        const discounts = await discountService.getDiscounts();
        res.status(200).json({ message: 'Room discounts retrieved', data: discounts });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

