import { Router } from "express";
import { getCartView, renderHome } from "../controllers/viewsController.js";


const router = Router();


router.get("/", renderHome);
router.get("/carts/:cid", getCartView);
export default router;