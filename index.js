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
        const campCollection = client.db(process.env.MONGO_DB_NAME).collection("camps");
        const reg_campCollection = client.db(process.env.MONGO_DB_NAME).collection("registered_camps");
        const transactionCollection = client.db(process.env.MONGO_DB_NAME).collection("transactions");



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

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const query = { uid: id };
            const updateDoc = {
                $set: updatedUser
            };
            const options = { returnDocument: 'after' };
            try {
                const result = await userCollection.updateOne(query, updateDoc);
                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: 'User not found' });
                }
                res.send(result);
            } catch (error) {
                console.error('Error updating user:', error);
                res.status(500).send({ message: 'Failed to update user' });
            }
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
        app.get('/camps/:campId', async (req, res) => {
            const campId = req.params.campId;
            const query = { _id: new ObjectId(campId) };
            const camp = await campCollection.findOne(query);
            if (!camp) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send(camp);
        });

        app.delete('/delete-camp/:campId', async (req, res) => {
            const campId = req.params.campId;
            try {
                const result = await campCollection.deleteOne({ _id: new ObjectId(campId) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to delete camp' });
            }
        });

        app.put('/update-camp/:campId', async (req, res) => {
            const campId = req.params.campId;
            const updatedCamp = req.body;
            try {
                const result = await campCollection.updateOne(
                    { _id: new ObjectId(campId) },
                    { $set: updatedCamp }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to update camp' });
            }
        });

        // api for registered camp 


        app.get('/reg_camps', async (req, res) => {
            const camps = await reg_campCollection.find().toArray();
            res.send(camps);
        });
        app.post('/reg_camps', async (req, res) => {
            const camp = req.body;
            console.log(camp);
            const result = await reg_campCollection.insertOne(camp);
            res.send(result);
        });
        app.get('/reg_camps/:campId', async (req, res) => {
            const campId = req.params.campId;
            const query = { _id: new ObjectId(campId) };
            const camp = await reg_campCollection.findOne(query);
            if (!camp) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send(camp);
        });

        app.put('/reg_camps/:campId', async (req, res) => {
            const campId = req.params.campId;
            const updatedData = req.body;

            try {
                const query = { _id: new ObjectId(campId) };
                const existingCamp = await reg_campCollection.findOne(query);

                if (!existingCamp) {
                    return res.status(404).send({ message: 'Camp not found' });
                }

                const update = { $set: updatedData };
                const result = await reg_campCollection.updateOne(query, update);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to update camp' });
            }
        });




        // api for transaction 
        app.get('/transactions', async (req, res) => {
            try {
                const transactions = await transactionCollection.find().toArray();
                res.send(transactions);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch transactions' });
            }
        });

        app.post('/transactions', async (req, res) => {
            const transaction = req.body;
            try {
                const result = await transactionCollection.insertOne(transaction);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to add transaction' });
            }
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