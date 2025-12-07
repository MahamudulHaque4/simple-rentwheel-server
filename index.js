const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_Username}:${process.env.DB_Password}@mahamuduldb.jterdty.mongodb.net/?appName=MahamudulDB`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected ✔");

    const db = client.db("rentwheel_DB");
    const carsCollection = db.collection("cars");
    const listingsCollection = db.collection("listings");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");

    // Users API
    app.post("/users", async (req, res) => {
      const newuser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.status(400).send({ message: "User already exists" });
      } else {
        const result = await usersCollection.insertOne(newuser);
        res.send(result);
      }
    });

    app.get("/top-cars", async (req, res) => {
      const cursor = carsCollection.find().sort({ rentPrice: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Find all cars
    app.get("/cars", async (req, res) => {
      // const projectFields = {
      //     rentPrice: 1,
      //     carName: 1,
      //     image : 1,}
      // const cursor = carsCollection.find().sort({rentPrice: 1}).limit(5).project(projectFields);

      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.providerEmail = email;
      }

      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Find a car by ID
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    //         app.get('/cars/:id', async (req, res) => {
    //     try {
    //         const id = req.params.id;
    //         console.log('Received ID parameter:', id);

    //         // Check if ID is provided
    //         if (!id) {
    //             return res.status(400).json({ error: 'ID parameter is required' });
    //         }

    //         // Validate ObjectId format
    //         if (!ObjectId.isValid(id)) {
    //             return res.status(400).json({ error: 'Invalid ID format' });
    //         }

    //         const query = { _id: new ObjectId(id) };
    //         console.log('MongoDB query:', query);

    //         const result = await carsCollection.findOne(query);
    //         console.log('Query result:', result);

    //         // Check if car was found
    //         if (!result) {
    //             return res.status(404).json({ error: 'Car not found with the provided ID' });
    //         }

    //         console.log('Sending car data:', result);
    //         res.json(result);

    //     } catch (error) {
    //         console.error('Server error:', error);
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // });

    //      // Add this test endpoint to debug the database connection
    //     app.get('/debug-db', async (req, res) => {
    //      try {
    //         console.log('=== DATABASE DEBUG INFO ===');

    //         // Test basic collection operations
    //         const totalCars = await carsCollection.countDocuments();
    //         console.log('Total cars in collection:', totalCars);

    //         // Get first car to verify collection access
    //         const firstCar = await carsCollection.findOne();
    //         console.log('First car in collection:', firstCar);

    //         // Test the specific ID we're looking for
    //         const specificCar = await carsCollection.findOne({
    //             _id: new ObjectId('691752349a33195cc3fed362')
    //         });
    //         console.log('Specific car lookup:', specificCar);

    //         // Get all IDs for verification
    //         const allCars = await carsCollection.find({}, { projection: { _id: 1, carName: 1 } }).toArray();
    //         console.log('All car IDs and names:');
    //         allCars.forEach(car => {
    //             console.log(`- ${car._id.toString()}: ${car.carName}`);
    //         });

    //         res.json({
    //             success: true,
    //             totalCars: totalCars,
    //             firstCar: firstCar,
    //             specificCar: specificCar,
    //             allCars: allCars.map(car => ({ id: car._id.toString(), name: car.carName })),
    //             collectionName: carsCollection.collectionName,
    //             databaseName: db.databaseName
    //         });

    //     } catch (error) {
    //         console.error('Debug endpoint error:', error);
    //         res.status(500).json({
    //             success: false,
    //             error: error.message,
    //             stack: error.stack
    //         });
    //     }
    //      });

    // Add a new car

    app.post("/cars", async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    // Delete a car
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    // Update a car
    app.patch("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const updateCarData = req.body; // can contain status, carName, etc.
      const query = { _id: new ObjectId(id) };

      const updateDoc = { $set: updateCarData };

      const result = await carsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Listings APIs can be added here similarly
    app.get("/listings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.ownerEmail = email;
      }
      const cursor = listingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/listings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listingsCollection.findOne(query);
      res.send(result);
    });

    app.post("/listings", async (req, res) => {
      const listing = req.body;
      const result = await listingsCollection.insertOne(listing);
      res.send(result);
    });

    app.delete("/listings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listingsCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        // Validate ID
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid listing ID format" });
        }

        const query = { _id: new ObjectId(id) };

        // Create update document dynamically based on what's provided
        const updateDoc = {
          $set: {},
        };

        // Add only the fields that are provided in the request body
        Object.keys(updateData).forEach((key) => {
          updateDoc.$set[key] = updateData[key];
        });

        // Check if update document has fields to update
        if (Object.keys(updateDoc.$set).length === 0) {
          return res.status(400).json({ error: "No update fields provided" });
        }

        const result = await listingsCollection.updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Listing not found" });
        }

        res.json({
          success: true,
          message: "Listing updated successfully",
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error updating listing:", error);
        res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
    });

    // Booking APIs can be added here similarly
    // For All Bookings
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyerEmail = email; // ✅ correct field name
      }
      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid booking id" });
        }

        
        const booking = await bookingsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!booking) {
          return res.status(404).json({ error: "Booking not found" });
        }

        const carId = booking.bookingId;

     
        const deleteResult = await bookingsCollection.deleteOne({
          _id: new ObjectId(id),
        });

     
        if (carId) {
          await carsCollection.updateOne(
            { _id: new ObjectId(carId) },
            { $set: { status: "Available" } }
          );
        }

        res.json({
          success: true,
          deletedCount: deleteResult.deletedCount,
        });
      } catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/bookings", async (req, res) => {
      try {
        const newBooking = req.body;
        const result = await bookingsCollection.insertOne(newBooking);

       
        if (newBooking.bookingId) {
          await carsCollection.updateOne(
            { _id: new ObjectId(newBooking.bookingId) },
            { $set: { status: "Booked" } } 
          );
        }

        res.send({
          success: true,
          bookingResult: result,
        });
      } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send({ success: false, message: "Booking failed" });
      }
    });

   
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
   
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
