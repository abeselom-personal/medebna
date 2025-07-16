import * as express from "express";
const operatorRouter = express.Router();
import * as systemController from "../controller/system/systemController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import verifyJWT from "../middleware/verifyJWT.js";


operatorRouter.post('/add-operator', verifyJWT, verifyRoles("admin"), systemController.addOperator);

operatorRouter.put('/update-operator/:id', verifyJWT, verifyRoles("admin"), systemController.updateOperator);

operatorRouter.delete('/delete-operator/:id', verifyJWT, verifyRoles("admin"), systemController.deleteOperator);

operatorRouter.get('/get-operator/:id', systemController.getOperator)

operatorRouter.get('/get-all-operators', systemController.getAllOperators)

export default operatorRouter;
