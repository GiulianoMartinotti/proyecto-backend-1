#🛒 E-commerce Node.js (Express + Mongo + Handlebars)

##Proyecto de e-commerce con Node.js, Express, MongoDB/Mongoose, Handlebars, Passport, JWT en cookies y Nodemailer.
Incluye CRUD de productos, gestión de carritos, autenticación/autorización por roles, recuperación de contraseña con expiración y lógica de compra con emisión de tickets.

# Funcionalidades

##Productos

#####Listado con paginación / filtros / orden (mongoose-paginate-v2)

#####CRUD protegido: solo admin puede crear/editar/eliminar

##Carritos

####Agregar / actualizar cantidad / eliminar / vaciar

Vista pública de carrito vacío; acciones solo con login

#####Compra: verifica stock, descuenta, compra parcial si falta stock y genera Ticket

#####Usuarios y sesiones

#####Registro y login (Passport Local)

#####JWT firmado y guardado en cookie httpOnly

#####/api/sessions/current devuelve DTO seguro (sin datos sensibles)

#####Recuperación de contraseña

#####Envío de mail con link de reseteo

#####Link expira a la hora

#####Evita reutilizar la contraseña anterior

#####Vistas (Handlebars)

#####home, cart, login, register, forgotPassword, resetPassword

#####tickets (mis compras) y ticket (detalle)

#####SweetAlert2 para toasts/confirmaciones

#Arquitectura

#####Capas: controllers / routes / models / daos / repositories / dto / middlewares / utils / views

#####Repository Pattern (productos) y DTO (usuario)

#####Node.js, Express, Handlebars

#####MongoDB, Mongoose (+ mongoose-paginate-v2)

#####Passport (local), JWT, cookie-parser, bcrypt

#####Nodemailer (mailing de reseteo)

#####SweetAlert2 (UX toasts/modales)

##🗂️ Estructura 
#####config/           -> DB, passport
#####controllers/      -> products, carts, views, sessions, password
#####daos/mongo/     -> acceso a datos (ProductDAO, ...)
#####dto/              -> UserDTO
#####middlewares/     -> authJwt, authorizeRoles, requireLoginView
#####models/           -> mongoose models (product, cart, user, ticket)
#####public/css/       -> estilos
#####repositories/     -> ProductRepository (y opcional CartRepository)
#####routes/
##### api/            -> productsRouter, cartsRouter, sessionsRouter, passwordRouter
#####  views.js        -> rutas de vistas (home, cart, login/register, tickets)
#####utils/           -> bcrypt, mailer
#####views/            -> handlebars (layouts, home, cart, tickets, ticket, auth pages)
#####index.js          -> app

##Para que funcione
###1) Requisitos

#####Node 18+

#####MongoDB local o Atlas

###2) Variables de entorno

Crea .env a partir de este ejemplo:

### .env.example
#####PORT=8080
NODE_ENV=development

 Mongo
MONGODB_URI=mongodb://localhost:27017/ecommerce

Sessions & JWT
SESSION_SECRET=changeme_session
JWT_SECRET=changeme_jwt

Base URL (para links en mails)
BASE_URL=http://localhost:8080

#### Mailer (usa Ethereal o tu SMTP real)
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=your_ethereal_user
MAIL_PASS=your_ethereal_pass
MAIL_FROM="Soporte E-commerce <no-reply@ecommerce.local>"


Nota: en producción, usa NODE_ENV=production; las cookies se envían con secure: true.

###3) Instalación & scripts
npm install
 opcional: agrega estos scripts 
 "dev": "nodemon index.js",
 "start": "node index.js"
npm run dev


####La app corre en http://localhost:8080.

###👮 Roles y autorizaciones

####admin:
#####Puede crear/editar/eliminar productos
#####Puede ver cualquier carrito (lectura)
#####No puede mutar carritos 

###user:

#####Puede agregar/editar/eliminar/vaciar su propio carrito

#####Puede comprar su carrito (genera Ticket)

#####Rutas protegidas (extracto):

####Productos (admin):

#####POST /api/products, PUT /api/products/:pid, DELETE /api/products/:pid)

####Carrito (user):

#####POST /api/carts/:cid/products/:pid

#####PUT /api/carts/:cid/products/:pid

#####DELETE /api/carts/:cid/products/:pid

#####DELETE /api/carts/:cid

#####POST /api/carts/:cid/purchase

####Carrito (lectura user|admin):

#####GET /api/carts/:cid

##🔐 Autenticación

Login emite JWT y lo guarda en cookie httpOnly, sameSite=lax y secure en producción.

/api/sessions/current devuelve UserDTO con: id, first_name, last_name, email, role.

##🔁 Recuperación de contraseña

POST /api/password/forgot recibe { email } y envía mail con link:

el link contiene un token JWT que expira en 1 hora

POST /api/password/reset recibe { token, newPassword }:

#####valida token, rechaza si la nueva contraseña coincide con la anterior

guarda hash con bcrypt

En el código, asegurate de firmar con:
jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" })

##🧾 Lógica de compra y Tickets

POST /api/carts/:cid/purchase

Recorre items del carrito y valida stock

Descuenta stock de lo comprable

Los sin stock permanecen en el carrito

##### - Genera Ticket:

{
  code: uuid,
  purchase_datetime: Date,
  amount: Number,
  purchaser: String (email),
  items: [{ product, title, price, quantity }]
}


Respuesta: { status: "success", ticket, outOfStock }

##### - Vistas:

/tickets: listado “Mis compras” (paginado)

/tickets/code: detalle con productos, cantidades, subtotales y total, botones Imprimir / Copiar código / Continuar comprando

##🧠 Repository & DTO

#####Repository Pattern (productos)
controllers/productsController.js → repositories/productRepository.js → daos/mongo/productDao.js
Separa lógica de negocio del acceso a datos.

DTO (usuario)
UserDTO expone solo datos no sensibles para /current.

#### Endpoints:
#### Auth (API):

##### - POST /api/sessions/register

##### - POST /api/sessions/login

##### - POST /api/sessions/logout (o GET /api/sessions/logout)

##### - GET /api/sessions/current → { status, payload: UserDTO }

####  Password (API):

##### - POST /api/password/forgot → envía mail

##### - POST /api/password/reset → cambia pass (no reutiliza)

####Productos (API):

#####GET /api/products?limit=&page=&sort=asc|desc&query=disponibles|

#####GET /api/products/:pid

#####POST /api/products (admin)

#####PUT /api/products/:pid (admin)

#####DELETE /api/products/:pid (admin)

####Carritos (API):

##### - GET /api/carts/:cid (user|admin lectura)

##### - POST /api/carts/:cid/products/:pid (user)

##### - PUT /api/carts/:cid (user)

##### - PUT /api/carts/:cid/products/:pid (user)

##### - DELETE /api/carts/:cid/products/:pid (user)

##### - DELETE /api/carts/:cid (user)

##### - POST /api/carts/:cid/purchase (user)

####Vistas:

##### - / (home)

##### - /carts/:cid

##### - /login, /register, /forgot-password, /reset-password

##### - /tickets (mis compras)

##### - /tickets/:code (detalle)
