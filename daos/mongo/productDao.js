import Product from "../../models/product.js";

export default class ProductDAO {
    find(filter = {}) {
        return Product.find(filter).lean();
    }

    findById(id) {
        return Product.findById(id).lean();
    }

    create(data) {
        return Product.create(data);
    }

    update(id, data) {
        return Product.findByIdAndUpdate(id, data, { new: true, lean: true });
    }

    delete(id) {
        return Product.findByIdAndDelete(id).lean();
    }
}