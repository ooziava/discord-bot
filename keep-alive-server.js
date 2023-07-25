const e = require("express");
const s = e();
s.all("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(
    `<html><head> <link href="https://fonts.googleapis.com/css?family=Roboto Condensed" rel="stylesheet"> <style>body{font-family: "Roboto Condensed"; font-size: 21px; color: white; background-color: #23272A; margin-left: 5%; margin-top: 2%;}a{color: #5865F2}a:hover{color: #818bff}h1{font-size: 48px;}</style></head><body> <h1>Hosting Active</h1> <p>This Bot is the Repository from <a href="https://github.com/Tomato6966/discord-js-lavalink-Music-Bot-erela-js/" target="_blank"> Tomato#6966's Public Lava Music </a> <br/><br/> Check it out and make sure to <b>credit him / <a href="https://milrato.dev">Milrato Development</a></b> in the Bot, if you want to use this Code! <br/><br/> <a href="https://discord.gg/milrato"> <img src="https://discord.com/api/guilds/773668217163218944/widget.png?style=banner2"> </a><br/><br/><i>Make sure to add the repl.co URL to some sort of <a href="https://uptimerobot.com/">UPTIMER LINK SYSTEM</a></i></p></body></html>`
  );
  res.end();
});
function k() {
  s.listen(3000, () => {
    console.log(
      "24/7 Keepalive Server is online! Make sure to add the Replit.co URL to an Uptimer System"
        .bgGreen.white
    );
  });
}
module.exports = k;
