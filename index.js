//required packages
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

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

//verify jwt token
const verifyJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("unauthorized access");
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("forbidden access");
    }
    req.decoded = decoded;
    next();
  });
};

//get services
//for limited services query params "limit" should be added
app.get("/services", async (req, res) => {
  try {
    const cursor = dbServices.find({});
    const services = await cursor
      .limit(parseInt(req.query.limit))
      .sort({ timeObj: -1 })
      .toArray();
    res.send({
      status: true,
      data: services,
    });
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//get specific service by service id
//need request params
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

//create services
//need request body in json formate
app.post("/services", async (req, res) => {
  try {
    const result = await dbServices.insertOne(req.body);
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

//create review
//need request body in json formate
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

//get reviews for public route
//reviews/public?id=636949c446ba50945d653d2d
app.get("/reviews/public", async (req, res) => {
  try {
    const id = req.query.id;
    const reviews = await dbReviews
      .find({ postId: id })
      .sort({ timeObj: -1 })
      .toArray();
    res.send({
      status: true,
      data: reviews,
    });
  } catch (err) {
    console.log(err);
    res.send({
      status: false,
      data: err.name,
    });
  }
});
//get reviews for private route
//reviews/private?email=mohammad15-10691@diu.edu.bd
app.get("/reviews/private", verifyJwt, async (req, res) => {
  try {
    const email = req.query.email;
    const decoded = req.decoded.email;
    if (email !== decoded) {
      return res.status(403).send({
        status: false,
        data: "access forbidden",
      });
    }
    const reviews = await dbReviews
      .find({ userEmail: email })
      .sort({ timeObj: -1 })
      .toArray();
    res.send({
      status: true,
      data: reviews,
    });
  } catch (err) {
    console.log(err);
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//requesting fot jwt token
//need request body in json formate
app.post("/jwt-token", (req, res) => {
  try {
    const token = jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    res.send({
      status: true,
      data: token,
    });
  } catch (err) {
    res.send({
      status: false,
      data: err.name,
    });
  }
});

//delete specific review with review id (_id)
app.delete("/reviews/:id", async (req, res) => {
  try {
    const query = { _id: ObjectId(req.params.id) };
    const result = await dbReviews.deleteOne(query);
    if (result.deletedCount) {
      res.send({
        status: true,
        message: "deleted successfully",
      });
    } else {
      res.send({
        status: false,
        message: "something wrong, try again",
      });
    }
  } catch (err) {
    console.log(err.name, err.message);
    res.send({
      status: false,
      message: err.name,
    });
  }
});

//update specific review with review id (_id)
app.put("/reviews/:id", async (req, res) => {
  try {
    const query = { _id: ObjectId(req.params.id) };
    const review = req.body;
    const result = await dbReviews.updateOne(query, { $set: review });
    if (result.modifiedCount) {
      res.send({
        status: true,
        message: "successfully updated",
      });
    } else {
      console.log(result);
      res.send({
        status: false,
        error: "something went wrong",
      });
    }
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      status: false,
      error: error.name,
    });
  }
});

//server listener
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
