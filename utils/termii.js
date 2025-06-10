import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com';

export const TERMII_CONFIG = {
    API_KEY: process.env.TERMII_API_KEY,
    SECRET_KEY: process.env.TERMII_SECRET_KEY,
    BASE_URL: baseUrl,
    SENDER_ID: 'MobileRuns'
};



export const sendTermiiMessage = async (phone, message, channel = 'generic', isToken = true) => {
    try {
        if (!TERMII_CONFIG.API_KEY) {
            throw new Error('TERMII_API_KEY is not defined in environment variables');
        }

        let endpoint = '';
        let payload = {};

        // Always use OTP endpoint for verification codes (token-based login only)
        if (isToken) {
            switch (channel) {
                case 'whatsapp':
                    endpoint = 'https://v3.api.termii.com/whatsapp/otp/send';
                    payload = {
                        api_key: TERMII_CONFIG.API_KEY,
                        message_type: 'NUMERIC',
                        to: phone,
                        from: TERMII_CONFIG.SENDER_ID,
                        channel: 'whatsapp',
                        pin_attempts: 5,
                        pin_time_to_live: 5,
                        pin_length: 4,
                        pin_placeholder: '< 1234 >',
                        message_text: message,
                        pin_type: 'NUMERIC'
                    };
                    break;
                case 'voice':
                    endpoint = 'https://v3.api.termii.com/api/sms/otp/call';
                    payload = {
                        api_key: TERMII_CONFIG.API_KEY,
                        phone_number: phone,
                        code: message
                    };
                    break;
                case 'generic':
                case 'dnd':
                default:
                    endpoint = 'https://v3.api.termii.com/api/sms/otp/send';
                    payload = {
                        api_key: TERMII_CONFIG.API_KEY,
                        message_type: 'NUMERIC',
                        to: phone,
                        from: TERMII_CONFIG.SENDER_ID,
                        channel: channel, // Use the provided channel (generic or dnd)
                        pin_attempts: 5,
                        pin_time_to_live: 5,
                        pin_length: 4,
                        pin_placeholder: '< 1234 >',
                        message_text: message,
                        pin_type: 'NUMERIC'
                    };
                    break;
            }
        } else {
            throw new Error('Only token-based login is allowed.');
        }

        console.log('Sending request to:', endpoint, 'with payload:', payload); // Debug payload

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Failed to send ${channel} message`);
        }

        console.log('Response from Termii:', data); // Debug response

        return data;
    } catch (error) {
        console.error(`Termii ${channel} Error:`, error);
        throw error;
    }
};

// Alias for backward compatibility
export const sendTermiiSMS = (phone, message) => sendTermiiMessage(phone, message, 'generic');