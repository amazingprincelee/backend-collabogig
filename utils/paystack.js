import axios from 'axios';
import { config } from 'dotenv';
config();

const getPaystackSecretKey = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Paystack secret key not found in .env file. Please set PAYSTACK_SECRET_KEY.');
  }
  return secretKey;
};

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${getPaystackSecretKey()}`,
    'Content-Type': 'application/json',
  },
});

export const initializePaystackPayment = async (amount, currency, customer, reference, meta) => {
  try {
    const requestData = {
      email: customer.email,
      amount: amount * 100, // Convert to kobo
      currency,
      reference,
      metadata: meta,
      callback_url: `${process.env.FRONTEND_URL}/payment-status`,
    };
    const response = await paystack.post('/transaction/initialize', requestData);
    if (!response.data.status) {
      throw new Error(response.data.message || 'Paystack payment initialization failed');
    }
    return response.data;
  } catch (error) {
    console.error('Paystack payment initialization error:', error.response?.data || error.message);
    throw new Error(`Paystack payment initialization failed: ${error.response?.data?.message || error.message}`);
  }
};

export const verifyPaystackPayment = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    if (!response.data.status || response.data.data.status !== 'success') {
      throw new Error(response.data.message || 'Paystack transaction not successful');
    }
    return response.data.data;
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`);
  }
};