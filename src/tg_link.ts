import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN!;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN missing in .env');

const bot = new TelegramBot(token, { polling: true });

console.log('↪️  Send any message to your bot in Telegram now (DM it).');

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  console.log(`✅ Your TELEGRAM_CHAT_ID: ${chatId}`);
  await bot.sendMessage(chatId, `Linked ✅  (chat_id = ${chatId})`);
});
