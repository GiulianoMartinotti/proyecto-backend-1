import Product from "../../models/product.js";

export default class ProductDAO {
    paginate(filter = {}, options = {}) {
        return Product.paginate(filter, options);
    }

    find(filter = {}, projection, options = {}) {
        const q = Product.find(filter, projection, options);
        if (options && options.lean === false) return q; 
        return q.lean();
    }

    findById(id) {
        return Product.findById(id).lean();
    }

    create(data) {
        return Product.create(data);
    }

    
    async findByIdAndUpdate(id, data, opts = {}) {
        const updated = await Product.findByIdAndUpdate(id, data, { new: true, ...opts });
        return updated?.toObject?.() ?? updated;
    }

    async findByIdAndDelete(id) {
        const deleted = await Product.findByIdAndDelete(id);
        return deleted?.toObject?.() ?? deleted;
    }

    //LEGACY 
    async update(id, data) {
        const updated = await Product.findByIdAndUpdate(id, data, { new: true });
        return updated?.toObject?.() ?? updated;
    }

    async delete(id) {
        const deleted = await Product.findByIdAndDelete(id);
        return deleted?.toObject?.() ?? deleted;
    }
}