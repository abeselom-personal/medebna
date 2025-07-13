import * as express from "express";
const hotelProfileRouter = express.Router();
import * as hotelOwnerProfileController from "../../controller/hotel/hotelProfile.js";
import { verifyRoles } from "../../middleware/verifyRoles.js";
import verifyJWT from "../../middleware/verifyJWT.js";

hotelProfileRouter.post('/add-hotel-owner-profile', verifyJWT, verifyRoles("hotel"), hotelOwnerProfileController.addHotelOwnerProfile);


hotelProfileRouter.put('/update-hotel-owner-profile/:id', verifyJWT, verifyRoles("hotel"), hotelOwnerProfileController.updateHotelOwnerProfile);


// hotelProfileRouter.delete('/delete-hotel-owner-profile/:id',verifyRoles("hotel"), hotelOwnerProfileController.deleteHotelOwnerProfile);

// hotelProfileRouter.get('/all-events',verifyRoles("hotel"), hotelOwnerProfileController.getAlleventsOwners);

hotelProfileRouter.get('/hotel-owner-detail/:id', hotelOwnerProfileController.getHotelOwnerDetailsById);




export default hotelProfileRouter
