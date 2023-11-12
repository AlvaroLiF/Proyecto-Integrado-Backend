const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const app = express();
const db = require("./models");
const Category = db.category;
const Role = db.role;
const port = process.env.PORT || 3000;

require('dotenv').config();

let corsOptions = {
  origin: true,
  credential: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./routes/userRoutes')(app);
require('./routes/productRoutes')(app);
require('./routes/orderRoutes')(app);
require('./routes/categoryRoutes')(app);
require('./routes/cartRoutes')(app);

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});

mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASS+'@componentx.dx76qu1.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Conexión a la base de datos establecida.');
    await initialRoles();
    await initialCategories();
    //mongoose.connection.close();
  })
  .catch(err => console.error('Error al conectar a la base de datos:', err));

async function initialRoles() {
  try {
    const count = await Role.estimatedDocumentCount();
    if (count === 0) {
      await Promise.all([
        new Role({ name: "User" }).save(),
        new Role({ name: "Admin" }).save()
      ]);
    }
  } catch (err) {
    console.error("Error al agregar roles", err);
  }
}

async function initialCategories() {
  try {
    const count = await Category.estimatedDocumentCount();
    if (count === 0) {
      await Promise.all([
        new Category({ name: "Gaming" }).save(),
        new Category({ name: "Portátiles" }).save(),
        new Category({ name: "Componentes" }).save(),
        new Category({ name: "Monitores" }).save(),
        new Category({ name: "Smartphones" }).save(),
        new Category({ name: "Televisores" }).save(),
        new Category({ name: "Hogar" }).save(),
      ]);
    }
  } catch (err) {
    console.error("Error al agregar categorías", err);
  }
}
