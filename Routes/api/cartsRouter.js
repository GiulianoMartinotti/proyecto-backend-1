import { Router } from "express";
import {
    createCart,
    addProductToCart,
    getCartById,
    deleteProductFromCart,
    updateCartProducts,
    updateProductQuantity,
    clearCart,
    purchaseCart
} from "../../controllers/cartsController.js";
import { authJwt, authorizeRoles } from "../../middlewares/auth.js";

const router = Router();

//Ver el carrito para user o admin
router.get("/:cid",authJwt ,authorizeRoles ("user", "admin"),getCartById);

//Para agregar un producto se solicita estar logeado - Solo el user modifica el carrito
router.post("/:cid/products/:pid", authJwt, authorizeRoles("user"), addProductToCart);
router.delete("/:cid/products/:pid", authJwt, authorizeRoles("user"), deleteProductFromCart);
router.put("/:cid", authJwt, authorizeRoles("user"), updateCartProducts);
router.put("/:cid/products/:pid", authJwt, authorizeRoles("user"), updateProductQuantity);
router.delete("/:cid", authJwt, authorizeRoles("user"), clearCart);
router.post("/", authJwt, authorizeRoles("admin"),createCart);

//Compra
router.post("/:cid/purchase", authJwt, authorizeRoles("user"), purchaseCart);


export default router;