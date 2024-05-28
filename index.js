const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrlryfn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // Get the database and collection on which to run the operation
    const userCollecion = client.db("bistroDb").collection("users");
    const menuCollecion = client.db("bistroDb").collection("menu");
    const reviewCollecion = client.db("bistroDb").collection("reviews");
    const cartCollecion = client.db("bistroDb").collection("carts");

    // Users related API
    app.get('/users', async(req, res)=>{
      const result = await userCollecion.find().toArray();
      res.send(result);
    })

    app.post('/users', async(req, res)=>{
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollecion.findOne(query);
      if(existingUser){
        return res.send({
          message: 'User already exist', 
          insertedId: null
        })
      }
      const result = await userCollecion.insertOne(user);
      res.send(result);
    })

    app.patch('/users/admin/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await userCollecion.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/users/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollecion.deleteOne(query)
      res.send(result);
    })

    // Menu related API
    app.get('/menu', async(req, res) =>{
        const result = await menuCollecion.find().toArray();
        res.send(result);
    })

    // Reviews related API
    app.get('/reviews', async(req, res) =>{
        const result = await reviewCollecion.find().toArray();
        res.send(result);
    })

    // Carts Collection related API
    app.get('/carts', async(req, res)=>{
      const email = req.query.email;
      const query = { email:email }
      const result = await cartCollecion.find(query).toArray();
      res.send(result);
    })

    app.post('/carts', async(req, res)=>{
      const cartItem = req.body;
      const result = await cartCollecion.insertOne(cartItem);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollecion.deleteOne(query);
      res.send(result);
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


app.get('/', (req, res)=>{
    res.send('boss is running')
})

app.listen(port, () =>{
    console.log(`Bistro Boss is running on port: ${port}`)
})