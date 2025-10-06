import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Input from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReferralCode from "../components/ReferralCode";

export default function Profile() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.profile);
        } else {
          // Fallback to redux user if API fails
          setProfile(user);
        }
      } catch (e) {
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, apiUrl]);

  if (!user) return null; // Protected by AuthGuard
  const display = profile || user;

  return (
    <div className="container py-8">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{(display.name || '').charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{display.name}</h1>
            <p className="text-muted-foreground">{display.email}</p>
            <p className="text-sm text-muted-foreground">{display.role || 'Customer'}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p className="text-muted-foreground">{display.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-muted-foreground">{display.location || 'Not set'}</p>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard/customer/settings')}>Edit Profile</Button>
          </CardContent>
        </Card>

        {display.role === 'tech' && (
          <Card>
            <CardHeader>
              <CardTitle>Technician Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Services</label>
                <div className="text-muted-foreground">
                  {display.tech?.services && display.tech.services.length > 0
                    ? display.tech.services.map((s) => s.name || s).join(', ')
                    : 'Not set'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <p className="text-muted-foreground">{display.tech?.rating ?? 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Premium</label>
                  <p className="text-muted-foreground">{display.tech?.premium ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard/technician/settings')}>Edit Technician Profile</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No payment methods added yet.</p>
            <Button variant="outline" className="mt-4">Add Card</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm">
                <span>Booked plumbing service</span>
                <span className="text-muted-foreground">2 days ago</span>
              </li>
              <li className="flex justify-between text-sm">
                <span>Rated technician 5 stars</span>
                <span className="text-muted-foreground">1 week ago</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}