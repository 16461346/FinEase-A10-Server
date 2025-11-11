const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4kmqo4g.mongodb.net/?appName=Cluster0`;

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

    const db=client.db('FinEase-db')
    const transaction=db.collection('transactions')


    //Transactions get kortesi 
    app.get('/transactions',async(req,res)=>{
        const result=await transaction.find().toArray()
        res.send(result)
    })

    app.get('/transactions/:id',async(req,res)=>{
      const {id}=req.params;
      const objectId=new ObjectId(id);
      const result= await transaction.findOne({_id:objectId})

      res.send({
        result
      })
    })

    //Post A Tranction
    app.post('/transactions', async(req,res)=>{
      const data=req.body;
      const result=await transaction.insertOne(data);

      res.send({
        success: true
      })
    })




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
