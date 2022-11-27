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
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const userCollection = client.db("resaleBooks").collection("userCollection");
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