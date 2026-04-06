require('dotenv').config();

const express = require('express');
const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits } = require('discord.js');

// ===== EXPRESS SERVER (for Render port) =====
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// ===== CONFIG =====
const config = {
  mc: {
    host: 'donutsmp.net',
    port: 19135,
    username: 'avaneeshritesh4@gmail.com',
    auth: 'microsoft'
  },
  discord: {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID
  }
};

let bot;

// ===== MINECRAFT BOT =====
function createBot() {
  bot = mineflayer.createBot(config.mc);

  bot.on('spawn', () => {
    console.log('✅ Minecraft bot connected');

    setInterval(() => {
      if (!bot.entity) return;
      bot.look(Math.random() * Math.PI * 2, 0);
    }, 10000);
  });

  bot.on('end', () => {
    console.log('❌ Disconnected. Reconnecting...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => console.log(err));
}

createBot();

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== config.discord.channelId) return;

  const args = message.content.split(' ');
  const cmd = args[0].toLowerCase();

  if (!bot || !bot.entity) {
    message.reply('❌ Minecraft bot not connected');
    return;
  }

  if (cmd === '!say') {
    const text = args.slice(1).join(' ');
    bot.chat(text);
    message.reply(`Sent: ${text}`);
  }

  else if (cmd === '!jump') {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    message.reply('Jumped');
  }

  else if (cmd === '!forward') {
    bot.setControlState('forward', true);
    setTimeout(() => bot.setControlState('forward', false), 2000);
    message.reply('Moving forward');
  }

  else if (cmd === '!look') {
    bot.look(Math.random() * Math.PI * 2, 0);
    message.reply('Looking around');
  }

  else if (cmd === '!stop') {
    bot.clearControlStates();
    message.reply('Stopped');
  }

  else if (cmd === '!status') {
    message.reply(`Online: ${!!bot.entity}`);
  }

  else {
    message.reply('Unknown command');
  }
});

client.login(config.discord.token);
