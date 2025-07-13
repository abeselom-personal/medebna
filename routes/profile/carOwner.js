import * as express from "express";
const carProfileRouter = express.Router();
import * as carOwnerProfileController from "../../controller/car/carProfile.js";
import { verifyRoles } from "../../middleware/verifyRoles.js";
import verifyJWT from "../../middleware/verifyJWT.js";
carProfileRouter.post('/add-car-owner-profile', verifyJWT, verifyRoles("car"), carOwnerProfileController.addCarOwnerProfile);


carProfileRouter.put('/update-car-owner-profile/:id', verifyJWT, verifyRoles("car"), carOwnerProfileController.updateCarOwnerData);


// carProfileRouter.delete('/delete-car-owner-profile/:id',verifyRoles("car"), carOwnerProfileController.deleteCarOwner);

// carProfileRouter.get('/all-cars',verifyRoles("car"), carOwnerProfileController.getAllCarsOwners);

carProfileRouter.get('/car-owner-detail/:id', carOwnerProfileController.getCarOwnerProfileDetailsById);


export default carProfileRouter;
