import fs from "fs";
import mongoose from "mongoose";
import { guildModel, playlistModel, songModel } from "../models";

export default async function connectToDB() {
  const credentials = fs.readFileSync("./cert.pem");
  await mongoose.connect(
    "mongodb+srv://cluster0.n3wzzwl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0",
    {
      serverApi: "1",
      key: credentials,
      cert: credentials,
    }
  );
}

process.on("SIGINT", () => mongoose.connection.close());
