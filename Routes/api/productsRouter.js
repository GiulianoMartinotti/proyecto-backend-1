import { Router } from "express";
import { getProducts } from "../../controllers/productsController.js";
import { getProductById } from "../../controllers/productsController.js";
import { createProduct } from "../../controllers/productsController.js";
import { updateProduct } from "../../controllers/productsController.js";
import { deleteProduct } from "../../controllers/productsController.js";
import { getProductsView } from "../../controllers/productsController.js";
import { requireAuth, authorize } from "../../middlewares/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProductById);
router.get('/', getProductsView);

// Solo admin:
router.post("/", requireAuth, authorize("admin"), createProduct);
router.put("/:pid", requireAuth, authorize("admin"), updateProduct);
router.delete("/:pid", requireAuth, authorize("admin"), deleteProduct);


export default router;