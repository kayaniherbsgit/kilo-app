const trackEvent = async (event, data = {}) => {
  try {
    await axios.post('http://localhost:5000/api/analytics/track', {
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
