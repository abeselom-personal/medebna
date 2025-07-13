import * as express from "express";
const carRouter = express.Router();
import * as carController from "../controller/car/carController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import verifyJWT from "../middleware/verifyJWT.js";

carRouter.post('/add-car', verifyJWT, verifyRoles("car"), carController.addCar);


carRouter.put('/update-car/:id', verifyJWT, verifyRoles("car"), carController.updateCarData);


carRouter.delete('/delete-car/:id', verifyJWT, verifyRoles("car"), carController.deleteCar);

carRouter.get('/all-cars', carController.getAllCars);

carRouter.get('/car/:id', carController.getCarDetailsById);




export default carRouter;
