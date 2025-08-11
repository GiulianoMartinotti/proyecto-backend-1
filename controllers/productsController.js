import ProductRepository from "../repositories/productRepository.js";

const productRepo = new ProductRepository();


export const getProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        // Filtro dinámico
        const filter = {};
        if (query) {
            if (query === "disponibles") filter.stock = { $gt: 0 };
            else filter.category = query;
        }

        // Opciones de paginación y ordenamiento
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {},
            lean: true
        };

        const result = await productRepo.paginate(filter, options);

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productRepo.findById(pid);

        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const newProduct = await productRepo.create(req.body);
        res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const updated = await productRepo.findByIdAndUpdate(pid, req.body, { new: true });

        if (!updated) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.json({ status: "success", payload: updated });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const deleted = await productRepo.findByIdAndDelete(pid);

        if (!deleted) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.json({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getProductsView = async (req, res) => {
    try {
        const products = await productRepo.find().lean();
        res.render("home", { products });
    } catch (error) {
        res.status(500).send("Error al renderizar productos: " + error.message);
    }
};
