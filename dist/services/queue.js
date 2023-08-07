import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const queues = {};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_QUEUE_LENGTH = 1000;
const loadQueue = (guildId) => {
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    const filePath = path.join(dataDir, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ songs: [], currentSongId: -1 }));
        return { songs: [], currentSongId: -1 };
    }
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    }
    catch (err) {
        console.error(`Error loading queue for guild ${guildId}: ${err}`);
        return { songs: [], currentSongId: -1 };
    }
};
const saveQueue = (guildId, queue) => {
    queue.songs = queue.songs.map((song, index) => ({ ...song, index }));
    queues[guildId] = queue;
    const filePath = path.join(__dirname, "../data", `${guildId}.json`);
    if (queue.songs.length > MAX_QUEUE_LENGTH) {
        queue.songs.splice(0, queue.songs.length - MAX_QUEUE_LENGTH);
    }
    try {
        fs.writeFileSync(filePath, JSON.stringify(queue));
        return true;
    }
    catch (err) {
        console.error(`Error saving queue for guild ${guildId}: ${err}`);
        return false;
    }
};
export const addSongsToQueue = (guildId, songs, options) => {
    const queue = queues[guildId] || loadQueue(guildId);
    queue.songs.push(...songs);
    saveQueue(guildId, queue);
    const index = queue.songs.length - songs.length;
    if (options?.isNewQueue)
        queue.currentSongId = index;
    return queue.songs[index];
};
export const removeSong = (guildId, index) => {
    const queue = queues[guildId] || loadQueue(guildId);
    if (queue.currentSongId >= queue.songs.length)
        return false;
    else
        queue.currentSongId -= 1;
    queue.songs.splice(index, 1);
    saveQueue(guildId, queue);
    return true;
};
export const getNextSong = (guildId) => {
    const queue = queues[guildId] || loadQueue(guildId);
    if (queue.currentSongId + 1 >= queue.songs.length)
        return null;
    queue.currentSongId += 1;
    const song = queue.songs[queue.currentSongId];
    saveQueue(guildId, queue);
    return song;
};
export const getPrevSong = (guildId) => {
    const queue = queues[guildId] || loadQueue(guildId);
    if (queue.currentSongId - 1 < 0)
        return null;
    queue.currentSongId -= 1;
    const song = queue.songs[queue.currentSongId];
    saveQueue(guildId, queue);
    return song;
};
export const getSongByIndex = (guildId, index) => {
    const queue = queues[guildId] || loadQueue(guildId);
    return queue.songs[index] || null;
};
export const findSong = (guildId, query) => {
    const queue = queues[guildId] || loadQueue(guildId);
    const index = queue.songs.findIndex((song) => song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.url.toLowerCase().includes(query.toLowerCase()));
    return index === -1 ? null : queue.songs[index];
};
export const setCurrentSong = (guildId, index) => {
    const queue = queues[guildId] || loadQueue(guildId);
    if (index > queue.songs.length || index < -1)
        return false;
    else
        queue.currentSongId = index;
    saveQueue(guildId, queue);
    return true;
};
export const clearQueue = (guildId) => {
    const queue = queues[guildId] || loadQueue(guildId);
    queue.songs = [];
    queue.currentSongId = -1;
    queues[guildId] = queue;
    return saveQueue(guildId, queue);
};
export const getQueue = (guildId) => queues[guildId] || loadQueue(guildId);
export const getQueueLength = (guildId) => {
    const queue = queues[guildId] || loadQueue(guildId);
    return queue.songs.length;
};
export const shuffleQueue = (guildId) => {
    const queue = queues[guildId] || loadQueue(guildId);
    const currentIndex = queue.currentSongId;
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
    queue.songs = songs;
    queue.currentSongId = 0;
    saveQueue(guildId, queue);
    return currentSong;
};
