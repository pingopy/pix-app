import fetch from 'node-fetch';

const BASE_URL = 'https://public-api.paggpix.com';
const TOKEN = process.env.API_TOKEN;
const CNPJ = process.env.CNPJ;

function handle(res) {
  if (!res.ok) throw new Error(`PaggPix error: ${res.statusText}`);
  return res.json();
}

export default {
  createPayment: async ({ value, description }) => {
    const body = {
      cnpj: CNPJ,
      value: Number(value).toFixed(2),
      description
    };
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify(body)
    });
    return handle(res);
  },

  getPayment: async (id) => {
    const res = await fetch(`${BASE_URL}/payments/${id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return handle(res);
  }
};
