import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Tabs, Tab, Card, CardContent, Typography, Chip, Button, Stack } from '@mui/material';
import CustomerDashboardLayout from '../layout/CustomerLayout';
import { apiGet } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerBookings() {
  const navigate = useNavigate();

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs:list'],
    queryFn: async () => {
      const data = await apiGet('/api/job/list');
      return data.jobs || [];
    },
  });

  const [tab, setTab] = useState(0);

  const { active, upcoming, completed } = useMemo(() => {
    const jobs = jobsData || [];
    const now = new Date();
    return {
      active: jobs.filter(j => ['pending', 'in-progress', 'confirmed'].includes(j.status)),
      upcoming: jobs.filter(j => new Date(j.date) > now && j.status !== 'completed'),
      completed: jobs.filter(j => j.status === 'completed'),
    };
  }, [jobsData]);

  const lists = [
    { label: 'Active', data: active },
    { label: 'Upcoming', data: upcoming },
    { label: 'Completed', data: completed },
  ];

  return (
    <CustomerDashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>My Bookings</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {lists.map((l, i) => <Tab key={i} label={`${l.label} (${l.data.length})`} />)}
        </Tabs>

        {isLoading && <Typography>Loading...</Typography>}
        {error && <Typography color="error">{error.message}</Typography>}

        {!isLoading && !error && (
          <Stack spacing={2}>
            {lists[tab].data.map(job => (
              <Card key={job._id} elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{job.serviceType || 'Service'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(job.date).toLocaleString()} • {job.location || job.address || 'No address'}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip size="small" label={job.status} color={job.status === 'completed' ? 'success' : job.status === 'in-progress' ? 'warning' : 'default'} />
                        {job.price ? <Chip size="small" label={`₹${job.price}`} /> : null}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" onClick={() => navigate(`/dashboard/customer/job/${job._id}`)}>View</Button>
                      {(job.status !== 'completed') && (
                        <Button variant="contained" onClick={() => navigate(`/dashboard/customer/job/${job._id}`)}>Track</Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {lists[tab].data.length === 0 && (
              <Typography color="text.secondary">No bookings found.</Typography>
            )}
          </Stack>
        )}
      </Box>
    </CustomerDashboardLayout>
  );
}
