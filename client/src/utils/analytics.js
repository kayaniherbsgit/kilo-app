const BASE_URL = import.meta.env.VITE_API_URL;

const trackEvent = async (event, data = {}) => {
  try {
    await axios.post(`${BASE_URL}/api/analytics/track`, {
      event,
      data,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (err) {
    console.warn('Failed to track event:', event, err.message);
  }
};