const ProductManager = require('./managers/ProductManager');
const CartManager = require('./managers/CartManager');

const run = async () => {
    const productManager = new ProductManager();
    const cartManager = new CartManager();

    // Agregar productos
    const p1 = await productManager.addProduct({ name: 'Mouse', price: 1500 });
    const p2 = await productManager.addProduct({ name: 'Teclado', price: 3000 });

    console.log('Productos:', await productManager.getProducts());

    // Crear un carrito
    const cart = await cartManager.createCart();
    console.log('Carrito creado:', cart);

    // Agrega los productos al carrito
    await cartManager.addProductToCart(cart.id, p1.id);
    await cartManager.addProductToCart(cart.id, p1.id); // Agrega el mismo para testear cantidad
    await cartManager.addProductToCart(cart.id, p2.id);

    console.log('Carrito actualizado:', await cartManager.getCartById(cart.id));
};

run();