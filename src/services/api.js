const API_BASE_URL = "http://localhost:5000"; // Change to your backend URL

export const fetchSentimentData = async (subreddit) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze?subreddit=${subreddit}`);
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
