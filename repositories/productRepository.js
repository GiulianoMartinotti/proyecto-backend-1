import ProductDAO from "../daos/mongo/productDao.js";

export default class ProductRepository {
    constructor(dao = new ProductDAO()) {
        this.dao = dao;
    }

    list() {
        return this.dao.find();
    }

    get(id) {
        return this.dao.findById(id);
    }

    add(data) {
        return this.dao.create(data);
    }

    update(id, data) {
        return this.dao.update(id, data);
    }

    remove(id) {
        return this.dao.delete(id);
    }
}