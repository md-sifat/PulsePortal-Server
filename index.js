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
        const feedbackCollection = client.db(process.env.MONGO_DB_NAME).collection("feedbacks");




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

        app.delete('/reg_camps/:campId', async (req, res) => {
            const campId = req.params.campId;

            try {
                const query = { _id: new ObjectId(campId) };
                const existingCamp = await reg_campCollection.findOne(query);

                if (!existingCamp) {
                    return res.status(404).send({ message: 'Camp not found' });
                }

                const result = await reg_campCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to delete camp' });
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

        app.put('/transactions/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTransaction = req.body;
            try {
                const result = await transactionCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedTransaction }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to update transaction' });
            }
        });

        app.delete('/transactions/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await transactionCollection.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to delete transaction' });
            }
        });



        // all the feedback realed api routes are in here 

        app.get('/feedbacks', async (req, res) => {
            try {
                const feedbacks = await feedbackCollection.find().toArray();
                res.send(feedbacks);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch feedbacks' });
            }
        });

        app.post('/feedbacks', async (req, res) => {
            try {
                const feedback = req.body;
                console.log(feedback);
                const result = await feedbackCollection.insertOne(feedback);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to add feedback' });
            }
        });

        app.get('/feedbacks/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const query = { _id: new ObjectId(id) };
                const feedback = await feedbackCollection.findOne(query);
                if (!feedback) {
                    return res.status(404).send({ message: 'Feedback not found' });
                }
                res.send(feedback);
            } catch (error) {
                res.status(500).send({ error: 'Failed to get feedback' });
            }
        });

        app.delete('/delete-feedback/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await feedbackCollection.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to delete feedback' });
            }
        });


        app.put('/feedbacks/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            try {
                const result = await feedbackCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to update feedback' });
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