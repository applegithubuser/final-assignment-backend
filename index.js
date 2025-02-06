const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const fileUpload = require('express-fileupload');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ftktcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

        // final-assignment   E2vJuLe5sXNH3tb

async function bootstrap() {
  try {
    await client.connect();
    const database = client.db('Online-Store');
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const ordersCollection = database.collection('orders');
    const categoriesCollection = database.collection('categories');

    // Get all products
    app.get('/all-products', async (req, res) => {
      const query = {};
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // Add a product
    app.post('/add-product', async (req, res) => {
      const { name, description, category, condition, location, resalePrice, originalPrice, yearsOfUse, sellerName, sellerVerified } = req.body;
      const pic = req.files.image;
      const picData = pic.data;
      const encodePic = picData.toString('base64');
      const imageBuffer = Buffer.from(encodePic, 'base64');

      const product = {
        name,
        description,
        category,
        condition,
        location,
        resalePrice,
        originalPrice,
        yearsOfUse,
        sellerName,
        sellerVerified: sellerVerified === 'true',
        image: imageBuffer,
        postedAt: new Date(),
      };

      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    // Get products by category
    app.get('/products/:category', async (req, res) => {
      const category = req.params.category;
      const query = { category };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // Get all categories
    app.get('/categories', async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    // Place an order
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    // Get orders by user email
    app.get('/orders', async (req, res) => {
      const email = req.query.email;
      const query = { buyerEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    // Update order payment status
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          paymentStatus: 'paid',
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Get all users
    app.get('/users', async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // Get user by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    // Make user admin
    app.put('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin',
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Verify seller
    app.put('/users/verify-seller/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          verified: true,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Add a user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

  } finally {
    // await client.close();
  }
}

bootstrap().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Online Store Backend is running!');
});

app.listen(port, () => {
  console.log(`Online Store app listening on port ${port}`);
});