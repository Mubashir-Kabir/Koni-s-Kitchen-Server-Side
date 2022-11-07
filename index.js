//required packages
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

//middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

//root route
app.get("/", (req, res) => {
  res.send("Server is Up...");
});

//mongodb connection
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.erzixne.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
//database collections
const dbServices = client.db("koni's-kitchen").collection("services");
const dbReviews = client.db("koni's-kitchen").collection("reviews");

const dbConnection = async () => {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection error", error.name, error.message);
  }
};
dbConnection();

//get all services
app.get("/services", async (req, res) => {
  try {
    const cursor = await dbServices.find({});
    const services = await cursor.toArray();
    res.send({
      status: true,
      data: services,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: "error",
      data: err.name,
    });
  }
});

//get specific service by service id
app.get("/services/:id", async (req, res) => {
  try {
    const service = await dbServices.findOne({ _id: ObjectId(req.params.id) });
    res.send({
      status: true,
      data: service,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//create review
app.post("/reviews", async (req, res) => {
  try {
    const result = await dbReviews.insertOne(req.body);
    if (result.insertedId) {
      res.send({
        status: true,
        data: result.insertedId,
      });
    } else {
      res.send({
        status: false,
        data: "something wrong",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
