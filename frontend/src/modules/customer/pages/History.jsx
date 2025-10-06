import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import CustomerDashboardLayout from '../layout/CustomerLayout';
import { apiGet } from '../../../lib/api';

export default function CustomerHistory() {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs:history'],
    queryFn: async () => {
      const data = await apiGet('/api/job/list');
      return data.jobs || [];
    },
  });

  const rows = useMemo(() => {
    return (jobs || [])
      .filter(j => j.status === 'completed' || new Date(j.date) < new Date())
      .map((j, idx) => ({
        id: j._id || idx,
        date: j.date,
        service: j.serviceType || 'Service',
        technician: j.techId?.name || '—',
        cost: j.price || 0,
        status: j.status,
        receipt: j.receipt,
      }));
  }, [jobs]);

  const columns = [
    { field: 'date', headerName: 'Date', flex: 1, valueGetter: (p) => new Date(p.value).toLocaleString() },
    { field: 'service', headerName: 'Service', flex: 1 },
    { field: 'technician', headerName: 'Technician', flex: 1 },
    { field: 'cost', headerName: 'Cost', width: 120, valueFormatter: (p) => `₹${p.value}` },
    { field: 'status', headerName: 'Status', width: 140 },
    {
      field: 'receipt', headerName: 'Receipt', width: 120,
      renderCell: (params) => params.value ? (
        <IconButton size="small" component="a" href={params.value} target="_blank" rel="noopener noreferrer">
          <DownloadIcon fontSize="small" />
        </IconButton>
      ) : null
    },
  ];

  return (
    <CustomerDashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>History & Receipts</Typography>
        {error && <Typography color="error">{error.message}</Typography>}
        <div style={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </div>
      </Box>
    </CustomerDashboardLayout>
  );
}
