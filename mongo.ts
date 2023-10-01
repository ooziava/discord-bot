import { MongoClient, ServerApiVersion } from "mongodb";
import fs from "fs";
import consola from "consola";

const credentials = fs.readFileSync("./cert.pem");
const client = new MongoClient(
  "mongodb+srv://cluster0.n3wzzwl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
  {
    serverApi: ServerApiVersion.v1,
    key: credentials,
    cert: credentials,
  }
);

async function run() {
  try {
    await client.connect();
    const database = client.db("testDB");
    const collection = database.collection("testCol");
    const docCount = await collection.countDocuments({});
    consola.info(docCount);
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(consola.error);
