import * as React from 'react';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

export default function ImgMediaCard() {
  const [searchText, setSearchText] = useState('');
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState('');

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handlePredict = async () => {
    if (!searchText.trim()) {
      alert('Please enter some text.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: searchText }),
      });

      const data = await response.json();
      setPrediction(data.prediction);
      setConfidence(data.confidence);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get a response from the server.');
    }
  };

  return (
    <Card sx={{ maxWidth: 345, p: 2 }}>      
      {/* Image */}
      <CardMedia
        component="img"
        alt="Text Image"
        height="140"
        image="/images/Enter Image Text.png"
      />
      {/* Card Content */}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Enter Text
        </Typography>
      </CardContent>
      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Search News"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearchChange}
        />
      </Box>

      {/* Actions */}
      <CardActions>
        <Button size="small" onClick={handlePredict}>
          Predict
        </Button>
      </CardActions>

      {/* Prediction Output */}
      {prediction && (
        <CardContent>
          <Typography variant="body1"><strong>Prediction:</strong> {prediction}</Typography>
          <Typography variant="body1"><strong>Confidence:</strong> {confidence}</Typography>
        </CardContent>
      )}
    </Card>
  );
}
