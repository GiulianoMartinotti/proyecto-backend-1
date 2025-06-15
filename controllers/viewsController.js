import Product from "../models/product.js";
import Cart from "../models/cart.js";

// Función para renderizar la vista principal con productos paginados
const renderHome = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort, query } = req.query;

        // Filtro por categoría si se pasa el parámetro query
        const filter = query ? { category: query } : {};

        // Configuración de paginación y ordenamiento
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
            lean: true,
        };


        const result = await Product.paginate(filter, options);

        console.log("Productos obtenidos:", result.docs);
        res.render("home", {
            products: result.docs,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
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
            cartId: cid,
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