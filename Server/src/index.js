// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { startDatabase } = require("./database/mongo");
const { InsertEvent, GetEvents, UpdateEvent, DeleteEvent } = require("./database/Events");

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

// start the in-memory MongoDB instance
startDatabase();

// starting the server
app.listen(5001, () => {
  console.log("listening on port 5001");
});

//All Endpoints
app.get("/", async (req, res) => {
  res.send(await GetEvents());
});

app.post("/", async (req, res) => {
  const newAd = req.body;
  var Id = await InsertEvent(newAd);
  res.send({ message: "Event Created", Id: Id });
});

app.delete("/:id", async (req, res) => {
  await DeleteEvent(req.params.id);
  res.send({ message: "Removed" });
});

app.put("/:id", async (req, res) => {
  const updatedAd = req.body;
  await UpdateEvent(req.params.id, updatedAd);
  res.send({ message: "Updated" });
});
