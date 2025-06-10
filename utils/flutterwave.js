import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const flutterwave = axios.create({
  baseURL: 'https://api.flutterwave.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getFlutterwaveSecretKey = () => {
  const secretKey = process.env.FLUTTER_SECRET;
  if (!secretKey) {
    throw new Error("Flutterwave secret key not found in .env file. Please set FLUTTER_SECRET.");
  }
  return secretKey;
};

export const initializePayment = async (amount, currency, customer, txRef, meta) => {
  try {
    console.log('Fetched secret key successfully:', process.env.FLUTTER_SECRET);
    const requestData = {
      tx_ref: txRef,
      amount,
      currency,
      redirect_url: 'http://localhost:5000/api/payment/callback', // Corrected URL
      payment_options: 'card',
      customer,
      meta,
      customizations: {
        title: 'Course Enrollment',
        description: 'Payment for CodeFast course',
      },
    };
    console.log('Flutterwave payment request data:', requestData);
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      requestData,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTER_SECRET}`,
        },
      }
    );
    console.log('Flutterwave response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Flutterwave error:', error.response?.data || error.message);
    throw new Error(`Flutterwave payment initialization failed: ${error.response?.data?.message || error.message}`);
  }
};

export const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const secretKey = getFlutterwaveSecretKey();

    const response = await flutterwave.get(
      `/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    console.log('Flutterwave verification response:', response.data);
    return response.data.data.status === 'successful';
  } catch (error) {
    console.error('Error verifying payment:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    throw error;
  }
};