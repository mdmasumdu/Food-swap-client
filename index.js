const express = require('express')
const app = express();
const cors =require("cors");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())

// const verifytoken=(req,res,next)=>{

//   const token =req.cookies.token;

//   if(!token){
//     return res.status(401).send({message:"an authorized"})
//   }

//   jwt.verify(token,process.env.TOken_PASS,(err,decoded)=>{
//     if(err){
//       return res.status(401).send({message:"an authorized"})
//     }
//     req.user =decoded;
//     next()
//   })

// }

// my created midlleare

const verifytoken =(req,res,next)=>{
  const token =req.cookies.token;
  if(!token){
   return res.status(401).send({message: "unauthorized"})
  }
  jwt.verify(token,process.env.TOken_PASS,(err,decoded)=>{
    if(err){
      return res.status(401).send({message: "unauthorized orcuured"})
    }

    req.user =decoded;
    next()
  })


}



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
    // await client.connect();

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

   
   app.get("/myfood",async (req,res)=>{
    console.log(req.query)
let  query ={};
if(req.query?.email){
query={donator_email:req.query.email}
}
const result = await foodcollection.find(query).toArray();
res.send(result)

})


   app.post('/availablefood',async(req,res)=>{
    const food = req.body;
    const result =await foodcollection.insertOne(food)
    res.send(result)
   })
     

   app.put("/availablefood/:id",async(req,res)=>{
    const id=req.params.id
    const updatedfood =req.body;
    const filter = {_id:new ObjectId(id) };
    const options = { upsert: true };
        const doc = {
          $set: {
            food_name:req.body.food_name,
            food_image:req.body.food_image,
            donator_image:req.body.donator_image,
            pickup_location:req.body.pickup_location,
            donator_name:req.body.donator_name,
            expired_date:req.body.expired_date,
            expired_time:req.body.expired_time,
            additional_notes:req.body.additional_notes,
            donator_email:req.body.donator_email,
            status:req.body.status,
            food_quantity:req.body.food_quantity
          },
     
      }
    const result =await foodcollection.updateOne(filter,doc,options)
    res.send(result)
   })



   app.patch('/availablefood/:id',async (req,res)=>{

    const id =req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        status:"Delivered"
      },
    };
    const result =await foodcollection.updateOne(filter,updateDoc,options);
    res.send(result)
  
  })
  //  
  //  app.get('/availablefood/:id',async (req,res)=>{

  //   const id =req.params.id;
  //   let query ={};
  //   if(req?.params?.id){
  //     query = {_id: new ObjectId(id)}
  //     const result = await requestcollection.find(query).toArray();
  //   res.send(result)
  // //   }
  
    
  
  
  // })
   

app.delete("/availablefood/:id",async(req,res)=>{

  const id =req.params.id
  const query ={_id:new ObjectId(id)}
const result =await foodcollection.deleteOne(query);
res.send(result)

})

//    request

app.post("/requested",async (req,res)=>{
    console.log(req.body)

  const reqfood =req.body;
    const result =await requestcollection.insertOne(reqfood)
    res.send(result)
})

app.get("/myfoodreq",verifytoken,async (req,res)=>{
  console.log(req.query)
let  query ={};
if(req.query?.email){
query={req_email:req.query.email}
}
const result = await requestcollection.find(query).toArray();
res.send(result)

})


app.get('/requested/:id',verifytoken,async (req,res)=>{

  const id =req.params.id;
  let query ={};
  if(req?.params?.id){
    query = {foodid: id}
    const result = await requestcollection.find(query).toArray();
  res.send(result)
  }

  


})
app.patch('/requested/:id',async (req,res)=>{

  const id =req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      status:"Delivered"
    },
  };
  const result =await requestcollection.updateOne(filter,updateDoc,options);
  res.send(result)

})
app.delete('/requested/:id',async (req,res)=>{

  const id =req.params.id
  const query ={_id:new ObjectId(id)}
const result =await requestcollection.deleteOne(query);
res.send(result)
})




// jwt

app.post("/jwt",async (req,res)=>{
      const user =req?.body;
      console.log(user)
  const token =jwt.sign(user,process.env.TOken_PASS,{expiresIn:"1h"})
  res.cookie("token",token,{
    httpOnly:true,
    secure:true,
    sameSite:"none"
  })
  .send({success:true})

})




app.post("/logout",(req,res)=>{
  const user =req.body;
  console.log("loggingout" ,user)
  res.clearCookie("token",{maxAge:0}).send({message:"succes"})
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