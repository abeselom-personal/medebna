import * as express from "express";
const cartRouter = express.Router();
import * as cartController from "../../controller/cart/addingToCart.js";

cartRouter.post('/add-cart', cartController.addingToCart);
cartRouter.delete('/delete-cart/:sessionId/:productId', cartController.deleteCartItemBySessionIdAndProductId)
cartRouter.get('/get-all-items/:sessionId', cartController.getCartedItemsBySessionId)

export default cartRouter;
