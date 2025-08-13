import ProductDAO from "../daos/mongo/productDao.js";

export default class ProductRepository {
    constructor(dao = new ProductDAO()) {
        this.dao = dao;
    }

    paginate(filter, options) {
        return this.dao.paginate(filter, options);
    }

    findById(id) {
        return this.dao.findById(id);
    }

    create(data) {
        return this.dao.create(data);
    }

    findByIdAndUpdate(id, data, opts) {
        return this.dao.findByIdAndUpdate(id, data, opts);
    }

    findByIdAndDelete(id) {
        return this.dao.findByIdAndDelete(id);
    }

    // listado sin paginar
    find(filter = {}, projection, options = {}) {
        return this.dao.find(filter, projection, options);
    }
}