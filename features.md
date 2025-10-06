# FixItNow App Features Testing Checklist

This document lists all major features of the FixItNow application for systematic testing. The app is a service marketplace connecting customers with technicians for jobs like repairs, with features for authentication, booking, communication, payments, and more.

Mark each item as completed after testing. Note any errors found and fixes applied.

## 1. Authentication & Authorization
- [ ] User registration (Signup page) - Form validation, email/password, referral code handling
- [ ] User login (Login page) - Email/password, error handling for invalid credentials
- [ ] Google OAuth integration (GoogleIcon, AuthCallback)
- [ ] OTP verification (OtpInput component) - Sending and entering OTP for email/phone
- [ ] Password reset/forgot password flow
- [ ] AuthGuard protection - Redirects unauthenticated users to login
- [ ] Role-based access - Customer vs Technician dashboards
- [ ] Logout functionality

## 2. User Profiles & Settings
- [ ] Profile viewing and editing (Profile page)
- [ ] Customer settings (dashboard/customer/Settings.jsx) - Update info, preferences
- [ ] Technician settings (dashboard/technician/Settings.jsx) - Update skills, certifications
- [ ] Avatar upload/display (ui/avatar.jsx)
- [ ] Referral code generation and sharing (ReferralCode component)

## 3. Customer Dashboard Features
- [ ] Dashboard overview (dashboard/customer/Overview.jsx) - Stats, recent jobs
- [ ] Job booking - Select service category, describe issue, schedule, AI recommendations (aiRecommend.js)
- [ ] View job details (dashboard/customer/JobDetail.jsx) - Status updates, technician info, map location
- [ ] Job management - Cancel, dispute (Dispute model), payments
- [ ] Weather-based suggestions (WeatherSuggest.jsx, weatherApi.js)
- [ ] Search and filter technicians by category/location

## 4. Technician Dashboard Features
- [ ] Dashboard overview (dashboard/Technician.jsx) - Available jobs, earnings
- [ ] Set availability (dashboard/technician/Availability.jsx) - Calendar/schedule management
- [ ] View job requests (dashboard/technician/Requests.jsx) - Accept/decline jobs
- [ ] Job acceptance workflow - Updates job status, notifications
- [ ] Profile visibility to customers - Skills, ratings, location

## 5. Job Management
- [ ] Service categories listing (serviceCategory routes/models) - Browse categories
- [ ] Job creation by customer (job controller/routes)
- [ ] Job assignment to technicians (tech controller)
- [ ] Job status updates - Pending, In Progress, Completed
- [ ] Activity logging (Activity model)
- [ ] Map integration for job locations (Map.jsx)

## 6. Communication Features
- [ ] In-app chat (ChatWindow.jsx, chat routes/models) - Real-time messaging between customer/tech
- [ ] Video calls (VideoCall.jsx) - Initiate and join calls for jobs
- [ ] Notifications - Email (emailWorker.js), in-app toasts (ui/toast.jsx)

## 7. Payments & Reviews
- [ ] Payment processing (payments routes/models) - Book job, pay technician
- [ ] Payment disputes (Dispute model)
- [ ] Reviews and ratings (review routes/models, ui components) - Post-job feedback
- [ ] Payouts for technicians

## 8. Admin Features
- [ ] Admin dashboard/login (admin controller)
- [ ] Manage users, technicians, categories (admin.js)
- [ ] View analytics, disputes, payments

## 9. Additional Features
- [ ] Internationalization (i18n.js) - Multi-language support
- [ ] SEO optimization (seo.js)
- [ ] Progressive Web App (serviceWorkerRegistration.js) - Offline support
- [ ] Rate limiting and validation (middleware)
- [ ] Error handling - 404 page (NotFound.jsx), global errors
- [ ] Mobile responsiveness (Tailwind CSS)
- [ ] Dark mode or theme switching (if implemented)
- [ ] Search functionality across jobs/users

## Testing Notes
- Test on different user roles: Customer, Technician, Admin.
- Test edge cases: Invalid inputs, network errors, concurrent access.
- Verify backend API responses (using browser dev tools or Postman).
- Ensure all routes are protected where needed.
- Performance: Load times, real-time updates.

After testing all, confirm no errors remain.