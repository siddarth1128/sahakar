import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Divider, Button, useMediaQuery, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Wrench, Bell, Calendar, MessageSquare, User as UserIcon, ClipboardList } from "lucide-react";

export default function TechnicianDashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const [open, setOpen] = React.useState(false);

  const nav = [
    { text: 'Job Requests', to: '/dashboard/technician/requests' },
    { text: 'Availability', to: '/dashboard/technician/availability' },
    { text: 'AI Assistant', to: '/dashboard/technician/assistant' },
    { text: 'Settings', to: '/dashboard/technician/settings' },
  ];

  const DrawerContent = (
    <Box sx={{ width: 260 }} role="presentation" onClick={() => !isDesktop && setOpen(false)}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 800, letterSpacing: 0.3 }}>FixItNow – Technician</Typography>
      <Divider />
      <List>
        {nav.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ListItemButton component={Link} to={item.to} selected={location.pathname === item.to}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B1220', position: 'relative', color: 'white' }}>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#111827', color: 'white', borderBottom: '1px solid #1f2937' }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setOpen(true)} aria-label="menu" sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>Technician Dashboard</Typography>
          <IconButton sx={{ color: 'white' }}>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button variant="outlined" color="inherit" onClick={() => navigate('/profile')} sx={{ ml: 1 }}>Profile</Button>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer variant="permanent" open sx={{ [`& .MuiDrawer-paper`]: { top: 64, backgroundColor: '#0F172A', color: 'white' } }}>
          {DrawerContent}
        </Drawer>
      ) : (
        <Drawer open={open} onClose={() => setOpen(false)}>
          {DrawerContent}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, pt: 10, px: 2 }}>
        {children}
      </Box>

      {/* Bottom dock specific to tech */}
      <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, display: { xs: 'flex', md: 'none' }, bgcolor: '#0F172A', borderTop: '1px solid #1f2937' }}>
        <Button fullWidth startIcon={<Wrench size={18} />} onClick={() => navigate('/dashboard/technician/requests')} sx={{ color: 'white' }}>Requests</Button>
        <Button fullWidth startIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/technician/availability')} sx={{ color: 'white' }}>Availability</Button>
        <Button fullWidth startIcon={<MessageSquare size={18} />} onClick={() => navigate('/dashboard/technician/assistant')} sx={{ color: 'white' }}>AI</Button>
      </Box>
    </Box>
  );
}
