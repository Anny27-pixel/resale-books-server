const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzlo6ar.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    // console.log('token inside verifyJWT', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const userCollection = client.db("resaleBooks").collection("userCollection");
        const categories = client.db("resaleBooks").collection("categories");
        const products = client.db("resaleBooks").collection("products");
        const orders = client.db("resaleBooks").collection("orders");


        const verifyBuyer = async (req, res, next) => {
            console.log('inside verifyBuyer', req.decoded.email);
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'buyer') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
        const verifySeller = async (req, res, next) => {
            console.log('inside verifySeller', req.decoded.email);
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
                // const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token });
            }
            console.log(user);
            res.status(403).send({ accessToken: '' });
        });

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

        app.get("/user/:email", verifyJWT, async (req, res) => {
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

        app.get("/allSeller", verifyJWT, verifySeller, async (req, res) => {
            const query = { role: "seller" };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/allBuyer", verifyJWT, verifyBuyer, async (req, res) => {
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
            console.log(categoryInfo, categoryProducts);
            res.send({ categoryInfo, categoryProducts });

        });

        app.get("/sellerProducts/:email", async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const result = await products.find(query).toArray();
            res.send(result);
        });
        app.get("/myBookings/:email", async (req, res) => {
            const email = req.params.email;
            const query = { BuyerEmail: email };
            const result = await orders.find(query).toArray();
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