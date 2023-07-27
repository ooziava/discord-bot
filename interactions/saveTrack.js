const fs = require("node:fs").promises;
const path = require("node:path");

module.exports = {
  async saveTrack(title, url, guildId) {
    const foldersPath = path.join(__dirname, "..", "queues");
    const filePath = path.join(foldersPath, `${guildId}.json`);
    let data = [];
    try {
      await fs.access(filePath);
      const oldData = await fs.readFile(filePath);
      if (oldData) {
        data = JSON.parse(oldData);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.mkdir(foldersPath, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data));
      } else {
        throw error;
      }
    }
    data.push({ title, url });
    await fs.writeFile(filePath, JSON.stringify(data));
  },
};
