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

router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword');
});

router.get('/reset-password', (req, res) => {

    res.render('resetPassword');
});

export default router;