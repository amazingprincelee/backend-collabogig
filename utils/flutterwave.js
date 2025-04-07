import axios from "axios";
import Configuration from "../models/payment.js";  // Import the Configuration model

// Create an Axios instance with the base URL for Flutterwave API
const flutterwave = axios.create({
  baseURL: 'https://api.flutterwave.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch the Flutterwave secret key directly from the database
const getFlutterwaveSecretKey = async () => {
  try {
    // Fetch the configuration from the database
    const config = await Configuration.findOne();

    if (!config || !config.flutterwaveKeys || !config.flutterwaveKeys.secretKey) {
      throw new Error("Flutterwave secret key not found in database");
    }

    return config.flutterwaveKeys.secretKey;
  } catch (error) {
    console.error("Error fetching Flutterwave secret key from database:", error);
    throw error; // Rethrow the error for handling by the caller
  }
};

// Function to initialize the payment
export const initializePayment = async (amount, currency) => {
  try {
    // Fetch the Flutterwave secret key from the database
    const secretKey = await getFlutterwaveSecretKey();

    // Set up payment data
    const data = {
      tx_ref: `phylee_${Date.now()}`,  // Unique transaction reference
      amount,
      currency,
      redirect_url: "https://your-redirect-url.com",  // Replace with your redirect URL
      payment_options: "card",
    };

    // Make the request to Flutterwave API
    const response = await flutterwave.post(
      "/v3/payments",
      data,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    return response.data;
  } catch (error) {
    console.error("Error during payment initialization:", error);
    throw error;  // Rethrow the error for handling by the caller
  }
};

// Function to verify the Flutterwave payment
export const verifyFlutterwavePayment = async (transactionId) => {
  try {
    // Fetch the Flutterwave secret key from the database
    const secretKey = await getFlutterwaveSecretKey();

    // Make the request to Flutterwave API for verification
    const response = await flutterwave.get(
      `/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    // Check the payment status
    return response.data.data.status === "successful";
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;  // Rethrow the error for handling by the caller
  }
};
