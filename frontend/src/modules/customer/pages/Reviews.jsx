import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Card, CardContent, Rating, Stack } from '@mui/material';
import CustomerDashboardLayout from '../layout/CustomerLayout';
import { apiGet } from '../../../lib/api';

export default function CustomerReviews() {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs:reviews'],
    queryFn: async () => {
      const data = await apiGet('/api/job/list');
      return data.jobs || [];
    },
  });

  const reviewed = useMemo(() => (jobs || []).filter(j => j.review && j.status === 'completed'), [jobs]);

  return (
    <CustomerDashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>My Reviews</Typography>
        {isLoading && <Typography>Loading...</Typography>}
        {error && <Typography color="error">{error.message}</Typography>}

        <Stack spacing={2}>
          {reviewed.map((j) => (
            <Card key={j._id} elevation={2}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>{j.serviceType || 'Service'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(j.date).toLocaleString()} • {j.techId?.name || 'Technician'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={Number(j.review?.rating || 0)} precision={0.5} readOnly />
                  <Typography variant="body2">{j.review?.comment || ''}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          {!isLoading && reviewed.length === 0 && (
            <Typography color="text.secondary">No reviews available yet.</Typography>
          )}
        </Stack>
      </Box>
    </CustomerDashboardLayout>
  );
}
