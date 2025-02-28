import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Box,
  CircularProgress,
  Grid,
  Fade,
  Grow,
  Collapse,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import from recharts for the visualization
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceLine
} from 'recharts';

const SentimentAnalyzer = () => {
  const [subreddit, setSubreddit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [animateChart, setAnimateChart] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const navigate = useNavigate();

  // Trigger animation when data loads
  useEffect(() => {
    if (data) {
      setAnimateChart(true);
      // Initialize expandedPosts state
      const initialExpandState = {};
      data.slice(0, 6).forEach((_, index) => {
        initialExpandState[index] = false;
      });
      setExpandedPosts(initialExpandState);
    }
  }, [data]);

  const analyzeSentiment = async () => {
    if (!subreddit) {
      setError('Please enter a subreddit name');
      return;
    }

    setLoading(true);
    setError('');
    setAnimateChart(false);

    try {
      const response = await fetch(`http://127.0.0.1:5000/sentiment?subreddit=${subreddit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to analyze sentiment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentData = () => {
    if (!data) return [];
    
    const counts = {
      Positive: 0,
      Neutral: 0,
      Negative: 0
    };
    
    data.forEach(post => {
      counts[post.Sentiment]++;
    });

    return [
      { name: 'Positive', value: counts.Positive, color: '#4CAF50' },
      { name: 'Neutral', value: counts.Neutral, color: '#FFC107' },
      { name: 'Negative', value: counts.Negative, color: '#F44336' }
    ];
  };

  const getChartData = () => {
    const sentimentData = getSentimentData();
    // Format data for the line chart
    return [
      { sentiment: 'Positive', count: sentimentData[0].value },
      { sentiment: 'Neutral', count: sentimentData[1].value },
      { sentiment: 'Negative', count: sentimentData[2].value }
    ];
  };

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'Positive':
        return <SentimentSatisfiedAltIcon sx={{ color: '#4CAF50' }} />;
      case 'Neutral':
        return <SentimentNeutralIcon sx={{ color: '#FFC107' }} />;
      case 'Negative':
        return <SentimentVeryDissatisfiedIcon sx={{ color: '#F44336' }} />;
      default:
        return null;
    }
  };

  const getOverallSentiment = () => {
    if (!data) return null;
    
    const counts = {
      Positive: 0,
      Neutral: 0,
      Negative: 0
    };
    
    data.forEach(post => {
      counts[post.Sentiment]++;
    });
    
    const max = Math.max(...Object.values(counts));
    const dominant = Object.keys(counts).find(key => counts[key] === max);
    
    return {
      sentiment: dominant,
      icon: getSentimentIcon(dominant),
      percentage: Math.round((counts[dominant] / data.length) * 100)
    };
  };

  const toggleExpand = (index) => {
    setExpandedPosts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, boxShadow: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {payload[0].value} posts ({Math.round((payload[0].value / data.length) * 100)}%)
          </Typography>
        </Card>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, borderBottom: '1px solid #eaeaea', pb: 2 }}>
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h1" fontWeight="bold">
              Reddit Sentiment Analysis
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 4, 
            justifyContent: 'center',
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2
          }}>
            <TextField
              fullWidth
              placeholder="Enter subreddit name..."
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              sx={{ maxWidth: '600px' }}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  analyzeSentiment();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={analyzeSentiment}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ textAlign: 'center', my: 8 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>
                Analyzing r/{subreddit}...
              </Typography>
            </Box>
          )}

          {data && (
            <Fade in={true} timeout={500}>
              <Box>
                <Grid container spacing={3}>
                  {/* Summary Card */}
                  <Grid item xs={12} md={4}>
                    <Grow in={animateChart} timeout={800}>
                      <Card sx={{ height: '100%', boxShadow: 2 }}>
                        <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <Typography variant="h6" gutterBottom>
                            Overall Sentiment
                          </Typography>
                          <Box sx={{ fontSize: '72px', my: 2 }}>
                            {getOverallSentiment().icon}
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 
                            getOverallSentiment().sentiment === 'Positive' ? '#4CAF50' : 
                            getOverallSentiment().sentiment === 'Neutral' ? '#FFC107' : '#F44336'
                          }}>
                            {getOverallSentiment().sentiment}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {getOverallSentiment().percentage}% of posts
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Based on analysis of {data.length} posts
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>

                  {/* Chart Card - Using an improved line chart */}
                  <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sentiment Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                              data={getChartData()} 
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="sentiment" 
                                tick={{ fill: '#666' }}
                                tickLine={{ stroke: '#666' }}
                              />
                              <YAxis>
                                <Label 
                                  value="Number of Posts" 
                                  angle={-90} 
                                  position="insideLeft" 
                                  style={{ textAnchor: 'middle', fill: '#666' }}
                                />
                              </YAxis>
                              <Tooltip content={<CustomTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#1976d2" 
                                strokeWidth={3}
                                dot={{ r: 7, fill: '#1976d2', strokeWidth: 2 }}
                                activeDot={{ r: 9, fill: '#1976d2', stroke: '#fff', strokeWidth: 2 }}
                                isAnimationActive={animateChart}
                                animationBegin={0}
                                animationDuration={1500}
                              />
                              <ReferenceLine 
                                y={data.length / 3} 
                                stroke="#666" 
                                strokeDasharray="3 3" 
                                label={{ 
                                  value: 'Average', 
                                  position: 'right', 
                                  fill: '#666' 
                                }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        {/* Legend with explanation */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Box sx={{ display: 'flex', gap: 4 }}>
                            {getSentimentData().map((item, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: item.color, mr: 1 }} />
                                <Typography variant="body2">
                                  {item.name}: {item.value} posts
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Recent Posts Section - Now with expandable content */}
                  <Grid item xs={12}>
                    <Card sx={{ boxShadow: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <MessageIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">Recent Posts</Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          {data.slice(0, 6).map((post, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                              <Grow
                                in={true}
                                style={{ transformOrigin: '0 0 0' }}
                                timeout={500 + (index * 100)}
                              >
                                <Card 
                                  variant="outlined" 
                                  sx={{ 
                                    height: '100%',
                                    borderLeft: `4px solid ${
                                      post.Sentiment === 'Positive' ? '#4CAF50' :
                                      post.Sentiment === 'Negative' ? '#F44336' : '#FFC107'
                                    }`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: 3
                                    }
                                  }}
                                >
                                  <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Typography 
                                        variant="body1" 
                                        gutterBottom 
                                        sx={{ 
                                          fontWeight: 'medium',
                                          overflow: expandedPosts[index] ? 'visible' : 'hidden',
                                          textOverflow: expandedPosts[index] ? 'clip' : 'ellipsis',
                                          whiteSpace: expandedPosts[index] ? 'normal' : 'nowrap',
                                          cursor: 'pointer'
                                        }}
                                        onClick={() => toggleExpand(index)}
                                      >
                                        {post.Title}
                                      </Typography>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => toggleExpand(index)}
                                        sx={{ ml: 1, flexShrink: 0 }}
                                      >
                                        {expandedPosts[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                      </IconButton>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                      {getSentimentIcon(post.Sentiment)}
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          ml: 1,
                                          color: 
                                            post.Sentiment === 'Positive' ? 'success.main' :
                                            post.Sentiment === 'Negative' ? 'error.main' : 'warning.main'
                                        }}
                                      >
                                        {post.Sentiment}
                                      </Typography>
                                    </Box>

                                    <Collapse in={expandedPosts[index]} timeout="auto" unmountOnExit>
                                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                          {post.Content || post.Text || "No content available"}
                                        </Typography>
                                      </Box>
                                    </Collapse>
                                  </CardContent>
                                </Card>
                              </Grow>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                
                
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SentimentAnalyzer;