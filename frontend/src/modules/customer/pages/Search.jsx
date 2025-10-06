import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Card, CardContent, CardActions, Typography, TextField, Button, Rating, Chip, Slider } from '@mui/material';
import { apiGet, apiPost } from '../../../lib/api';
import CustomerDashboardLayout from '../layout/CustomerLayout';

export default function CustomerSearch() {
  const [service, setService] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('10'); // km
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [priceByTech, setPriceByTech] = useState({});
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Get user's location when component mounts
  useEffect(() => {
    // Load Google Maps JS API
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initMapFromGeolocation;
      document.body.appendChild(script);
    } else {
      initMapFromGeolocation();
    }
  }, []);

  const initMapFromGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const clat = position.coords.latitude;
          const clng = position.coords.longitude;
          setLat(clat);
          setLng(clng);
          initMap(clat, clng);
          performSearch(clat, clng);
        },
        () => {
          // Fallback to a default location
          const clat = 12.9716; const clng = 77.5946; // Bengaluru
          setLat(clat);
          setLng(clng);
          initMap(clat, clng);
        }
      );
    }
  };

  const initMap = (clat, clng) => {
    if (!mapRef.current || !window.google) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: Number(clat), lng: Number(clng) },
      zoom: 12,
      streetViewControl: false,
      mapTypeControl: false,
    });
  };

  const performSearch = async (latitude = lat, longitude = lng) => {
    if (!latitude || !longitude) return alert('Please enter latitude and longitude');
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lng: String(longitude),
        radius: String((Number(radius) || 10) * 1000),
        ...(service ? { q: service } : {}),
        ...(minRating ? { minRating: String(minRating) } : {}),
      }).toString();
      const data = await apiGet(`/api/tech/nearby?${params}`);
      const techs = data.technicians || [];
      setResults(techs);
      drawMarkers(techs, Number(latitude), Number(longitude));
    } catch (e) {
      console.error(e);
      alert(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const drawMarkers = (techs, clat, clng) => {
    if (!window.google || !mapInstanceRef.current) return;
    clearMarkers();
    // Center marker for the customer
    const you = new window.google.maps.Marker({
      position: { lat: clat, lng: clng },
      map: mapInstanceRef.current,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/black-dot.png'
      },
      title: 'You'
    });
    markersRef.current.push(you);
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: clat, lng: clng });
    techs.forEach(t => {
      const coords = t.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        const pos = { lat: Number(coords[1]), lng: Number(coords[0]) };
        const marker = new window.google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          icon: { url: 'https://maps.google.com/mapfiles/ms/icons/black-dot.png' },
          title: t.userId?.name || t.name || 'Technician'
        });
        const infowin = new window.google.maps.InfoWindow({
          content: `<div style="font-weight:700">${t.userId?.name || t.name || 'Technician'}</div>
            <div>Rating: ${(t.rating || 0).toFixed ? (t.rating || 0).toFixed(1) : (t.rating || 0)}</div>`
        });
        marker.addListener('click', () => infowin.open({ anchor: marker, map: mapInstanceRef.current }));
        markersRef.current.push(marker);
        bounds.extend(pos);
      }
    });
    mapInstanceRef.current.fitBounds(bounds);
  };

  const bookTech = async (tech) => {
    const price = parseFloat(priceByTech[tech._id] || 499);
    if (Number.isNaN(price) || price <= 0) return alert('Enter a valid price');
    try {
      await apiPost('/api/user/book-job', {
        techId: tech._id,
        serviceType: (tech.services?.[0]?.name) || service || 'general',
        price,
      });
      alert('Booking created');
    } catch (e) {
      alert(e.message || 'Booking failed');
    }
  };

  return (
    <CustomerDashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Search Services
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Service" placeholder="Plumbing" value={service} onChange={(e) => setService(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth label="Radius (km)" value={radius} onChange={(e) => setRadius(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth type="number" label="Min Rating" inputProps={{ min: 0, max: 5, step: 0.5 }} value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value || 0))} />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="contained" onClick={() => performSearch()} disabled={loading}>{loading ? '...' : 'Search'}</Button>
          </Grid>
        </Grid>

        <Box sx={{ height: 380, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </Box>

        <Grid container spacing={2}>
          {results.map(t => (
            <Grid item xs={12} md={4} key={t._id}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>{t.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Rating size="small" value={Number(t.rating || 0)} precision={0.5} readOnly />
                    <Typography variant="body2">{t.rating?.toFixed ? t.rating.toFixed(1) : t.rating || 'N/A'}</Typography>
                    {t.premium ? <Chip size="small" variant="outlined" sx={{ bgcolor: 'black', color: 'white' }} label="Premium" /> : null}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Services: {(t.services || []).map(s => s.name || s).join(', ') || '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {t.dist ? `${t.dist.toFixed(2)} km away` : 'Distance N/A'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <TextField size="small" label="Price" type="number" sx={{ width: 120 }} value={priceByTech[t._id] || ''} onChange={(e) => setPriceByTech(prev => ({ ...prev, [t._id]: e.target.value }))} />
                  <Button variant="contained" onClick={() => bookTech(t)}>Book</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </CustomerDashboardLayout>
  );
}
