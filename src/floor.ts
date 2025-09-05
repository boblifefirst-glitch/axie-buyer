import 'cross-fetch/polyfill';
import dotenv from 'dotenv';
dotenv.config();
import { ethers } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';

const AXIE_CLASS = (process.env.AXIE_CLASS || 'beast').toUpperCase();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
const CHAT_ID = Number(process.env.TELEGRAM_CHAT_ID);

const GQL = 'https://graphql-gateway.axieinfinity.com/graphql';

const QUERY = `
query GetAxies($criteria: AxiesSortFilter!) {
  axies(criteria: $criteria, from: 0, size: 1) {
    total
    results {
      id
      class
      auction {
        currentPrice
        listingIndex
      }
    }
  }
}`;

async function fetchFloor() {
  const body = {
    operationName: 'GetAxies',
    variables: {
      criteria: {
        classes: [AXIE_CLASS],
        sort: 'PriceAsc',
        auctionTypes: ['Sale'],
        onSaleOnly: true
      }
    },
    query: QUERY
  };

  const r = await fetch(GQL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!r.ok) throw new Error(`GQL ${r.status}`);
  const j = await r.json();
  const ax = j?.data?.axies?.results?.[0];
  if (!ax?.auction?.currentPrice) return null;

  // ethers v6: use bigint + ethers.formatEther
  const wei = BigInt(ax.auction.currentPrice);
  const eth = Number(ethers.formatEther(wei));
  return { id: ax.id, eth, wei: wei.toString() };
}

(async () => {
  try {
    const floor = await fetchFloor();
    if (!floor) {
      console.log('No floor found');
      await bot.sendMessage(CHAT_ID, `⚠️ No ${AXIE_CLASS} floor found right now.`);
      return;
    }
    const msg =
      `📉 Floor for ${AXIE_CLASS}\n` +
      `• Axie #${floor.id}\n` +
      `• Price: ${floor.eth.toFixed(6)} ETH\n` +
      `• Link: https://app.axieinfinity.com/marketplace/axies/${floor.id}`;
    console.log(msg);
    await bot.sendMessage(CHAT_ID, msg);
  } catch (e:any) {
    console.error('Error:', e?.message || e);
    await bot.sendMessage(CHAT_ID, `⚠️ Floor fetch error: ${e?.message || e}`);
  }
})();
