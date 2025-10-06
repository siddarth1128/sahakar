import { useEffect, useState } from "react";
import TechnicianDashboardLayout from "../layout/TechnicianLayout";
import { Box, Typography, Switch, FormControlLabel, CircularProgress } from "@mui/material";
import BubblesBackground from "../../../components/BubblesBackground";
import { apiPost, apiGet } from "../../../lib/api";

export default function TechnicianSettings() {
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Optionally, fetch current status from profile if available (fallback active)
  useEffect(() => {
    // If there is a profile endpoint, we could fetch it; skipping for brevity
  }, []);

  const handleToggle = async (e) => {
    const newActive = e.target.checked;
    setLoading(true);
    try {
      const data = await apiPost('/api/tech/active', { active: newActive });
      if (data.success) {
        setActive(data.status === 'available');
      }
    } catch (err) {
      // revert UI on error
      setActive(prev => !newActive);
      alert(err?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TechnicianDashboardLayout>
      <div className="container py-8 relative overflow-hidden">
        {/* Subtle black bubbles background */}
        <BubblesBackground color="rgba(0,0,0,0.18)" count={36} speed={0.9} className="-z-10 opacity-90" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Technician account settings.</p>
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={<Switch checked={active} onChange={handleToggle} disabled={loading} color="default" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={600}>{active ? 'Active' : 'Inactive'}</Typography>
                {loading ? <CircularProgress size={16} /> : null}
              </Box>
            }
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            When Active, you are visible to customers and can receive orders. When Inactive, you won't receive new orders.
          </Typography>
        </Box>
      </div>
    </TechnicianDashboardLayout>
  );
}