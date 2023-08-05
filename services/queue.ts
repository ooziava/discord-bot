import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Song, type Queue } from "interfaces/discordjs";

const queues: { [key: string]: Queue } = {};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_QUEUE_LENGTH = 1000;

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

const saveQueue = (guildId: string, queue: Queue): boolean => {
  queue.songs = queue.songs.map((song, index) => ({ ...song, index }));
  queues[guildId] = queue;
  const filePath = path.join(__dirname, "../data", `${guildId}.json`);
  if (queue.songs.length > MAX_QUEUE_LENGTH) {
    queue.songs.splice(0, queue.songs.length - MAX_QUEUE_LENGTH);
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(queue));
    return true;
  } catch (err) {
    console.error(`Error saving queue for guild ${guildId}: ${err}`);
    return false;
  }
};

export const addSongsToQueue = (
  guildId: string,
  songs: Song[],
  options?: { isNewQueue?: boolean }
): Song => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.songs.push(...songs);
  saveQueue(guildId, queue);

  const index = queue.songs.length - songs.length;
  if (options?.isNewQueue) queue.lastAddedIndex = index;
  return queue.songs[index];
};

export const removeSongFromQueue = (
  guildId: string,
  index: number
): boolean => {
  const queue = queues[guildId] || loadQueue(guildId);
  if (queue.lastAddedIndex >= queue.songs.length) return false;
  else queue.lastAddedIndex -= 1;
  queue.songs.splice(index, 1);
  saveQueue(guildId, queue);
  return true;
};

export const getNextSongInQueue = (guildId: string): Song | null => {
  const queue = queues[guildId] || loadQueue(guildId);
  if (queue.lastAddedIndex + 1 >= queue.songs.length) return null;

  queue.lastAddedIndex += 1;
  const song = queue.songs[queue.lastAddedIndex];
  saveQueue(guildId, queue);
  return song;
};

export const getPrevSongInQueue = (guildId: string): Song | null => {
  const queue = queues[guildId] || loadQueue(guildId);
  if (queue.lastAddedIndex - 1 < 0) return null;

  queue.lastAddedIndex -= 1;
  const song = queue.songs[queue.lastAddedIndex];
  saveQueue(guildId, queue);
  return song;
};

export const getSong = (guildId: string, index: number): Song | null => {
  const queue = queues[guildId] || loadQueue(guildId);
  return queue.songs[index] || null;
};

export const setCurrentSong = (guildId: string, index: number): boolean => {
  const queue = queues[guildId] || loadQueue(guildId);
  if (index >= queue.songs.length || index < -1) return false;
  else queue.lastAddedIndex = index;

  saveQueue(guildId, queue);
  return true;
};

export const clearQueue = (guildId: string): boolean => {
  const queue = queues[guildId] || loadQueue(guildId);
  queue.songs = [];
  queue.lastAddedIndex = -1;
  queues[guildId] = queue;
  return saveQueue(guildId, queue);
};

export const getQueue = (guildId: string): Queue =>
  queues[guildId] || loadQueue(guildId);

export const getQueueLength = (guildId: string): number => {
  const queue = queues[guildId] || loadQueue(guildId);
  return queue.songs.length;
};

export const shuffleQueue = (guildId: string): Song => {
  const queue = queues[guildId] || loadQueue(guildId);
  const currentIndex = queue.lastAddedIndex;
  const currentSong = queue.songs[currentIndex];
  const songs = queue.songs.filter((_, index) => index !== currentIndex);
  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songs[i], songs[j]] = [songs[j], songs[i]];
  }
  songs.unshift(currentSong);
  songs.forEach((song, index) => {
    song.index = index;
  });
  queue.lastAddedIndex = 1;
  saveQueue(guildId, queue);
  return currentSong;
};
