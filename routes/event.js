import * as express from "express";
const eventRouter = express.Router();
import * as eventController from "../controller/event/eventController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import verifyJWT from "../middleware/verifyJWT.js";

eventRouter.post('/add-event', verifyJWT, verifyRoles("event"), eventController.addEvent);


eventRouter.put('/update-event/:id', verifyJWT, verifyRoles("event"), eventController.updateEvent);


eventRouter.delete('/delete-event/:id', verifyJWT, verifyRoles("event"), eventController.deleteEvent);

eventRouter.get('/all-events', eventController.getAllEvents);

eventRouter.get('/event/:id', eventController.getEventDetailsById);

export default eventRouter;
