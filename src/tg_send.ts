import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const chatId = Number(process.env.TELEGRAM_CHAT_ID);
const bot = new TelegramBot(token, { polling: false });

(async () => {
  await bot.sendMessage(chatId, '👋 Axie buyer: Telegram linked and ready.');
  console.log('Sent test message ✅');
})();
