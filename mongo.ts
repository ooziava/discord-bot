import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
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
await client.connect();

export async function getLength(guildId: string) {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const length = await collection.countDocuments();
    return length;
  } catch (error) {
    consola.error(error);
    return 0;
  }
}

export const getNextSong: GetSong = async (guildId, id) => {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const song = await collection.findOne({ id: { $gt: id } });
    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  }
};

export const getPrevSong: GetSong = async (guildId, id) => {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);

    const song = await collection
      .find({ id: { $lt: id } })
      .sort({ id: -1 })
      .limit(1)
      .next();

    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  }
};

export const getSong: GetSong = async (guildId, id) => {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const song = await collection.findOne({ id });
    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  }
};

export async function saveSongs(songs: Song[], guildId: string) {
  try {
    const length = await getLength(guildId);

    const database = client.db("songs");
    const collection = database.collection(guildId);
    await collection.insertMany(songs.map((song, index) => ({ ...song, id: length + index })));
    consola.success(`Inserted ${songs.length} songs into ${guildId}`);
    return true;
  } catch (error) {
    consola.error(error);
    return false;
  }
}

export async function getSongs(guildId: string) {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const songs = await collection.find().sort({ timestamp: 1 }).toArray();
    return songs as unknown[] as Song[];
  } catch (error) {
    consola.error(error);
    return [];
  }
}

export async function removeSong(guildId: string, id: number) {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    await collection.deleteOne({ id });
    consola.success(`Deleted song ${id} from ${guildId}`);
    return true;
  } catch (error) {
    consola.error(error);
    return false;
  }
}

export async function clearSongs(guildId: string) {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    await collection.deleteMany({});
    consola.success(`Cleared songs from ${guildId}`);
    return true;
  } catch (error) {
    consola.error(error);
    return false;
  }
}

export async function findSong(guildId: string, query: string) {
  try {
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const song = await collection.findOne({ title: { $regex: query, $options: "i" } });
    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  }
}

process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
