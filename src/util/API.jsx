const BASE_URL = 'https://www.geniushomehelp.com/api';
const LOCAL = 'https://q4rxnp3k-44307.inc1.devtunnels.ms/api';

const API = {
     SEND_OTP: `${BASE_URL}/Auth/send-otp`,
     VERIFY_OTP: `${BASE_URL}/Auth/verify-otp`,
     REGISTER_PARTNER: `${BASE_URL}/Partner/Register`,
     UPLOAD_PARTNER_DOCUMENT: `${BASE_URL}/Partner/Document`,
     PARTNER_DOCUMENTS: `${BASE_URL}/Partner/Documents`,
     PARTNER_PROFILE: `${BASE_URL}/Partner/Profile`,
     UPDATE_PARTNER_DOCUMENT: (documentId) =>
        `${BASE_URL}/Partner/Document/${documentId}`,


     PARTNER_SKILL: `${BASE_URL}/ServiceCategory/partner/map-service-categories`,

     SERVICE_CATEGORY_DROPDOWN: `${BASE_URL}/ServiceCategory/dropdown`,

     SERVICE_CATEGORY_MAPPING: `${BASE_URL}/ServiceCategory/partner/map-service-categories`,
};

// Add more endpoints here as needed


export default API;