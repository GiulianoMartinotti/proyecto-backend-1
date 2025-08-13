import Product from "../models/product.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Ticket from "../models/ticket.js";
import jwt from "jsonwebtoken";

// Función para renderizar la vista principal con productos paginados
const renderHome = async (req, res) => {
    try {
        const products = await Product.find().lean();

        // Leer usuario desde cookie (si existe)
        let user = null;
        const token = req.cookies?.token;
        if (token) {
            try {
                user = jwt.verify(token, process.env.JWT_SECRET); // { id, email, first_name, ... }
            } catch (err) {
                console.error("Token inválido");
            }
        }

        // Vincular carrito al usuario logueado
        let cartId = null;
        if (user?.id) {
            const dbUser = await User.findById(user.id);

            // si el usuario no tiene carrito, crearlo y asignarlo
            if (!dbUser.cart) {
                const newCart = await Cart.create({ products: [] });
                dbUser.cart = newCart._id;
                await dbUser.save();
            }
            cartId = dbUser.cart.toString();
        }



        res.render("home", {
            products,
            cartId,
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al cargar productos.");
    }
};



// Renderizar carrito (público en /carts y específico en /carts/:cid)
const getCartView = async (req, res) => {
    try {
        const { cid } = req.params || {};


        let user = res.locals.user || null;
        if (!user) {
            const token = req.cookies?.token;
            if (token) {
                try {
                    user = jwt.verify(token, process.env.JWT_SECRET);
                } catch (err) {
                    console.error("Token inválido");
                }
            }
        }

        // Si NO viene :cid detecta /carts (público)
        if (!cid) {
            // Si hay usuario logueado y tiene/creamos carrito, redirigimos a /carts/:cartId
            if (user?.id) {
                const dbUser = await User.findById(user.id);

                if (!dbUser.cart) {
                    const newCart = await Cart.create({ products: [] });
                    dbUser.cart = newCart._id;
                    await dbUser.save();
                    return res.redirect(`/carts/${newCart._id.toString()}`);
                }

                return res.redirect(`/carts/${dbUser.cart.toString()}`);
            }

            // Visitante (sin login): render carrito vacío
            const formattedZero = new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2,
            }).format(0);

            return res.render("cart", {
                cartId: null,
                products: [],
                total: formattedZero,
                totalQuantity: 0,
                user,
                message: "Tu carrito está vacío.",
            });
        }

        // Si VIENE :cid, detecta /carts/:cid
        const cart = await Cart.findById(cid).populate("products.product").lean();

        if (!cart) {
            const formattedZero = new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2,
            }).format(0);

            return res.status(404).render("cart", {
                cartId: cid,
                products: [],
                total: formattedZero,
                totalQuantity: 0,
                user,
                message: "El carrito no existe o fue eliminado.",
            });
        }

        const products = (cart.products || []).map((item) => ({
            _id: item.product._id,
            title: item.product.title,
            description: item.product.description,
            price: item.product.price,
            quantity: item.quantity,
            category: item.product.category,
        }));

        const total = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
        const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);

        const formattedTotal = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
        }).format(total);

        return res.render("cart", {
            cartId: cid,
            products,
            total: formattedTotal,
            totalQuantity,
            user,
        });
    } catch (err) {
        console.error("Error en getCartView:", err);

        const formattedZero = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
        }).format(0);

        return res.status(500).render("cart", {
            cartId: null,
            products: [],
            total: formattedZero,
            totalQuantity: 0,
            user: null,
            message: "Ocurrió un error al cargar el carrito.",
        });
    }
};

const renderTicket = async (req, res) => {
    try {
        const { code } = req.params;
        const user = res.locals.user;

        const ticket = await Ticket.findOne({ code }).lean();
        if (!ticket) return res.status(404).render("ticket", { notFound: true, code });

        // seguridad: solo dueño o admin
        if (user?.role !== "admin" && user?.email !== ticket.purchaser) {
            return res.status(403).render("ticket", { forbidden: true });
        }

        // Formatos
        const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
        const items = (ticket.items || []).map(it => ({
            title: it.title,
            quantity: it.quantity,
            priceFmt: fmt.format(it.price || 0),
            subtotalFmt: fmt.format((it.price || 0) * (it.quantity || 0))
        }));
        const total = fmt.format(ticket.amount || 0);
        const fecha = new Date(ticket.purchase_datetime || ticket.createdAt || Date.now()).toLocaleString("es-AR");

        // Nombre y apellido del comprador (o en su defecto un fallback a email si no se encuentra)
        let purchaserName = ticket.purchaser;
        try {
            const purchaserUser = await User.findOne({ email: ticket.purchaser }).select("first_name last_name").lean();
            if (purchaserUser) {
                const full = `${purchaserUser.first_name || ""} ${purchaserUser.last_name || ""}`.trim();
                if (full) purchaserName = full;
            }
        } catch {  }

        return res.render("ticket", {
            ticket,
            items,
            total,
            fecha,
            purchaserName,  
            user
        });
    } catch (err) {
        console.error("renderTicket error:", err);
        return res.status(500).render("ticket", { error: "Error al cargar el ticket" });
    }
};


// Listado "Mis compras"
const renderMyTickets = async (req, res) => {
    try {
        const user = res.locals.user; 
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);

        const query = { purchaser: user.email };
        const [total, list] = await Promise.all([
            Ticket.countDocuments(query),
            Ticket.find(query)
                .sort({ purchase_datetime: -1, createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
        ]);

        const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

        const tickets = list.map(t => {
            const itemsCount = (t.items || []).reduce((a, it) => a + (it.quantity || 0), 0);
            return {
                code: t.code,
                date: new Date(t.purchase_datetime || t.createdAt || Date.now()).toLocaleString("es-AR"),
                itemsCount,
                amountFmt: fmt.format(t.amount || 0)
            };
        });

        const totalPages = Math.max(1, Math.ceil(total / limit));
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;

        res.render("tickets", {
            tickets,
            page,
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/tickets?page=${page - 1}&limit=${limit}` : null,
            nextLink: hasNextPage ? `/tickets?page=${page + 1}&limit=${limit}` : null,
            user
        });
    } catch (err) {
        console.error("renderMyTickets error:", err);
        res.status(500).render("tickets", { error: "Error al cargar tus compras" });
    }
};



export { renderHome, getCartView, renderTicket, renderMyTickets };