const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzlo6ar.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const userCollection = client.db("resaleBooks").collection("userCollection");
        const categories = client.db("resaleBooks").collection("categories");
        const products = client.db("resaleBooks").collection("products");
        const orders = client.db("resaleBooks").collection("orders");


        app.post("/addProduct", async (req, res) => {
            const order = req.body;
            const result = await orders.insertOne(order);
            res.send(result);
        });

        app.post("/makeOrder", async (req, res) => {
            const order = req.body;
            const result = await orders.insertOne(order);
            res.send(result);
        });


        app.post("/addUser", async (req, res) => {
            const user = req.body;
            user.role === "seller" ? (user.isSeller = true) : (user.isSeller = false);
            user.role === "admin" ? (user.isAdmin = true) : (user.isAdmin = false);
            user.role === "buyer" ? (user.isBuyer = true) : (user.isBuyer = false);
            const query = { email: user.email };
            const data = await userCollection.find(query).toArray();
            if (data.length === 0) {
                const result = await userCollection.insertOne(user);
                res.send(result);
                console.log(result);
            } else {
                res.send("User Already added");
            }
        });

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.find(query).toArray();
            res.send(result[0]);
        });


        app.get("/categories", async (req, res) => {
            const query = {};
            const result = await categories.find(query).toArray();
            res.send(result);
        });

        app.get("/all-seller", async (req, res) => {
            const query = { role: "seller" };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/all-buyer", async (req, res) => {
            const query = { role: "buyer" };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/categories/:cid", async (req, res) => {
            const cid = req.params.cid;
            const query1 = { category: cid };
            const query2 = { id: parseInt(cid) };
            console.log(cid);
            const categoryInfo = await categories.findOne(query2);
            const categoryProducts = await products.find(query1).toArray();
            res.send({ categoryInfo, categoryProducts });
        });

        app.get("/seller-products/:email", async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const result = await products.find(query).toArray();
            res.send(result);
        });
    }
    finally {

    }
}
run().catch((error) => {
    console.error(error);
});


app.get('/', async (req, res) => {
    res.send('resale books server is running');
})


app.listen(port, () => console.log(`resale books server running on ${port}`))