import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Song, type Queue } from "interfaces/discordjs";

const queues: { [key: string]: Queue } = {};
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the queue for a guild from a JSON file
const loadQueue = (guildId: string): Queue => {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  const filePath = path.join(dataDir, `${guildId}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ songs: [], lastAddedIndex: 0 })
    );
    return { songs: [], lastAddedIndex: 0 };
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading queue for guild ${guildId}: ${err}`);
    return { songs: [], lastAddedIndex: 0 };
  }
};

// Save the queue for a guild to a JSON file
const saveQueue = (guildId: string, queue: Queue): void => {
  const filePath = path.join(__dirname, "../data", `${guildId}.json`);
  if (queue.songs.length > 100) {
    do {
      queue.songs.shift();
    } while (queue.songs.length > 100);
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(queue));
  } catch (err) {
    console.error(`Error saving queue for guild ${guildId}: ${err}`);
  }
};

// Add a song to the queue for a guild
const addSongsToQueue = (
  guildId: string,
  songs: Song[],
  options: { newQueue?: boolean } | undefined | null
): void => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.songs.concat(songs);
  if (options?.newQueue) queue.lastAddedIndex = queue.songs.length - 1;
  if (queue.lastAddedIndex >= queue.songs.length) queue.lastAddedIndex = -1;
  queues[guildId] = queue;
  saveQueue(guildId, queue);
};

// Remove a song from the queue for a guild
const removeSongFromQueue = (guildId: string, index: number): void => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.songs.splice(index, 1);
  queues[guildId] = queue;
  saveQueue(guildId, queue);
};

// Get the next song in the queue for a guild
const getNextSongInQueue = (guildId: string): Song | undefined => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.lastAddedIndex += 1;
  const song = queue.songs[queue.lastAddedIndex];
  queues[guildId] = queue;
  saveQueue(guildId, queue);
  return song;
};

export { addSongsToQueue, removeSongFromQueue, getNextSongInQueue };
