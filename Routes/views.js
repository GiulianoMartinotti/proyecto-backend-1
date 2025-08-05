import { Router } from "express";
import { getCartView, renderHome } from "../controllers/viewsController.js";


const router = Router();


router.get("/", renderHome);
router.get("/carts/:cid", getCartView);
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/register', (req, res) => {
    res.render('register');
});

export default router;