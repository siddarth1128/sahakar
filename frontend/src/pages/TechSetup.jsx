import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import Input from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function TechSetup() {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [aadharFile, setAadharFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${apiUrl}/api/service-categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setServices(data.categories || []);
        } else {
          toast.error("Failed to load services");
        }
      })
      .catch(err => toast.error("Failed to load services"));
  }, [apiUrl]);

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          toast.success("Location detected");
        },
        (err) => toast.error("Failed to get location: " + err.message)
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setAadharFile(file);
      toast.success("Aadhar file selected");
    } else {
      toast.error("Only images or PDF allowed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !location.lat || !location.lng || !aadharFile) {
      toast.error("Please select services, set location, and upload Aadhar");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('services', JSON.stringify(selectedServices));
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    formData.append('aadhar', aadharFile);

    try {
      const response = await fetch(`${apiUrl}/api/tech/register`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Profile setup complete! Awaiting admin approval.");
        navigate("/dashboard/technician");
      } else {
        toast.error(data.message || "Setup failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Technician Profile</CardTitle>
          <CardDescription>
            Select services, set your location, and upload verification documents to get approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Services (select multiple)</label>
            <Select onValueChange={(value) => {
              setSelectedServices(prev => 
                prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
              );
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose services" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service._id} value={service._id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Selected: {selectedServices.length} services</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude"
              value={location.lat}
              onChange={(e) => setLocation({ ...location, lat: e.target.value })}
            />
            <Input
              placeholder="Longitude"
              value={location.lng}
              onChange={(e) => setLocation({ ...location, lng: e.target.value })}
            />
            <Button type="button" variant="outline" className="col-span-2" onClick={handleLocation}>
              Auto-Detect Location
            </Button>
          </div>
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleAadharChange}
          />
          <Button className="w-full" onClick={handleSubmit} disabled={loading || selectedServices.length === 0 || !aadharFile}>
            {loading ? "Submitting..." : "Complete Setup"}
          </Button>
          <Button
            variant="link"
            onClick={() => navigate("/dashboard/technician")}
            className="w-full justify-start"
            disabled={loading}
          >
            Skip for now (profile incomplete)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}