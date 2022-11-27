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
        const products = client.db("resaleBooks").collection("products");
        const catagories = client.db("resaleBooks").collection("catagories");


        app.post("/addProduct", async (req, res) => {
            const product = req.body;
            const result = await products.insertOne(product);
            res.send(result);
        });

        app.post("/addUser", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const data = await userCollection.find(query).toArray();
            if (data.length === 0) {
                const result = await userCollection.insertOne(user);
                res.send(result);
                console.log(result);
            } else {
                res.send("User Already added");
                console.log("User Already added");
            }
        });


        app.get("/user", async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray();
            if (result) res.send(true);
            else res.send(false);
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