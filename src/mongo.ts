import fs from "fs";
import mongoose from "mongoose";
import consola from "consola";

const credentials = fs.readFileSync("./cert.pem");
await mongoose.connect(
  "mongodb+srv://cluster0.n3wzzwl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0",
  {
    serverApi: "1",
    key: credentials,
    cert: credentials,
  }
);
mongoose.set("strictQuery", false);
consola.success("Connected to MongoDB");

process.on("SIGINT", () => mongoose.connection.close());
