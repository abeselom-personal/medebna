import * as Payment from "../../model/payment/paymentModel.js";
import * as crypto from "crypto";
import * as User from "../../model/user/user.model.js";
import * as request from "request";
import * as Cart from "../../model/cart/cartModel.js";
import * as Car from "../../model/car/carModel.js";
import * as Hotel from "../../model/hotel/hotelModel.js";
import * as Account from "../../model/account/accountModel.js";
import * as Event from "../../model/event/eventModel.js";

export async function createUserAndInitializePayment(req, res) {
    const { firstName, lastName, email, phone, productType, paymentMethod, sessionId, productId, ownerId } = req.body;


    if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            productType,
            paymentMethod: paymentMethod || 'chapa',
            sessionId,
            productId,
            ownerId,
        });

        await newUser.save();

        const sessionDetails = await Cart.findOne({ sessionId });
        if (!sessionDetails) {
            return res.status(400).json({ message: 'Session not found' });
        }


        const matchingItemsCount = sessionDetails.items.filter(item => item.productId.toString() === productId).length;


        let prices = 0;
        if (sessionDetails.items[0].productType === 'car') {

            const carIds = sessionDetails.items.filter(item => item.productId.toString() === productId).map(item => item.carTypeId);

            const carSpecificityIds = sessionDetails.items.filter(item => item.productId.toString() === productId).map(item => item.carSpecificityId);


            carSpecificityIds.forEach(async (carColorId) => {

                await User.findByIdAndUpdate(
                    newUser._id,
                    { $addToSet: { carIds: carColorId } },
                    { new: true, upsert: true }
                );
            })

            const cars = await Promise.all(
                carIds.map(async (carId) => {
                    const car = await Car.findOne({ _id: productId })
                    const carTyps = car.cars.find(c => c._id.toString());

                    const carTypes = car.cars.find((c) => c._id.toString() === carId.toString());

                    if (!carTypes) {
                        prices = 0;
                    } else {

                        prices += carTypes.price
                    }
                    return prices;
                }
                )
            )


            // const car = await Car.findOne({_id:productId})
            // const carTypes = car.cars.find(c => c._id.toString() === sessionDetails.items[0].carId);


        } else if (sessionDetails.items[0].productType === 'hotel') {
            const roomIds = sessionDetails.items.filter(item => item.productId.toString() === productId).map(item => item.roomId);
            const hotels = await Promise.all(
                roomIds?.map(async (roomId) => {
                    const hotel = await Hotel.findOne({ _id: productId })
                    const roomTypes = hotel.roomTypes.find(rt => rt.rooms)
                    // const allrooms = hotel.roomTypes.find(rt => rt.rooms.some(r => r._id.toString() === roomId));
                    // const allrooms = roomTypes.rooms.filter(room => room._id.toString() === roomId);


                    // const allrooms = hotel.rooms.filter(room => room._id.toString() === roomId);

                    await
                        User.findByIdAndUpdate(
                            newUser._id,
                            { $addToSet: { roomIds: roomId } },
                            { new: true, upsert: true }
                        );
                    prices += roomTypes.price


                    return prices;
                })
            )


            // const hotelRooms = hotel.rooms.filter(room => room._id.toString() === sessionDetails.items[0].roomId);

            // prices = matchingItemsCount * hotel.roomTypes[0].price

        } else if (sessionDetails.items[0].productType === 'event') {

            const eventTypeIds = sessionDetails.items
                .filter(item => item.productId.toString() === productId)
                .map(item => item.eventTypeId);



            const events = await Promise.all(
                eventTypeIds.map(async (eventTypeId) => {

                    const event = await Event.findOne({ _id: productId });
                    const allevents = event.eventPrices.filter(event => event._id.toString() === eventTypeId);
                    if (!allevents) {
                        prices = 0;
                    } else {
                        await User.findByIdAndUpdate(
                            newUser._id,
                            { $addToSet: { eventTypeIds: eventTypeId } },
                            { new: true, upsert: true }
                        );
                        prices += allevents[0].price
                    }

                    return prices;
                })
            );








        }




        const txRef = `tx-${newUser._id}-${Date.now()}`;


        const subaccounts = await Account.find({ userId: ownerId });
        if (!subaccounts || subaccounts.length === 0) {
            return res.status(400).json({ message: 'Subaccount not found' });
        }
        const subaccountId = subaccounts.chapaSubaccountId;



        const chapaOptions = {
            method: 'POST',
            url: 'https://api.chapa.co/v1/transaction/initialize',
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_PRIVATE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "amount": prices,
                "currency": "ETB",
                "email": newUser.email,
                "first_name": newUser.firstName,
                "last_name": newUser.lastName,
                "phone_number": newUser.phone,
                "tx_ref": txRef,
                "callback_url": process.env.CALLBACK_URL,
                "return_url": `https://www.google.com/${txRef}`,
                "customization[title]": "Payment for my favourite merchant",
                "customization[description]": "I love online payments.",
                "meta[hide_receipt]": "true",
                // "subaccounts[id]": "9cdea5a3-07f3-4019-add8-7deb60b9d8a0",
                "subaccounts[id]": subaccountId
            })
        };

        // Make the request to Chapa
        request(chapaOptions, (error, response, body) => {
            if (error) {
                console.error('Chapa payment initialization error:', error);
                return res.status(500).json({ message: 'Failed to initialize payment', error });
            }

            const paymentData = JSON.parse(body);
            if (paymentData.status !== 'success') {
                return res.status(500).json({ message: 'Chapa payment initialization failed', paymentData });
            }

            // Respond with user and payment link
            res.status(201).json({
                message: 'User created and payment link generated successfully',
                user: newUser,
                paymentLink: paymentData.data.checkout_url // Chapa's payment link
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export async function confirmPayment(req, res) {
    const { referenceId } = req.params;

    if (!referenceId) {
        return res.status(400).json({ message: 'Reference ID is required' });
    }

    try {
        const paymentData = await Payment.findOne({ tx_ref: referenceId });

        // // Update payment status in the database
        // const payment = await Payment.findOneAndUpdate(
        //   { tx_ref: paymentData.tx_ref },
        //   { status: paymentData.status },
        //   { new: true }
        // );

        res.status(200).json({ message: 'Payment verified', paymentData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Replace with your actual Chapa secret key for validating the webhook

export async function handlePaymentCallback(req, res) {
    try {
        const chapaSignature = req.headers['Chapa-Signature'];





        const secret = process.env.SECRET_HASH





        const hash = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');




        if (hash !== req.headers['x-chapa-signature']) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const { trx_ref, status } = req.body;

        // const { payment_method,tx_ref, type, reference, charge, amount, currency, mobile, first_name, last_name, email } = req.body.data;






        let payment = await Payment.findOne({ tx_ref: req.body.tx_ref });

        if (payment) {

            payment.status = req.body.status;
            await payment.save();
        } else {

            payment = new Payment({
                tx_ref: req.body.tx_ref,
                paymentMethod: req.body.payment_method,
                types: req.body.type,
                reference: req.body.reference,
                status: req.body.status,
                charged_amount: req.body.charge,
                amount: req.body.amount,
                currency: req.body.currency,
                mobile: req.body.mobile,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,

            });



            // Save the new payment to the database
            await payment.save();
        }


        // Respond to the webhook request
        res.status(200).json({ message: 'Callback received and payment processed' });
    } catch (error) {
        console.error('Error processing payment callback:', error);
        res.status(500).json({ message: 'Error processing payment callback' });
    }
};


// // Callback handler for Chapa payment notifications
// exports.handlePaymentCallback = async (req, res) => {
//   const { trx_ref, status } = req.body;

//   // Log the received callback data for debugging purposes

//   try {
//     // Check if the transaction reference already exists in the database
//     const existingPayment = await Payment.findOne({ tx_ref: trx_ref });

//     if (existingPayment) {
//       // If the payment already exists, update the status
//       existingPayment.status = status;
//       await existingPayment.save();
//     } else {
//       // If the payment doesn't exist, create a new record
//       const payment = new Payment({
//         tx_ref: trx_ref,
//         status: status,
//       });

//       // Save the new payment to the database
//       await payment.save();
//     }

//     // Respond to the callback request
//     res.status(200).json({ message: 'Callback received and payment processed' });
//   } catch (error) {
//     console.error('Error processing payment callback:', error);
//     res.status(500).json({ message: 'Error processing payment callback' });
//   }
// };

