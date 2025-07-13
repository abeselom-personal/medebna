import * as express from "express";
const hotelRouter = express.Router();
import * as hotelController from "../controller/hotel/hotelController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import verifyJWT from "../middleware/verifyJWT.js";

hotelRouter.post('/add-hotel', verifyJWT, verifyRoles("hotel"), hotelController.addHotel);


hotelRouter.put('/update-hotel/:id', verifyJWT, verifyRoles("hotel"), hotelController.updateHotel);


hotelRouter.delete('/delete-hotel/:id', verifyJWT, verifyRoles("hotel"), hotelController.deleteHotel);

hotelRouter.get('/all-hotels', hotelController.getAllHotels);

hotelRouter.get('/hotel/:id', hotelController.getHotelDetailsById);

export default hotelRouter;
