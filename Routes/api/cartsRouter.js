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
import { authJwt, authorizeRoles } from "../../middlewares/auth.js";

const router = Router();

//Ver el carrito para user o admin
router.get("/:cid",authJwt ,authorizeRoles ("user", "admin"),getCartById);

//Para agregar un producto se solicita estar logeado
router.post("/:cid/product/:pid", authJwt, authorizeRoles("user"), addProductToCart);



router.delete("/:cid/products/:pid", authJwt, authorizeRoles("user", "admin"), deleteProductFromCart);
router.put("/:cid", updateCartProducts);
router.put("/:cid/products/:pid", updateProductQuantity);
router.delete("/:cid", authJwt, authorizeRoles("user", "admin"), clearCart);
router.post("/", authJwt, authorizeRoles("admin"),createCart);


export default router;