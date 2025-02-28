import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { motion } from 'framer-motion';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Chip from '@mui/material/Chip';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function ExpandedDashboard() {
  const [searchText, setSearchText] = useState('');
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showConfidenceAnimate, setShowConfidenceAnimate] = useState(false);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handlePredict = async () => {
    if (!searchText.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction('');
    setConfidence('');
    setShowConfidenceAnimate(false);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: searchText }),
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setConfidence(data.confidence);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const newSearches = [{ text: searchText, prediction: data.prediction, confidence: data.confidence }, ...prev];
        return newSearches.slice(0, 5); // Keep only last 5 searches
      });
      
      // Delay confidence animation to create a sequence
      setTimeout(() => {
        setShowConfidenceAnimate(true);
      }, 800);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get a response from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (pred) => {
    switch(pred) {
      case 'Entailment': return '#4caf50'; // Green
      case 'Contradiction': return '#f44336'; // Red
      case 'Neutral': return '#ff9800'; // Orange
      default: return '#757575'; // Grey
    }
  };

  const getPredictionIcon = (pred) => {
    switch(pred) {
      case 'Entailment': return <VerifiedIcon />;
      case 'Contradiction': return <CancelIcon />;
      case 'Neutral': return <HelpOutlineIcon />;
      default: return null;
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handlePredict();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Main Analysis Card */}
        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ 
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            backgroundColor: '#1e1e1e', 
            color: '#fff', 
            borderRadius: 2, 
            boxShadow: 3,
            overflow: 'hidden'
          }}>      
            <CardContent sx={{ px: 4, py: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FactCheckIcon sx={{ mr: 1.5, color: '#00bcd4', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Fact Checker
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, maxWidth: '80%', lineHeight: 1.6 }}>
                Enter a statement to analyze its factual validity. Our AI model will classify it as Entailment (supported by facts), Contradiction (opposed by facts), or Neutral.
              </Typography>

              {/* Search Bar */}
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  placeholder="Enter statement to check..."
                  variant="outlined"
                  multiline
                  rows={3}
                  value={searchText}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  sx={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#555' },
                      '&:hover fieldset': { borderColor: '#777' },
                      '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handlePredict}
                  disabled={loading}
                  sx={{
                    ml: 2,
                    minWidth: '56px',
                    height: '56px',
                    backgroundColor: '#00bcd4',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#0097a7' },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                </Button>
              </Box>

              {error && (
                <Fade in={!!error}>
                  <Alert severity="error" sx={{ mb: 3, backgroundColor: '#300', color: '#fff', '& .MuiAlert-icon': { color: '#f44336' } }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Animated Prediction Output */}
              {prediction && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ mb: 3, backgroundColor: '#2a2a2a', color: '#fff', overflow: 'hidden' }}>
                    <CardContent sx={{ p: 0 }}>
                      {/* Header with prediction type */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          backgroundColor: getPredictionColor(prediction),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Animated background bars */}
                        <Box sx={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.2 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                              key={i}
                              style={{
                                position: 'absolute',
                                left: `${i * 20}%`,
                                top: 0,
                                bottom: 0,
                                width: '10%',
                                backgroundColor: 'white',
                                opacity: 0.2
                              }}
                              animate={{ 
                                height: ['0%', '100%', '0%'],
                                top: ['100%', '0%', '100%']
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 3,
                                delay: i * 0.4,
                                ease: 'easeInOut'
                              }}
                            />
                          ))}
                        </Box>

                        {/* Icon and Text */}
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: 'spring',
                              stiffness: 260,
                              damping: 20,
                              delay: 0.3
                            }}
                          >
                            {getPredictionIcon(prediction)}
                          </motion.div>
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {prediction}
                        </Typography>
                      </Box>
                      
                      {/* Details section */}
                      <Box sx={{ p: 3 }}>
                        {/* Statement */}
                        <Typography variant="body2" color="#aaa" gutterBottom>YOUR STATEMENT</Typography>
                        <Typography variant="body1" sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1, fontStyle: 'italic' }}>
                          "{searchText}"
                        </Typography>
                        
                        {/* Confidence meter */}
                        <Typography variant="body2" color="#aaa" gutterBottom>CONFIDENCE LEVEL</Typography>
                        <Box sx={{ mb: 1, mt: 1, height: 24, position: 'relative', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                              height: '100%',
                              backgroundColor: getPredictionColor(prediction),
                              borderRadius: 4
                            }}
                          />
                          {showConfidenceAnimate && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                position: 'absolute', 
                                right: 8, 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                fontWeight: 'bold'
                              }}
                            >
                              {(confidence * 100).toFixed(1)}%
                            </Typography>
                          )}
                        </Box>

                        {/* Explanation */}
                        <Grow in={showConfidenceAnimate} timeout={1000}>
                          <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', color: '#aaa', lineHeight: 1.6 }}>
                            {prediction === 'Entailment' && 'Our analysis indicates this statement is supported by factual evidence. The model has detected patterns consistent with verified information.'}
                            {prediction === 'Contradiction' && 'Our analysis indicates this statement contradicts established facts. The model has identified elements that conflict with verified information.'}
                            {prediction === 'Neutral' && 'Our analysis could not definitively determine the factual nature of this statement. The model found elements that neither clearly support nor contradict it.'}
                          </Typography>
                        </Grow>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Placeholder when no results */}
              {!prediction && !loading && !error && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 200, 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: 2,
                  p: 3
                }}>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <SearchIcon sx={{ fontSize: 40, color: '#555', mb: 2 }} />
                  </motion.div>
                  <Typography variant="body1" align="center" sx={{ color: '#aaa' }}>
                    Enter a statement above and click the search button to analyze
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Side Panel */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ 
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            backgroundColor: '#1e1e1e', 
            color: '#fff', 
            borderRadius: 2, 
            boxShadow: 3,
            overflow: 'hidden'
          }}>
            <CardMedia
              component="img"
              alt="Word Cloud"
              height="180"
              image="/images/Enter Image Text.png"
              sx={{ objectFit: 'cover' }}
            />
            
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ display: 'inline-flex', marginRight: 8 }}
                >
                  <FactCheckIcon fontSize="small" sx={{ color: '#00bcd4' }} />
                </motion.div>
                Recent Analyses
              </Typography>
              
              <Box sx={{ mb: 3, overflow: 'auto', flexGrow: 1 }}>
                {recentSearches.length > 0 ? (
                  recentSearches.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          mb: 2, 
                          backgroundColor: '#2a2a2a', 
                          color: '#fff',
                          borderLeft: `4px solid ${getPredictionColor(item.prediction)}`
                        }}
                      >
                        <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4, maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{item.text.length > 60 ? `${item.text.substring(0, 60)}...` : item.text}"
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              icon={getPredictionIcon(item.prediction)}
                              label={item.prediction}
                              size="small"
                              sx={{ 
                                backgroundColor: `${getPredictionColor(item.prediction)}20`,
                                color: getPredictionColor(item.prediction),
                                fontWeight: 'bold',
                                '& .MuiChip-icon': {
                                  color: getPredictionColor(item.prediction)
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#aaa' }}>
                              {(item.confidence * 100).toFixed(0)}% confidence
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    borderRadius: 1, 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="body2" color="#aaa" sx={{ fontStyle: 'italic', mb: 1 }}>
                      No recent analyses yet
                    </Typography>
                    <Typography variant="body2" color="#777" sx={{ fontSize: '0.75rem' }}>
                      Your searches will appear here
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              
              <Box>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Understanding Results
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Entailment', color: '#4caf50', desc: 'Statement supported by facts', icon: <VerifiedIcon /> },
                    { label: 'Contradiction', color: '#f44336', desc: 'Statement conflicts with facts', icon: <CancelIcon /> },
                    { label: 'Neutral', color: '#ff9800', desc: 'Factual relationship uncertain', icon: <HelpOutlineIcon /> }
                  ].map((item, i) => (
                    <Grid item xs={12} key={i}>
                      <Box sx={{ 
                        display: 'flex', 
                        p: 1.5, 
                        backgroundColor: `${item.color}10`, 
                        borderRadius: 1,
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{ 
                          mr: 1.5, 
                          color: item.color,
                          display: 'flex'
                        }}>
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: item.color, fontWeight: 'bold' }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.75rem' }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}