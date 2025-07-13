import * as cron from "node-cron";
import * as mongoose from "mongoose";
import Hotel from "../model/hotel/hotelModel.js";
import Car from "../model/car/carModel.js";
import Event from "../model/event/eventModel.js";
import Cart from "../model/cart/cartModel.js";

let isRunning = false;

cron.schedule('* * * * *', async () => {
    if (isRunning) return;
    isRunning = true;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const now = new Date();
        now.setSeconds(0, 0);

        const expiredCarts = await Cart.find({ 'items.expiresAt': { $lte: now } }).session(session);

        if (expiredCarts.length === 0) {
            await session.commitTransaction();
            return;
        }


        for (const cart of expiredCarts) {
            let cartUpdated = false;

            for (const item of cart.items) {
                if (item.expiresAt <= now) {

                    switch (item.productType) {
                        case 'hotel': {
                            const hotel = await Hotel.findById(item.productId).session(session);
                            if (hotel) {
                                const roomType = hotel.roomTypes.find(rt => rt.rooms.some(r => r._id.equals(item.roomId)));
                                const room = roomType ? roomType.rooms.find(r => r._id.equals(item.roomId)) : null;
                                if (room && room.status === 'reserved') {
                                    room.status = 'available';
                                    await hotel.save({ session });
                                    cartUpdated = true;
                                }
                            } else {
                            }
                            break;
                        }
                        case 'car': {
                            const car = await Car.findById(item.productId).session(session);

                            if (car) {
                                const carType = car.cars.find(ct => ct._id.equals(item.carTypeId));
                                if (carType) {
                                    const carSpecificity = carType.carSpecificity.find(cs => cs._id.equals(item.carSpecificityId));
                                    if (carSpecificity && carSpecificity.status === 'reserved') {
                                        carSpecificity.status = 'available';
                                        await car.save({ session });
                                        cartUpdated = true;
                                    }
                                    if (carSpecificity) {
                                        carSpecificity.numberOfCars += 1;
                                        await car.save({ session });
                                    }
                                } else {
                                }
                                break;
                            }

                        }
                        case 'event': {
                            const event = await Event.findById(item.productId).session(session);
                            if (event) {

                                // const eventPrice = event.eventPrices.find(price => price._id === item.eventTypeId);
                                const eventPrice = event.eventPrices.find(price => price._id.equals(item.eventTypeId));


                                if (eventPrice && eventPrice.status === 'reserved') {
                                    eventPrice.status = 'available';
                                    await event.save({ session });

                                    cartUpdated = true;
                                }

                                if (eventPrice) {
                                    eventPrice.ticketAvailable += item.numberOfTickets;
                                    await event.save({ session });
                                }
                            } else {
                            }
                            break;
                        }
                        default:
                            console.error(`Unknown productType: ${item.productType}`);
                    }
                }
            }

            if (cartUpdated) {
                const originalItemCount = cart.items.length;
                cart.items = cart.items.filter(item => item.expiresAt > now); // Remove expired items
                await cart.save({ session });
            } else {
            }
        }

        await session.commitTransaction();
    } catch (error) {
        console.error('Error during cron job:', error);
        await session.abortTransaction();
    } finally {
        session.endSession();
        isRunning = false;
    }
});

export default cron;
