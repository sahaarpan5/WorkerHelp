const BASE_URL = 'https://www.geniushomehelp.com/api';

const API = {
     SEND_OTP: `${BASE_URL}/Auth/send-otp`,
     VERIFY_OTP: `${BASE_URL}/Auth/verify-otp`,
     REGISTER_PARTNER: `${BASE_URL}/Partner/Register`,
      UPLOAD_PARTNER_DOCUMENT: `${BASE_URL}/Partner/Document`,
       PARTNER_DOCUMENTS: `${BASE_URL}/Partner/Documents`,
};

// Add more endpoints here as needed


export default API;