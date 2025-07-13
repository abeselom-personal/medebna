import * as express from "express";
const eventProfileRouter = express.Router();
import * as eventOwnerProfileController from "../../controller/event/eventProfile.js";
import { verifyRoles } from "../../middleware/verifyRoles.js";
import verifyJWT from "../../middleware/verifyJWT.js";

eventProfileRouter.post('/add-event-owner-profile', verifyJWT, verifyRoles("event"), eventOwnerProfileController.addEventProfile);


eventProfileRouter.put('/update-event-owner-profile/:id', verifyJWT, verifyRoles("event"), eventOwnerProfileController.updateEventProfile);


// eventProfileRouter.delete('/delete-event-owner-profile/:id',verifyRoles("event"), eventOwnerProfileController.deleteEventProfile);

// eventProfileRouter.get('/all-events',verifyRoles("event"), eventOwnerProfileController.getAlleventsOwners);

eventProfileRouter.get('/event-owner-detail/:id', eventOwnerProfileController.getEventOwnerDetailsById);




export default eventProfileRouter
