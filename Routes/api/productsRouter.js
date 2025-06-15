import { Router } from "express";
import { getProducts } from "../../controllers/productsController.js";
import { getProductById } from "../../controllers/productsController.js";
import { createProduct } from "../../controllers/productsController.js";
import { updateProduct } from "../../controllers/productsController.js";
import { deleteProduct } from "../../controllers/productsController.js";
import { getProductsView } from "../../controllers/productsController.js";

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProductById);
router.post("/", createProduct);
router.put("/:pid", updateProduct);
router.delete("/:pid", deleteProduct);
router.get('/', getProductsView);


export default router;