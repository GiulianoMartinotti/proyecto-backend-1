const fs = require('fs').promises;
const path = require('path');

class CartManager {
    constructor() {
        this.path = path.join(__dirname, '../data/carts.json');
    }

    async init() {
        try {
            await fs.access(this.path);
        } catch {
            await fs.writeFile(this.path, JSON.stringify([]));
        }
    }

    async getCarts() {
        const data = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(data || '[]');
    }

    async createCart() {
        const carts = await this.getCarts();
        const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;
        const newCart = { id: newId, products: [] };
        carts.push(newCart);
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async getCartById(cid) {
        const carts = await this.getCarts();
        return carts.find(c => c.id === cid);
    }

    async addProductToCart(cid, pid) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === cid);
        if (!cart) return null;

        const productInCart = cart.products.find(p => p.product === pid);
        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
        return cart;
    }
}

module.exports = CartManager;