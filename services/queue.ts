import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Song, type Queue } from "interfaces/discordjs";

const queues: { [key: string]: Queue } = {};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_QUEUE_LENGTH = 100;

const loadQueue = (guildId: string): Queue => {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  const filePath = path.join(dataDir, `${guildId}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ songs: [], lastAddedIndex: -1 })
    );
    return { songs: [], lastAddedIndex: -1 };
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading queue for guild ${guildId}: ${err}`);
    return { songs: [], lastAddedIndex: -1 };
  }
};

const saveQueue = (guildId: string, queue: Queue): void => {
  const filePath = path.join(__dirname, "../data", `${guildId}.json`);
  if (queue.songs.length > MAX_QUEUE_LENGTH) {
    queue.songs.splice(0, queue.songs.length - MAX_QUEUE_LENGTH);
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(queue));
  } catch (err) {
    console.error(`Error saving queue for guild ${guildId}: ${err}`);
  }
};

const addSongsToQueue = (
  guildId: string,
  songs: Song[],
  options?: { isNewQueue?: boolean }
): void => {
  const queue = queues[guildId] || loadQueue(guildId);
  if (options?.isNewQueue) queue.lastAddedIndex = queue.songs.length;
  queue.songs.push(...songs);
  if (queue.lastAddedIndex >= queue.songs.length) queue.lastAddedIndex = -1;
  queues[guildId] = queue;
  saveQueue(guildId, queue);
};

const removeSongFromQueue = (guildId: string, index: number): Song => {
  const queue = queues[guildId] || loadQueue(guildId);
  const [song] = queue.songs.splice(index, 1);
  queues[guildId] = queue;
  saveQueue(guildId, queue);
  return song;
};

const clearQueue = (guildId: string): void => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.songs = [];
  queues[guildId] = queue;
  saveQueue(guildId, queue);
};

const getNextSongInQueue = (guildId: string): Song | undefined => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.lastAddedIndex += 1;
  const song = queue.songs[queue.lastAddedIndex];
  queues[guildId] = queue;
  saveQueue(guildId, queue);
  return song;
};

const getSong = (guildId: string, index: number): Song | undefined => {
  const queue = queues[guildId] || loadQueue(guildId);
  if (index < 0 || index >= queue.songs.length) return undefined;
  queue.lastAddedIndex = index;
  queues[guildId] = queue;
  return queue.songs[index];
};

const getQueue = (guildId: string): Queue =>
  queues[guildId] || loadQueue(guildId);

export {
  addSongsToQueue,
  removeSongFromQueue,
  getNextSongInQueue,
  getQueue,
  clearQueue,
  getSong,
};
