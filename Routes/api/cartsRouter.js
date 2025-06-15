import { Router } from "express";
import {
    createCart,
    addProductToCart,
    getCartById,
    deleteProductFromCart,
    updateCartProducts,
    updateProductQuantity,
    clearCart
} from "../../controllers/cartsController.js";

const router = Router();

router.get("/:cid", getCartById);
router.delete("/:cid/products/:pid", deleteProductFromCart);
router.put("/:cid", updateCartProducts);
router.put("/:cid/products/:pid", updateProductQuantity);
router.delete("/:cid", clearCart);
router.post("/", createCart);
router.post("/:cid/product/:pid", addProductToCart);

export default router;