import React, { useState } from "react";
import { Box, TextField, Button, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import { fetchSentimentData } from "../services/api";

const SentimentAnalyzer = () => {
  const [subreddit, setSubreddit] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchSentimentData(subreddit);
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: 3, textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        Reddit Sentiment Analysis
      </Typography>
      <TextField
        label="Enter Subreddit"
        variant="outlined"
        value={subreddit}
        onChange={(e) => setSubreddit(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleFetchData} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Analyze"}
      </Button>

      {data && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Sentiment Breakdown</Typography>
          <Chart
            type="pie"
            options={{
              labels: ["Positive", "Negative", "Neutral"],
              colors: ["#4CAF50", "#F44336", "#FFC107"],
            }}
            series={[data.positive, data.negative, data.neutral]}
            width="380"
          />
        </Box>
      )}
    </Box>
  );
};

export default SentimentAnalyzer;
