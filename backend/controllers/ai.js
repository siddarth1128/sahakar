// controllers/ai.js - AI utilities: recommendations and cost estimate (stubs with smart heuristics)
const mongoose = require('mongoose');
const Technician = require('../models/Technician');
const Booking = require('../models/Job'); // existing job/booking model named Job in this codebase

// Haversine distance helper
function distanceKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/ai/recommendations?lat=&lng=&problem=&limit=
exports.getRecommendations = async (req, res) => {
  try {
    const { lat, lng, problem = '', limit = 8 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, msg: 'lat,lng required' });

    // Find completed/visible technicians (profile complete) nearby
    // Fallback if Technician model not present
    const TechModel = Technician || mongoose.model('Technician');

    const center = [Number(lng), Number(lat)];
    const maxDistance = 30000; // 30km default

    const techs = await TechModel.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: center }, $maxDistance: maxDistance } },
      $or: [
        { services: { $regex: problem, $options: 'i' } },
        { certifications: { $regex: problem, $options: 'i' } },
      ],
      profileComplete: { $ne: false }
    })
      .select('userId services certifications location ecoFriendly rating premium name')
      .limit(Number(limit) * 3); // over-fetch for ranking

    // Rank: distance + (rating weight) + ecoFriendly boost
    const ranked = (techs || []).map(t => {
      const coords = t.location?.coordinates;
      const dist = coords ? distanceKm(coords, [Number(lng), Number(lat)]) : 9999;
      const rating = Number(t.rating || 0);
      const eco = t.ecoFriendly ? 1 : 0;
      const score = -(dist) + rating * 2 + eco * 0.5; // larger is better
      return { tech: t, score, dist };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit))
      .map(x => ({ ...x.tech.toObject?.() || x.tech, dist: x.dist }));

    return res.json({ success: true, technicians: ranked });
  } catch (e) {
    console.error('AI getRecommendations error:', e);
    return res.status(500).json({ success: false, msg: 'Failed to get recommendations', error: e.message });
  }
};

// POST /api/ai/estimate-cost { serviceType, distanceKm, historicalHint }
exports.estimateCost = async (req, res) => {
  try {
    const { serviceType = 'general', distanceKm = 5, historicalHint = {} } = req.body || {};

    // Simple heuristic: base per service + travel + historical average fallback
    const baseMap = {
      plumbing: 399,
      electrician: 349,
      carpenter: 379,
      ac: 499,
      general: 299,
    };
    const base = baseMap[(serviceType || '').toLowerCase()] || baseMap.general;
    const travel = Math.max(0, Number(distanceKm)) * 10; // 10 per km

    // Try to use historical median cost for similar bookings
    let hist = 0;
    try {
      const Job = Booking || mongoose.model('Job');
      const last = await Job.find({ serviceType }).select('price').limit(50);
      const arr = last.map(x => Number(x.price || 0)).filter(Boolean).sort((a, b) => a - b);
      if (arr.length) hist = arr[Math.floor(arr.length / 2)];
    } catch {}

    const estimate = Math.round((hist || base) + travel);
    return res.json({ success: true, estimate });
  } catch (e) {
    console.error('AI estimateCost error:', e);
    return res.status(500).json({ success: false, msg: 'Failed to estimate cost', error: e.message });
  }
};
