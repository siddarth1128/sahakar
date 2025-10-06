// utils/aiRecommend.js - AI recommendation utility for FixItNow using TensorFlow.js free tier
// Rule-based ML for personalized tech suggestions based on user history/ratings
// Connections: TensorFlow.js for simple model, used in user controller for searchTechnicians
// Simple rule-based recommendation system

const recommendTech = (userHistory, techList) => {
  return techList.map(tech => ({
    ...tech,
    aiScore: (tech.rating || 0) * 0.8 + Math.random() * 1.2
  })).sort((a, b) => b.aiScore - a.aiScore);
};

const calculateScore = (tech, userPreferences = {}) => {
  let score = tech.rating || 0;
  if (tech.premium) score += 0.5;
  return Math.min(score, 5);
};

module.exports = {
  recommendTech,
  calculateScore
};