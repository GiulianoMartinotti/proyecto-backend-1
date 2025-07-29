import Product from "../models/product.js";
import Cart from "../models/cart.js";

// Función para renderizar la vista principal con productos paginados
const renderHome = async (req, res) => {
    try {
        const products = await Product.find().lean();

        // Buscar un carrito existente o crear uno si no hay ninguno
        let cart = await Cart.findOne();
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }
        console.log("Cart usado en la vista:", cart);
        res.render("home", {
            products,
            cartId: cart._id.toString()
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

        res.render("cart", {
            cartId: cartId,
            products: cart.products.map(item => ({
                title: item.product.title,
                description: item.product.description,
                price: item.product.price,
                quantity: item.quantity,
                category: item.product.category
            }))
        });
    } catch (err) {
        res.status(500).send("Error al cargar el carrito");
    }
};

export { renderHome, getCartView };