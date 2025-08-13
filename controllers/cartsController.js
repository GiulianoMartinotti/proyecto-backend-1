import Cart from "../models/cart.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import crypto from "crypto";
import Ticket from "../models/ticket.js";

// allowAdmin: true => admin SÍ puede 
// allowAdmin: false => admin NO puede (mutaciones)
async function ensureOwnCartOrAdmin(req, cid, { allowAdmin = false } = {}) {
    if (!req.user) return { ok: false, code: 401, msg: "No autenticado" };

    const role = req.user.role;
    const uid = req.user._id?.toString?.() ?? req.user.id;
    if (!uid) return { ok: false, code: 401, msg: "No autenticado" };

    if (req.user.role === "admin") return { ok: true };

    // Usuario: solo su propio carrito
    const dbUser = await User.findById(req.user.id);
    if (!dbUser?.cart) return { ok: false, code: 403, msg: "El usuario no tiene carrito asignado" };
    if (dbUser.cart.toString() !== cid) return { ok: false, code: 403, msg: "Este carrito no te pertenece" };

    return { ok: true };
}


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
        const guard = await ensureOwnCartOrAdmin(req, cid, { allowAdmin: false });
        if (!guard.ok) return res.status(guard.code).json({ status: "error", message: guard.msg });

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        const product = await Product.findById(pid);
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        if (product.stock <= 0) return res.status(400).json({ status: "error", message: "Sin stock disponible" });

        const existingProduct = cart.products.find(p => p.product.equals(pid));
        if (existingProduct) {
            existingProduct.quantity = Math.min(existingProduct.quantity + 1, product.stock);
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        // si viene de fetch JSON:
        if (req.headers.accept?.includes("application/json")) {
            return res.json({ status: "success", message: "Producto agregado al carrito" });
        }
        // si viene de link/form clásico:
        return res.redirect(`/carts/${cid}`);
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al agregar producto al carrito", error });
    }
};

export const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;

        const guard = await ensureOwnCartOrAdmin(req, cid);
        if (!guard.ok) return res.status(guard.code).json({ status: "error", message: guard.msg });

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
        const guard = await ensureOwnCartOrAdmin(req, cid, { allowAdmin: false });
        if (!guard.ok) return res.status(guard.code).json({ status: "error", message: guard.msg });

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        const before = cart.products.length;
        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        if (cart.products.length === before) {
            return res.status(404).json({ status: "error", message: "Producto no estaba en el carrito" });
        }

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

        const guard = await ensureOwnCartOrAdmin(req, cid, { allowAdmin: false });
        if (!guard.ok) return res.status(guard.code).json({ status: "error", message: guard.msg });

        if (!Array.isArray(products))
            return res.status(400).json({ status: 'error', message: 'El cuerpo debe contener un array de productos' });

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        cart.products = products.map(p => ({
            product: p.product,
            quantity: Math.max(1, parseInt(p.quantity ?? 1, 10))
        }));

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

        const guard = await ensureOwnCartOrAdmin(req, cid, { allowAdmin: false });
        if (!guard.ok) return res.status(guard.code).json({ status: "error", message: guard.msg });

        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ status: "error", message: "Cantidad inválida" });
        }

        const [cart, product] = await Promise.all([
            Cart.findById(cid),
            Product.findById(pid)
        ]);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        if (qty > product.stock) {
            return res.status(400).json({ status: "error", message: "Cantidad supera el stock disponible" });
        }

        const item = cart.products.find(p => p.product.toString() === pid);
        if (!item) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
        }

        item.quantity = qty;
        await cart.save();

        res.json({ status: "success", message: "Cantidad actualizada" });
    } catch (error) {
        res.status(500).json({ status: "error", error });
    }
};

// DELETE /api/carts/:cid
export const clearCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const guard = await ensureOwnCartOrAdmin(req, cid, { allowAdmin: false });
        if (!guard.ok) return res.status(guard.code).json({ status: "error", message: guard.msg });

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        if (cart.products.length === 0)
            return res.status(200).json({ status: 'success', message: 'El carrito ya está vacío' });

        cart.products = [];
        await cart.save();
        res.json({ status: 'success', message: 'Carrito vaciado' });
    } catch (error) {
        res.status(500).json({ status: 'error', error });
    }
};

// POST /api/carts/:cid/purchase
export const purchaseCart = async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await Cart.findById(cid).populate("products.product");
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        // separar comprables vs faltantes por stock
        const purchasable = [];
        const outOfStock = [];

        for (const item of cart.products) {
            const dbProd = await Product.findById(item.product._id);
            if (!dbProd) {
                outOfStock.push({ product: item.product._id, reason: "Producto inexistente" });
                continue;
            }
            if (dbProd.stock >= item.quantity) {
                purchasable.push({ dbProd, qty: item.quantity });
            } else {
                outOfStock.push({ product: dbProd._id, reason: "Sin stock suficiente", requested: item.quantity, available: dbProd.stock });
            }
        }

        // calcula el monto y descuenta el stock
        let amount = 0;
        const ticketItems = [];
        for (const p of purchasable) {
            p.dbProd.stock -= p.qty;
            await p.dbProd.save();

            amount += p.dbProd.price * p.qty;
            ticketItems.push({
                product: p.dbProd._id,
                title: p.dbProd.title,
                price: p.dbProd.price,
                quantity: p.qty
            });
        }

        // dejar en el carrito solo los que NO se pudieron comprar
        cart.products = cart.products.filter(ci =>
            !purchasable.some(p => p.dbProd._id.equals(ci.product._id))
        );
        await cart.save();

        if (amount <= 0) {
            return res.status(400).json({
                status: "error",
                message: "No hay productos con stock disponible para comprar",
                outOfStock
            });
        }

        // genera un ticket
        const code = crypto.randomUUID();
        const ticket = await Ticket.create({
            code,
            amount,
            purchaser: req.user.email, 
            items: ticketItems
        });

        return res.json({
            status: "success",
            ticket,
            outOfStock
        });
    } catch (err) {
        console.error("purchaseCart error:", err);
        return res.status(500).json({ status: "error", message: "Error al procesar la compra" });
    }
};