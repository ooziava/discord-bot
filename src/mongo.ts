import { readFileSync } from "fs";
import consola from "consola";
import mongoose from "mongoose";

const credentials = readFileSync("./cert.pem");
if (!credentials) {
  consola.error("No certificate found");
  process.exit(1);
}

await mongoose.connect(
  "mongodb+srv://cluster0.n3wzzwl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0",
  {
    serverApi: "1",
    key: credentials,
    cert: credentials,
  }
);
consola.success("Connected to MongoDB");

// process.on("SIGINT", () => mongoose.connection.close());
