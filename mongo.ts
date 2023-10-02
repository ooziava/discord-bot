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

export async function getLength(guildId: string) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const length = await collection.countDocuments();
    return length;
  } catch (error) {
    consola.error(error);
    return 0;
  } finally {
    await client.close();
  }
}

export async function getNextSong(guildId: string, id: number) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const song = await collection.findOne({ id: { $gt: id } });
    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  } finally {
    await client.close();
  }
}

export async function saveSongs(songs: Song[], guildId: string) {
  try {
    const length = await getLength(guildId);
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    await collection.insertMany(songs.map((song, index) => ({ ...song, id: length + index })));
    consola.success(`Inserted ${songs.length} songs into ${guildId}`);
    return true;
  } catch (error) {
    consola.error(error);
    return false;
  } finally {
    await client.close();
  }
}

export async function getSongs(guildId: string) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const songs = await collection.find({}).sort({ timestamp: 1 }).toArray();
    return songs as unknown[] as Song[];
  } catch (error) {
    consola.error(error);
    return [];
  } finally {
    await client.close();
  }
}

export async function getSong(guildId: string, id: number) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const song = await collection.findOne({ id });
    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  } finally {
    await client.close();
  }
}

export async function removeSong(guildId: string, id: number) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    await collection.deleteOne({ id });
    consola.success(`Deleted song ${id} from ${guildId}`);
    return true;
  } catch (error) {
    consola.error(error);
    return false;
  } finally {
    await client.close();
  }
}

export async function clearSongs(guildId: string) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    await collection.deleteMany({});
    consola.success(`Cleared songs from ${guildId}`);
    return true;
  } catch (error) {
    consola.error(error);
    return false;
  } finally {
    await client.close();
  }
}

export async function findSong(guildId: string, query: string) {
  try {
    await client.connect();
    const database = client.db("songs");
    const collection = database.collection(guildId);
    const song = await collection.findOne({ title: { $regex: query, $options: "i" } });
    return song as unknown as Song;
  } catch (error) {
    consola.error(error);
    return null;
  } finally {
    await client.close();
  }
}
