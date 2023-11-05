const express = require('express')
const app = express();
const cors =require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1hhdzxu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    await client.connect();

   const foodcollection =client.db("Foodswap").collection("availablefood")
   const requestcollection =client.db("Foodswap").collection("requested")


   app.get("/availablefood",async(req,res)=>{

    const result = await foodcollection.find().toArray()
    res.send(result)

   })
   app.get("/availablefood/:id",async(req,res)=>{

    const id =req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await foodcollection.findOne(query)
    res.send(result)

   })



//    request

app.post("/requested",async (req,res)=>{
    console.log(req.body)
    // const doc = {
    //     donator_name:req.body.donator_name,
    //     donation_amount:req.body.donation_amount,
    //     expired_date:req.body.expired_date,
    //     requestdate:req.body.expired_date,
    //     pickup_location:req.body.pickup_location,
    //     email:req.body.email,
    //     status:req.body.status
    //   }
  const food =req.body;
    const result =await requestcollection.insertOne(food)
    res.send(result)
})



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })