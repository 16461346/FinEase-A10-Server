const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4kmqo4g.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("FinEase-db");
    const transaction = db.collection("transactions");
    const users = db.collection("users");

    //user post
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existionUser = await users.findOne(query);

      if (existionUser) {
        res.send({ message: "user already exist" });
      } else {
        const result = await users.insertOne(newUser);
        res.send(result);
      }
    });

    //user update
    app.put("/update-user", async (req, res) => {
      const email = req.query.email;
      const Data = req.body;
      const filter = { email: email };
      const update = {
        $set: Data,
      };
      const result = await users.updateOne(filter, update);
      res.send({
        success: true,
        result,
      });
    });

    // GET reports by email
    app.get("/report-page", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).json({ error: "Email is required" });

      try {
        const userReports = await transaction.find({ email }).toArray();
        res.json(userReports);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
      }
    });

    app.get("/transactions", async (req, res) => {
      const result = await transaction.find().toArray();
      res.send(result);
    });

    app.get("/transactions/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const result = await transaction.findOne({ _id: objectId });

      res.send({
        result,
      });
    });

    app.put("/transactions/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: data,
      };

      const result = await transaction.updateOne(filter, update);

      res.send({
        success: true,
        result,
      });
    });

    app.delete("/transactions/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };

      const result = await transaction.deleteOne(filter);

      res.send({
        success: true,
        result,
      });
    });

    //Post A Tranction
    app.post("/transactions", async (req, res) => {
      const data = req.body;

      if (data.date) {
        data.date = new Date(data.date + "T00:00:00Z"); // UTC midnight
      }

      const result = await transaction.insertOne(data);
      res.send({ success: true, result });
    });

    app.get("/month-transactions", async (req, res) => {
      const now = new Date();

      // Start of current month UTC
      const startOfMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
      );

      // End of current month UTC (23:59:59 last day)
      const endOfMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)
      );

      try {
        const transactions = await transaction
          .find({
            date: { $gte: startOfMonth, $lte: endOfMonth },
          })
          .sort({ date: -1 })
          .toArray();

        console.log(
          "Start:",
          startOfMonth,
          "End:",
          endOfMonth,
          "Found:",
          transactions.length
        );

        res.json(transactions);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
      }
    });

    app.listen(port, () => {
      console.log(`app listen port ${port}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

// https://github.com/16461346/FinEase-A10-Server.git
// https://github.com/16461346/FinBase-A10.git
