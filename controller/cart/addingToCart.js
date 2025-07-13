import * as mongoose from "mongoose";
import * as Hotel from "../../model/hotel/hotelModel.js";
import * as Car from "../../model/car/carModel.js";
import * as Event from "../../model/event/eventModel.js";
import * as Cart from "../../model/cart/cartModel.js";
import * as HotelProfile from "../../model/hotel/hotelOwnerProfile.js";
import * as System from "../../model/system/systemModel.js";

export const addingToCart = async (req, res) => {
    const { id, productType, roomId, sessionId, eventTypeId, carTypeId, carColorId, numberOfTickets } = req.body;
    const WAIT_TIME_IN_MINUTES = 15;

    if (!productType || !sessionId) {
        return res.status(400).json({ message: 'productType and sessionId are required' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let item;
        let room;
        let expiresAt;

        let cart = await Cart.findOne({ sessionId }).session(session);

        if (!cart) {
            expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + WAIT_TIME_IN_MINUTES);
            cart = new Cart({ sessionId, items: [] });
        } else {
            expiresAt = cart.items.length > 0 ? cart.items[0].expiresAt : new Date();
            if (cart.items.length === 0) {
                expiresAt.setMinutes(expiresAt.getMinutes() + WAIT_TIME_IN_MINUTES);
            }
        }

        switch (productType) {
            case 'hotel':
                item = await Hotel.findById(id).session(session);
                if (!item) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Hotel or room not found' });
                }

                const roomType = item.roomTypes.find(rt => rt.rooms.some(r => r._id.toString() === roomId));
                if (!roomType) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Room type not found' });
                }

                room = roomType.rooms.find(r => r._id.toString() === roomId);
                if (room.status !== 'available') {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'Room is not available' });
                }

                room.status = 'reserved';
                await item.save({ session });
                break;

            case 'car':
                item = await Car.findById(id).session(session);
                if (!item) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Car not found' });
                }

                const carType = item.cars.find(ct => ct._id.toString() === carTypeId);
                if (!carType) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Car type not found' });
                }

                const carColor = carType.carSpecificity.find(cc => cc._id.toString() === carColorId);
                if (!carColor) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Car Color not found' });
                }

                if (carColor.status !== 'available') {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'Car Color is not available' });
                }

                carColor.numberOfCars -= 1;
                if (carColor.numberOfCars <= 0) {
                    carColor.status = 'reserved';
                }

                await item.save({ session });
                break;

            case 'event':
                item = await Event.findById(id).session(session);
                if (!item) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Event not found' });
                }

                const eventType = item.eventPrices.find(et => et._id.toString() === eventTypeId);
                if (!eventType) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Event type not found' });
                }

                if (eventType.status !== 'available') {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'Event type is not available' });
                }

                if (eventType.ticketAvailable < numberOfTickets) {
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'Insufficient tickets available for this event type' });
                } else {
                    eventType.ticketAvailable -= numberOfTickets;
                    if (eventType.ticketAvailable <= 0) {
                        eventType.status = 'reserved';
                    }
                }

                await item.save({ session });
                break;

            default:
                await session.abortTransaction();
                return res.status(400).json({ message: 'Invalid productType' });
        }

        cart.items.push({
            productId: id,
            productType,
            status: 'reserved',
            roomId: productType === 'hotel' ? roomId : null,
            eventTypeId: productType === 'event' ? eventTypeId : null,
            numberOfTickets: productType === 'event' ? numberOfTickets : null,
            carTypeId: productType === 'car' ? carTypeId : null,
            carSpecificityId: productType === 'car' ? carColorId : null,
            expiresAt,
        });

        await cart.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: `${productType} reserved and added to cart successfully`, cart });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error during transaction:', error);
        res.status(500).json({ message: 'Server error', error });
    } finally {
        session.endSession();
    }
};

export const deleteCartItemBySessionIdAndProductId = async (req, res) => {
    const { sessionId, productId } = req.params;
    const { roomId, carTypeId, carSpecificityId, eventTypeId } = req.body;

    try {
        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for the given session ID' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const itemIndex = cart.items.findIndex(
                item =>
                    item.productId.toString() === productId &&
                    (item.roomId?.toString() === roomId ||
                        item.carTypeId?.toString() === carTypeId ||
                        item.carSpecificityId?.toString() === carSpecificityId ||
                        item.eventTypeId?.toString() === eventTypeId)
            );

            if (itemIndex === -1) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            const item = cart.items[itemIndex];
            cart.items.splice(itemIndex, 1);

            switch (item.productType) {
                case 'hotel': {
                    const hotel = await Hotel.findById(item.productId).session(session);
                    if (hotel) {
                        const roomType = hotel.roomTypes.find(rt => rt.rooms.some(r => r._id.toString() === item.roomId.toString()));
                        const room = roomType ? roomType.rooms.find(r => r._id.toString() === item.roomId.toString()) : null;
                        if (room) {
                            room.status = 'available';
                            await hotel.save({ session });
                        }
                    }
                    break;
                }

                case 'car': {
                    const car = await Car.findById(item.productId).session(session);
                    if (car) {
                        const carType = car.cars.find(ct => ct._id.toString() === item.carTypeId.toString());
                        if (carType) {
                            const carSpecificity = carType.carSpecificity.find(cc => cc._id.toString() === item.carSpecificityId.toString());
                            if (carSpecificity) {
                                carSpecificity.numberOfCars += 1;
                                if (carSpecificity.status === 'reserved' && carSpecificity.numberOfCars > 0) {
                                    carSpecificity.status = 'available';
                                }
                                await car.save({ session });
                            }
                        }
                    }
                    break;
                }

                case 'event': {
                    const event = await Event.findById(item.productId).session(session);
                    if (event) {
                        const eventType = event.eventPrices.find(et => et._id.toString() === item.eventTypeId.toString());
                        if (eventType) {
                            eventType.ticketAvailable += item.numberOfTickets || 0;
                            if (eventType.status === 'reserved' && eventType.ticketAvailable > 0) {
                                eventType.status = 'available';
                            }
                            await event.save({ session });
                        }
                    }
                    break;
                }

                default:
                    await session.abortTransaction();
                    return res.status(400).json({ message: 'Invalid productType' });
            }

            await cart.save({ session });
            await session.commitTransaction();

            res.status(200).json({ message: 'Item removed from cart and product made available successfully', cart });
        } catch (error) {
            await session.abortTransaction();
            console.error('Error during transaction:', error);
            res.status(500).json({ message: 'Server error', error });
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error finding cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getCartedItemsBySessionId = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for the given session ID' });
        }

        const detailedItems = await Promise.all(cart.items.map(async (item) => {
            let productDetails = null;

            switch (item.productType) {
                case 'hotel': {
                    productDetails = await Hotel.findById(item.productId);
                    if (productDetails) {
                        const hotelOwner = await HotelProfile.findOne({ createdBy: productDetails.createdBy });
                        const hotelOwnerDetail = hotelOwner ? await System.findOne({ _id: hotelOwner.createdBy }) : null;
                        const roomType = productDetails.roomTypes.find(rt => rt.rooms.some(r => r._id.equals(item.roomId)));
                        const room = roomType ? roomType.rooms.find(r => r._id.equals(item.roomId)) : null;
                        return { ...item.toObject(), productDetails, roomDetails: room, hotelOwner: hotelOwnerDetail?.name || null };
                    }
                    break;
                }
                case 'car': {
                    productDetails = await Car.findById(item.productId);
                    return { ...item.toObject(), productDetails };
                }
                case 'event': {
                    productDetails = await Event.findById(item.productId);
                    return { ...item.toObject(), productDetails };
                }
                default:
                    return item;
            }
        }));

        res.status(200).json({ sessionId: cart.sessionId, items: detailedItems });
    } catch (error) {
        console.error('Error fetching carted items:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
