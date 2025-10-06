import React, { useEffect, useRef, useState } from "react";
import {
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Switch,
  useMediaQuery,
  TextField,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Bell,
  User as UserIcon,
  Home,
  Briefcase,
  Calendar,
  Wrench,
  Clock,
  DollarSign,
  MessageCircle,
  Settings as SettingsIcon,
  Bot,
  MapPin,
  Phone,
  Video,
  X as CloseIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Upload,
  Camera,
  FileText,
  TrendingUp,
  Award,
  Shield,
  Navigation,
  Sun,
  Moon,
  Map as MapIcon,
  FilePen,
  CreditCard,
  Leaf,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiGet, apiPost } from "../../../lib/api";

const ShinyText = ({ text, className }) => (
  <span className={`${className} bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent`}>{text}</span>
);

const LightRays = ({ className }) => (
  <div className={`${className} absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 pointer-events-none`} />
);

export default function TechnicianDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [draftOpen, setDraftOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [inProgressJobs, setInProgressJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSm = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const notifications = [
    { id: 1, message: 'New job request from Sarah Johnson', time: '2 min ago', read: false, type: 'job' },
    { id: 2, message: 'Payment received: ₹75', time: '1 hour ago', read: false, type: 'payment' },
    { id: 3, message: 'Customer rated you 5 stars!', time: '3 hours ago', read: true, type: 'review' },
    { id: 4, message: 'New dispute filed on job #456', time: '4 hours ago', read: false, type: 'dispute' }
  ];

  const technicianStats = {
    totalJobs: completedJobs.length + inProgressJobs.length + pendingJobs.length,
    pendingRequests: pendingJobs.length,
    averageRating: 4.8,
    monthlyEarnings: 2850,
    loyaltyCommission: 250,
    ecoFriendly: true
  };

  // Derived adapters to fit existing UI fields
  const jobRequests = pendingJobs.map(j => ({
    id: j._id,
    customer: j.beneficiaryName || j.userId?.name || "Customer",
    service: j.serviceType || "Service",
    time: new Date(j.createdAt).toLocaleString(),
    location: j.locationText || "",
    distance: j.distanceText || "",
    urgency: "Medium",
    description: j.description || ""
  }));

  const activeJobs = inProgressJobs.map(j => ({
    id: j._id,
    customer: j.beneficiaryName || j.userId?.name || "Customer",
    service: j.serviceType || "Service",
    status: 'In Progress',
    startTime: new Date(j.updatedAt || j.createdAt).toLocaleTimeString(),
    location: j.locationText || '',
    phone: j.beneficiaryPhone || '',
    description: j.description || ''
  }));

  const jobHistory = completedJobs.map(j => ({
    id: j._id,
    customer: j.beneficiaryName || j.userId?.name || 'Customer',
    service: j.serviceType || 'Service',
    date: new Date(j.updatedAt || j.createdAt).toLocaleDateString(),
    cost: j.price || 0,
    rating: j.review?.rating || '-',
    status: 'Completed'
  }));

  // Load jobs for technician
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const [pendingRes, inProgRes, completedRes] = await Promise.all([
        apiGet('/api/job/list?status=pending'),
        apiGet('/api/job/list?status=in-progress'),
        apiGet('/api/job/list?status=completed'),
      ]);
      setPendingJobs(pendingRes.jobs || []);
      setInProgressJobs(inProgRes.jobs || []);
      setCompletedJobs(completedRes.jobs || []);
    } catch (e) {
      setError(e.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Availability toggle -> backend
  const handleAvailabilityToggle = async (checked) => {
    try {
      setIsAvailable(checked);
      await apiPost('/api/tech/active', { active: checked });
    } catch (e) {
      // revert on error
      setIsAvailable(!checked);
    }
  };

  // Accept/Decline job actions
  const handleAccept = async (jobId) => {
    try {
      await apiPost(`/api/tech/accept-job/${jobId}`, {});
      await loadJobs();
    } catch (e) {
      console.error('Accept failed', e);
    }
  };

  const handleDecline = async (jobId) => {
    try {
      await apiPost(`/api/tech/decline-job/${jobId}`, {});
      await loadJobs();
    } catch (e) {
      console.error('Decline failed', e);
    }
  };

  const navigationItems = [
    { text: 'Overview', icon: Home, index: 0 },
    { text: 'Job Requests', icon: Briefcase, index: 1 },
    { text: 'Availability', icon: Calendar, index: 2 },
    { text: 'Active Jobs', icon: Wrench, index: 3 },
    { text: 'History', icon: Clock, index: 4 },
    { text: 'Earnings', icon: DollarSign, index: 5 },
    { text: 'Chat', icon: MessageCircle, index: 6 },
    { text: 'Settings', icon: SettingsIcon, index: 7 },
  ];

  const Header = () => (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-white/10 lg:hidden mr-2">
            <MenuIcon size={24} />
          </button>
          <ShinyText text="FixItNow" className="text-2xl font-bold" />
          <span className="text-sm ml-2 opacity-80">Technician Portal</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
            <span className="text-sm">Available</span>
            <Switch checked={isAvailable} onChange={(e) => handleAvailabilityToggle(e.target.checked)} />
          </div>
          <div className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-md hover:bg-white/10 relative">
              <Bell size={24} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50 overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{n.time}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/10">
              <motion.div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden" whileHover={{ scale: 1.1 }}>
                <span className="text-sm font-semibold">RK</span>
              </motion.div>
            </button>
            {profileMenuOpen && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50 overflow-hidden">
                <button onClick={() => { setCurrentTab(7); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center"><UserIcon size={16} className="mr-2" />Profile</button>
                <button onClick={() => { setCurrentTab(7); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center"><SettingsIcon size={16} className="mr-2" />Settings</button>
                <button onClick={() => { setDarkMode(!darkMode); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center">{darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors border-t flex items-center" onClick={() => setProfileMenuOpen(false)}><CloseIcon size={16} className="mr-2" />Logout</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const Sidebar = () => (
    <motion.nav className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-in-out z-40 overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0'} lg:w-64 lg:translate-x-0`} initial={false} animate={{ width: sidebarOpen ? 256 : 0 }}>
      <LightRays className="opacity-5 dark:opacity-10" />
      <div className="relative z-10 p-4 h-full">
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <ShinyText text="Menu" className="text-xl font-bold text-gray-800 dark:text-white" />
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><CloseIcon size={24} className="text-gray-600 dark:text-gray-300" /></button>
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button key={item.text} onClick={() => { setCurrentTab(item.index); if (isMobile) setSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${currentTab === item.index ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Icon size={20} />
                <span className="font-medium">{item.text}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.nav>
  );

  const OverviewTab = () => (
    <div className="p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <Typography variant="h5" className="mb-2 font-bold">Welcome back, Rajesh!</Typography>
        <Typography variant="body2" color="text.secondary">Your technician dashboard overview</Typography>
      </motion.div>
      <Grid container spacing={3} className="mb-6 md:mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Jobs" value={technicianStats.totalJobs} icon={<Wrench className="text-blue-500" size={28} />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Requests" value={technicianStats.pendingRequests} icon={<Briefcase className="text-orange-500" size={28} />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Average Rating" value={technicianStats.averageRating} icon={<Star className="text-green-500" size={28} />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="This Month" value={`₹${technicianStats.monthlyEarnings}`} icon={<DollarSign className="text-purple-500" size={28} />} color="#8b5cf6" />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <Typography variant="h6" className="mb-4 font-semibold flex items-center"><Briefcase className="mr-2 text-blue-500" size={22} />Recent Job Requests</Typography>
              <div className="space-y-3">
                {jobRequests.slice(0,3).map((request) => (
                  <motion.div key={request.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" whileHover={{ scale: 1.02 }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{request.customer}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{request.service}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${request.urgency === 'High' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' : request.urgency === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'}`}>{request.urgency} Priority</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm"><Calendar size={16} className="mr-2" />{request.time}</div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm"><MapPin size={16} className="mr-2" />{request.location} • {request.distance}</div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">{request.description}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleAccept(request.id)} variant="contained" color="success" size="small" startIcon={<CheckCircle size={16} />}>Accept</Button>
                      <Button onClick={() => handleDecline(request.id)} variant="outlined" color="inherit" size="small" startIcon={<XCircle size={16} />}>Decline</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <Typography variant="h6" className="mb-4 font-semibold flex items-center"><Bot className="mr-2 text-purple-500" size={22} />AI Suggestions</Typography>
              <div className="space-y-3">
                <Suggestion color="purple" icon={<Award className="mr-2" size={18} />} title="High-paying opportunity" desc="AC repair in Bandra - ₹850 estimated" meta="4.2 km away • Matches your skills" />
                <Suggestion color="blue" icon={<Navigation className="mr-2" size={18} />} title="Nearby quick job" desc="Electrical work in Andheri" meta="0.8 km away • 45 min estimated" />
                <Suggestion color="green" icon={<Shield className="mr-2" size={18} />} title="Eco-friendly request" desc="Sustainable plumbing in Juhu" meta="3.5 km away • Matches your eco-badge" />
              </div>
              <Button onClick={() => setAiChatOpen(true)} variant="text" sx={{ mt: 1 }} startIcon={<Bot size={18} />}>Ask AI for More</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );

  const JobRequestsTab = () => (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-4 font-bold">Job Requests</Typography>
      <Grid container spacing={3}>
        {jobRequests.map((request, index) => (
          <Grid item xs={12} key={request.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {request.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{request.customer}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{request.service}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${request.urgency === 'High' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' : request.urgency === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'}`}>{request.urgency} Priority</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300"><Calendar size={18} className="mr-2" />{request.time}</div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300"><MapPin size={18} className="mr-2" />{request.location} • {request.distance}</div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{request.description}</p>
                <div className="flex flex-col md:flex-row gap-2">
                  <Button onClick={() => handleAccept(request.id)} variant="contained" color="success" startIcon={<CheckCircle size={18} />} className="flex-1">Accept</Button>
                  <Button onClick={() => handleDecline(request.id)} variant="contained" color="error" startIcon={<XCircle size={18} />} className="flex-1">Decline</Button>
                  <Button variant="outlined" startIcon={<UserIcon size={18} />} className="flex-1">View Profile</Button>
                </div>
              </div>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </div>
  );

  const AvailabilityTab = () => (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-2 font-bold">Availability Management</Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">Set your working hours and manage your schedule</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <Typography variant="subtitle1" className="mb-2 font-semibold">Your Calendar</Typography>
              {/* Native date input as a light alternative to external calendar deps */}
              <TextField type="date" label="Select a date" InputLabelProps={{ shrink: true }} fullWidth />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
            <CardContent className="p-4 md:p-6">
              <Typography variant="subtitle1" className="mb-3 font-semibold">Set Availability</Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">Working Hours</label>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-md text-sm">
                    <option>9 AM - 5 PM</option>
                    <option>10 AM - 6 PM</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">Break Time</label>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-md text-sm">
                    <option>1 PM - 2 PM</option>
                    <option>None</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300 flex items-center gap-2"><Leaf size={18} className="text-green-600" />Eco-Friendly Mode</label>
                  <Switch defaultChecked={technicianStats.ecoFriendly} />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">AI Prediction</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">High demand expected between 2-5 PM today</p>
                </div>
                <Button variant="contained">Save Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );

  const ActiveJobsTab = () => (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-2 font-bold">Active Jobs</Typography>
      <Typography variant="body2" color="text.secondary" className="mb-3">Manage your ongoing work</Typography>
      <Grid container spacing={3}>
        {activeJobs.map((job, index) => (
          <Grid item xs={12} key={job.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {job.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{job.customer}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{job.service}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${job.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'}`}>{job.status}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300"><Clock size={18} className="mr-2" />Started: {job.startTime}</div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300"><Phone size={18} className="mr-2" />{job.phone}</div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300"><MapPin size={18} className="mr-2" />{job.location}</div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300"><Navigation size={18} className="mr-2" />ETA: 15 min</div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{job.description}</p>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <MapIcon size={48} className="text-gray-400" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Map View</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <Button onClick={() => { setSelectedJob(job); setDraftOpen(true); }} variant="contained" color="secondary" startIcon={<FilePen size={16} />} className="flex-1">Submit Draft</Button>
                  <Button variant="outlined" startIcon={<MessageCircle size={16} />} className="flex-1">Chat</Button>
                  <Button variant="outlined" startIcon={<Phone size={16} />} className="flex-1">Call</Button>
                  <Button variant="outlined" startIcon={<Video size={16} />} className="flex-1">Video Call</Button>
                </div>
                <Button fullWidth variant="contained" color="error" startIcon={<AlertCircle size={16} />}>Report Issue</Button>
              </div>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </div>
  );

  const HistoryTab = () => (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-2 font-bold">Job History</Typography>
      <Typography variant="body2" color="text.secondary" className="mb-3">Review your past jobs and performance</Typography>
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Job ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {jobHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{job.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{job.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{job.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{job.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">₹{job.cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        {job.rating}
                        <Star size={14} className="ml-1 text-yellow-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">{job.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button size="small" sx={{ mr: 1 }}><FileText size={16} /></Button>
                      <Button size="small"><CreditCard size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ChatTab = () => (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-2 font-bold">Messages</Typography>
      <Typography variant="body2" color="text.secondary" className="mb-3">Your conversations with customers</Typography>
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <motion.div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {job.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{job.customer}</p>
                      <p className="text-xs text-gray-500">Last message 2 min ago</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">Job #{job.id}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 truncate">Hi, when can you arrive?</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsTab = () => (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-2 font-bold">Settings</Typography>
      <Typography variant="body2" color="text.secondary" className="mb-3">Manage your profile and preferences</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <Typography variant="subtitle1" className="mb-3 font-semibold">Profile Information</Typography>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                    <span>RK</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="contained" startIcon={<Upload size={16} />}>Upload Photo</Button>
                    <Button variant="outlined" startIcon={<Camera size={16} />}>Take Photo</Button>
                  </div>
                </div>
                <TextField fullWidth label="Full Name" defaultValue="Rajesh Kumar" />
                <TextField fullWidth label="Email" defaultValue="rajesh@example.com" />
                <TextField fullWidth label="Phone" defaultValue="+91 9876543210" />
                <TextField fullWidth label="Bio/Description" multiline minRows={3} defaultValue="Experienced plumber with 10+ years in home repairs" />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
            <CardContent className="p-4 md:p-6 space-y-6">
              <Typography variant="subtitle1" className="font-semibold">Preferences</Typography>
              <div className="space-y-4">
                <PrefRow label="Email Notifications"><Switch defaultChecked /></PrefRow>
                <PrefRow label="SMS Notifications"><Switch defaultChecked /></PrefRow>
                <PrefRow label="Push Notifications"><Switch /></PrefRow>
                <PrefRow label="Eco-Friendly Badge"><Switch defaultChecked={technicianStats.ecoFriendly} /></PrefRow>
              </div>
              <Button variant="contained">Save Changes</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 0: return <OverviewTab />;
      case 1: return <JobRequestsTab />;
      case 2: return <AvailabilityTab />;
      case 3: return <ActiveJobsTab />;
      case 4: return <HistoryTab />;
      case 5: return <EarningsTab />;
      case 6: return <ChatTab />;
      case 7: return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <div className="flex relative min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'ml-0'}`}>
          {renderTabContent()}
        </main>
      </div>
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* AI Chat Dialog */}
      <Dialog open={aiChatOpen} onClose={() => setAiChatOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>AI Assistant</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={1}>Ask about jobs, schedule optimization, or draft generation.</Typography>
          <Box display="flex" gap={1}>
            <TextField fullWidth size="small" placeholder="Type your message..." />
            <Button variant="contained">Send</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiChatOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Draft Dialog */}
      <Dialog open={draftOpen} onClose={() => setDraftOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Submit Job Draft</DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>Job #{selectedJob.id} - {selectedJob.service}</Typography>
              <TextField fullWidth label="Work Summary" multiline minRows={4} sx={{ mb: 2 }} />
              <Box display="flex" gap={1} sx={{ mb: 2 }}>
                <Button variant="outlined" startIcon={<Upload size={16} />}>Upload Photos</Button>
                <Button variant="outlined" startIcon={<Camera size={16} />}>Take Photo</Button>
              </Box>
              <TextField fullWidth type="number" label="Total Amount (₹)" />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDraftOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDraftOpen(false)}>Submit Draft</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon, color = '#1976D2' }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" sx={{ borderTop: `3px solid ${color}` }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
          </Box>
          <Box color={color}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Suggestion({ color, icon, title, desc, meta }) {
  const bg = color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30' : color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-50 dark:bg-green-900/30';
  return (
    <motion.div className={`p-3 rounded-lg hover:shadow-md transition-shadow ${bg}`} whileHover={{ scale: 1.02 }}>
      <div className="flex items-center mb-1">{icon}<p className="text-sm font-medium">{title}</p></div>
      <p className="text-sm opacity-90">{desc}</p>
      <p className="text-xs opacity-75 mt-1">{meta}</p>
    </motion.div>
  );
}

function PrefRow({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">{label}</span>
      {children}
    </div>
  );
}

function EarningsTab() {
  // Simplified: no external charts to avoid adding dependencies
  return (
    <div className="p-4 md:p-6">
      <Typography variant="h5" className="mb-2 font-bold">Earnings & Analytics</Typography>
      <Typography variant="body2" color="text.secondary" className="mb-3">Track your performance and payments</Typography>
      <Grid container spacing={3} className="mb-3">
        <Grid item xs={12} md={4}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/10">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" className="font-semibold">Monthly Earnings</Typography>
                <TrendingUp className="text-purple-500" size={20} />
              </Box>
              <Typography variant="h5" fontWeight={700}>₹2,850</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" className="font-semibold">Loyalty Commission</Typography>
                <Award className="text-green-500" size={20} />
              </Box>
              <Typography variant="h5" fontWeight={700}>₹250</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" className="font-semibold">Pending Payouts</Typography>
                <CreditCard className="text-blue-500" size={20} />
              </Box>
              <Typography variant="h5" fontWeight={700}>₹1,200</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card className="bg-white dark:bg-gray-800">
        <CardContent>
          <Typography variant="subtitle1" className="mb-2 font-semibold">Performance Analytics</Typography>
          <div className="space-y-3">
            <Row label="Completion Rate" value="98%" color="green" />
            <Row label="Average Response Time" value="12 min" color="blue" />
            <Row label="Dispute Rate" value="0.5%" color="red" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, color }) {
  const colorClass = color === 'green' ? 'text-green-700 dark:text-green-300' : color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300';
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`font-medium ${colorClass}`}>{value}</span>
    </div>
  );
}
