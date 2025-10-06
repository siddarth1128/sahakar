import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Divider, Button, useMediaQuery, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Home, Search, Calendar, MessageSquare, User as UserIcon, History, Star } from "lucide-react";

export default function CustomerDashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const [open, setOpen] = React.useState(false);

  const nav = [
    { text: 'Overview', to: '/dashboard/customer/overview' },
    { text: 'Search Services', to: '/dashboard/customer/search' },
    { text: 'My Bookings', to: '/dashboard/customer/bookings' },
    { text: 'History & Receipts', to: '/dashboard/customer/history' },
    { text: 'Reviews', to: '/dashboard/customer/reviews' },
    { text: 'Messages', to: '/dashboard/customer/messages' },
    { text: 'AI Assistant', to: '/dashboard/customer/assistant' },
    { text: 'Settings', to: '/dashboard/customer/settings' },
  ];

  const DrawerContent = (
    <Box sx={{ width: 260 }} role="presentation" onClick={() => !isDesktop && setOpen(false)}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 800, letterSpacing: 0.3 }}>FixItNow – Customer</Typography>
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
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        // Soft gradient background with radial accents
        background:
          'radial-gradient(1200px 600px at 100% -20%, rgba(79, 70, 229, 0.08), transparent 60%),\n           radial-gradient(800px 400px at -10% 20%, rgba(14, 165, 233, 0.08), transparent 60%),\n           linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)',
      }}
    >
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#0F172A', color: 'white' }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setOpen(true)} aria-label="menu" sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>Customer Dashboard</Typography>
          <IconButton sx={{ color: 'white' }}>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button variant="outlined" color="inherit" onClick={() => navigate('/profile')} sx={{ ml: 1 }}>Profile</Button>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer variant="permanent" open sx={{ [`& .MuiDrawer-paper`]: { top: 64, borderRight: 0 } }}>
          {DrawerContent}
        </Drawer>
      ) : (
        <Drawer open={open} onClose={() => setOpen(false)}>
          {DrawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 10,
          px: { xs: 1.5, sm: 2, md: 3 },
          pb: { xs: 10, md: 4 }, // leave room for bottom dock on mobile
          maxWidth: 1400,
          width: '100%',
          ml: { md: isDesktop ? '260px' : 0 },
          // subtle container centering
          mx: 'auto',
        }}
      >
        {children}
      </Box>

      {/* Bottom dock specific to customer */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: { xs: 'flex', md: 'none' },
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(10px)',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <Button fullWidth startIcon={<Home size={18} />} onClick={() => navigate('/dashboard/customer/overview')}>Home</Button>
        <Button fullWidth startIcon={<Search size={18} />} onClick={() => navigate('/dashboard/customer/search')}>Find</Button>
        <Button fullWidth startIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/customer/bookings')}>Bookings</Button>
        <Button fullWidth startIcon={<MessageSquare size={18} />} onClick={() => navigate('/dashboard/customer/assistant')}>AI</Button>
      </Box>
    </Box>
  );
}
