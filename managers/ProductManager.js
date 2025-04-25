const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor() {
        this.path = path.join(__dirname, '../data/products.json');
    }

    async init() {
        try {
            await fs.access(this.path);
        } catch {
            await fs.writeFile(this.path, JSON.stringify([]));
        }
    }

    async getProducts() {
        const data = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(data || '[]');
    }

    async getProductById(pid) {
        const products = await this.getProducts();
        return products.find(p => p.id === pid);
    }

    async addProduct(product) {
        const products = await this.getProducts();
        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        const newProduct = { id: newId, ...product };
        products.push(newProduct);
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async updateProduct(pid, updateFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === pid);

        if (index === -1) {
            throw new Error(`Producto con ID ${pid} no encontrado.`);
        }

        if ('id' in updateFields) {
            delete updateFields.id;
        }

        products[index] = { ...products[index], ...updateFields };
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));

        return products[index];
    }
    
    async deleteProduct(pid) {
        let products = await this.getProducts();
        const index = products.findIndex(p => p.id === pid);

        if (index === -1) {
            throw new Error(`Producto con ID ${pid} no encontrado.`);
        }

        products.splice(index, 1); // elimina 1 elemento en el índice
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));

        return true; // confirmamos que se eliminó correctamente
    }

}

module.exports = ProductManager;