const ProductManager = require('./managers/ProductManager');
const CartManager = require('./managers/CartManager');

const run = async () => {
    const productManager = new ProductManager();
    const cartManager = new CartManager();

    // Inicializa los archivos 
    await productManager.init();
    await cartManager.init();

    const p1 = await productManager.addProduct({ name: 'Mouse', price: 1500 });
    const p2 = await productManager.addProduct({ name: 'Teclado', price: 3000 });
    const p3 = await productManager.addProduct({ name: 'Monitor', price: 6000 });

    console.log('Productos:', await productManager.getProducts());

    const cart = await cartManager.createCart();
    await cartManager.addProductToCart(cart.id, p1.id);
    await cartManager.addProductToCart(cart.id, p2.id);

    console.log('Carrito actualizado:', await cartManager.getCartById(cart.id));
};

run();

//IMPORTANTE!
// PRUEBAS PARA COMPROBAR EL FUNCIONAMIENTO (Pruebe si quiere profe, se las deje ordenadas justo abajo)

/* Prueba de eliminar productos
    console.log('Productos antes:', await productManager.getProducts());

    // Elimina un producto que si existe
    try {
        await productManager.deleteProduct(p2.id);
        console.log(`Producto con ID ${p2.id} eliminado correctamente.`);
    } catch (error) {
        console.error('Error al borrar producto válido:', error.message);
    }

    // elimina un producto que NO existe y suelta el error
    try {
        await productManager.deleteProduct(999); // ID inventado
    } catch (error) {
        console.error('Error esperado al borrar producto inexistente:', error.message);
    }

    console.log('Productos después:', await productManager.getProducts());
};
*/


/* Prueba de agregar productos
    console.log('Productos:', await productManager.getProducts());

    // Crear carrito y agregar productos
    const cart = await cartManager.createCart();
    await cartManager.addProductToCart(cart.id, p1.id);
    await cartManager.addProductToCart(cart.id, p2.id);

    console.log('Carrito actualizado:', await cartManager.getCartById(cart.id));
*/

/* Prueba de actualizar productos
    try {
        const updated = await productManager.updateProduct(p1.id, { price: 145000, id: 999 });
        console.log('Producto actualizado:', updated);
    } catch (error) {
        console.error('Error al actualizar producto válido:', error.message);
    }

    // Actualizar un producto que NO EXISTE
    try {
        await productManager.updateProduct(999, { name: 'Cámara' });
    } catch (error) {
        console.error('Error esperado al actualizar producto inexistente:', error.message);
    }

    console.log('Después de actualizar:', await productManager.getProducts());
};
*/