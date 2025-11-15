const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());    


const uri = "mongodb+srv://rentwheeldbUser:kppPd65XUcqotVZH@mahamuduldb.jterdty.mongodb.net/?appName=MahamudulDB";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('Server is running!');
})

async function run (){
      try{
        await client.connect();
        console.log("MongoDB Connected ✔");

        const db = client.db("rentwheel_DB");
        const carsCollection = db.collection('cars');

        // Find all cars
        app.get('/cars', async (req, res) => {
            // const projectFields = {
            //     rentPrice: 1,
            //     carName: 1,
            //     image : 1,}
            // const cursor = carsCollection.find().sort({rentPrice: 1}).limit(5).project(projectFields);
            const cursor = carsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Find specific car
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carsCollection.findOne(query);
            res.send(result);
        })

        // Add a new car
        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            res.send(result);
        })

        // Delete a car
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.deleteOne(query);
            res.send(result);
        })

        // Update a car
        app.patch('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const updateCarData = req.body;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set:
                {
                    name: updateCarData.name,
                    price : updateCarData.price,
                }
            };
            const result = await carsCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      }
        finally{
        //   await client.close();
        }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});