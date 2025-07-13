import * as express from "express";
const account = express.Router();
import * as accountController from "../controller/account/accountController.js";
import verify from "../middleware/verify.js";
import verifyJWT from "../middleware/verifyJWT.js";


account.post('/add-account', verifyJWT, verify("car", "event", "hotel"), accountController.addAccount);
account.get('/fetchBankLists', verifyJWT, verify("car", "event", "hotel"), accountController.fetchBankList);
account.get('/fetchAccount/:id', verifyJWT, verify("car", "event", "hotel"), accountController.getAccountDetailsById);


export default account
