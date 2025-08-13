import { Router } from "express";
import { getCartView, renderHome, renderTicket, renderMyTickets } from "../controllers/viewsController.js";
import { requireLoginView } from "../middlewares/auth.js";


const router = Router();


router.get("/", renderHome);

router.get("/carts", getCartView);

router.get("/carts/:cid", getCartView);

router.get("/tickets", requireLoginView, renderMyTickets);

router.get("/tickets/:code", renderTicket);

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