const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db(process.env.MONGO_DB_NAME).collection("users");
        const campCollection = client.db(process.env.MONGO_DB_NAME).collection("camp");

        app.get('/users', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
        
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { uid: id };
            const user = await userCollection.findOne(query);
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send(user);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(`delete request has come`);
            const query = { uid: id };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // this routes for camps
        app.get('/camps', async (req, res) => {
            const camps = await campCollection.find().toArray();
            res.send(camps);
        });
        app.post('/camps', async (req, res) => {
            const camp = req.body;
            console.log(camp);
            const result = await campCollection.insertOne(camp);
            res.send(result);
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("pulseportal-Server is LIVE");
});

app.listen(port, () => {
    console.log(`server is running on port : ${port}`);
}
);