import Product from "../models/product.js";
import Cart from "../models/cart.js";
import jwt from "jsonwebtoken";

// Función para renderizar la vista principal con productos paginados
const renderHome = async (req, res) => {
    try {
        const products = await Product.find().lean();

        // Buscar un carrito existente o crear uno si no hay ninguno
        let cart = await Cart.findOne();
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }


        let user = null;
        const token = req.cookies?.token;
        if (token) {
            try {
                user = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                console.error("Token inválido");
            }
        }

        res.render("home", {
            products,
            cartId: cart._id.toString(),
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al cargar productos.");
    }
};


// Renderizar un carrito específico por ID
const getCartView = async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await Cart.findById(cartId).populate("products.product").lean();
        if (!cart) return res.status(404).send("Carrito no encontrado");

        const products = cart.products.map(item => ({
            _id: item.product._id,
            title: item.product.title,
            description: item.product.description,
            price: item.product.price,
            quantity: item.quantity,
            category: item.product.category
        }));

        const total = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
        const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);

        const formattedTotal = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2
        }).format(total);

        let user = null;
        const token = req.cookies?.token;
        if (token) {
            try {
                user = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                console.error("Token inválido");
            }
        }

        res.render("cart", {
            cartId,
            products,
            total: formattedTotal,
            totalQuantity,
            user
        });
    } catch (err) {
        res.status(500).send("Error al cargar el carrito");
    }
};

export { renderHome, getCartView };