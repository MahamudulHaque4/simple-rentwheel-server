const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_Username}:${process.env.DB_Password}@mahamuduldb.jterdty.mongodb.net/?appName=MahamudulDB`;

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
    // await client.connect();
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

    // Add a new car
    app.post("/cars", async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    // Delete a car
    app.delete("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid car id format" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await carsCollection.deleteOne(query);

        console.log("DELETE /cars/:id result:", result);

        res.json({
          success: result.deletedCount > 0,
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        console.error("Error deleting car:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
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

    // Listings APIs
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

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid listing ID format" });
        }

        const query = { _id: new ObjectId(id) };

        const updateDoc = {
          $set: {},
        };

        Object.keys(updateData).forEach((key) => {
          updateDoc.$set[key] = updateData[key];
        });

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

    // Booking APIs
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyerEmail = email;
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
