import Cart from "../models/cart.js";
import Product from "../models/product.js";



export const createCart = async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear carrito", error });
    }
};

export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        const product = await Product.findById(pid);
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        const existingProduct = cart.products.find(p => p.product.toString() === pid);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json({ status: "success", payload: cart });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al agregar producto al carrito", error });
    }
};

export const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error });
    }
};

// DELETE /api/carts/:cid/products/:pid
export const deleteProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();
        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ status: 'error', error });
    }
};

// PUT /api/carts/:cid
export const updateCartProducts = async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        cart.products = products;
        await cart.save();
        res.json({ status: 'success', message: 'Carrito actualizado', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error });
    }
};

// PUT /api/carts/:cid/products/:pid
export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        const product = cart.products.find(p => p.product.toString() === pid);
        if (product) {
            product.quantity = quantity;
            await cart.save();
            res.json({ status: 'success', message: 'Cantidad actualizada' });
        } else {
            res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', error });
    }
};

// DELETE /api/carts/:cid
export const clearCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        cart.products = [];
        await cart.save();
        res.json({ status: 'success', message: 'Carrito vaciado' });
    } catch (error) {
        res.status(500).json({ status: 'error', error });
    }
};