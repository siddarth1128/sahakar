import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { apiGet, apiPost, API_BASE } from "../../../lib/api";
import Map from "../../../components/Map";
import ChatWindow from "../../../components/ChatWindow";
import io from 'socket.io-client';

export default function CustomerJobDetails() {
  const { jobId } = useParams();
  const { user } = useSelector((s) => s.user);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [livePos, setLivePos] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: "", paymentConfirmed: true });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet(`/api/user/track-job/${jobId}`);
        if (data?.success) setJob(data.job);
      } catch (e) {
        // handle error UI
      } finally {
        setLoading(false);
      }
    };
    if (user?.token && jobId) load();
  }, [user?.token, jobId]);

  useEffect(() => {
    const setupChat = async () => {
      if (!job?.techId?._id) return;
      try {
        const resp = await apiPost('/api/chat/create', { techId: job.techId._id });
        if (resp?.success && resp?.chat?._id) setChatId(resp.chat._id);
      } catch (e) {
        // ignore chat setup errors for now
      }
    };
    setupChat();
  }, [job?.techId?._id]);

  // Socket.io: join user room and listen for live location updates
  useEffect(() => {
    if (!user?.token || !user?.id) return;
    const socket = io(API_BASE, { auth: { token: user.token } });
    socket.emit('joinUser', user.id);
    const handler = (payload) => {
      if (payload?.jobId === jobId) {
        setLivePos({ lat: Number(payload.lat), lng: Number(payload.lng) });
      }
    };
    socket.on('locationUpdate', handler);
    return () => {
      socket.off('locationUpdate', handler);
      socket.close();
    };
  }, [user?.token, user?.id, jobId]);

  const submitCompletion = async () => {
    try {
      const body = {
        jobId,
        review: { rating: Number(review.rating), comment: review.comment },
        paymentConfirmed: !!review.paymentConfirmed,
      };
      const resp = await apiPost('/api/job/complete', body);
      if (resp?.success) {
        setJob(resp.job);
        alert('Job marked as completed. Thank you for your review!');
      }
    } catch (e) {
      alert(e.message || 'Failed to complete job');
    }
  };

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!job) return <div className="container py-8">Job not found</div>;

  const initialCenter = job.techId?.location?.coordinates
    ? { lat: job.techId.location.coordinates[1], lng: job.techId.location.coordinates[0] }
    : undefined;
  const center = livePos || initialCenter;

  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job #{job._id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>Status: <strong>{job.status}</strong></div>
          <div>Technician: <strong>{job.techId?.name || 'N/A'}</strong></div>
          <div>Service: <strong>{job.serviceType || 'N/A'}</strong></div>
          <div>Price: <strong>₹{job.price}</strong></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Map</CardTitle>
        </CardHeader>
        <CardContent>
          <Map center={center} markers={center ? [{ position: center, title: 'Technician' }] : []} />
          {!center && <div className="text-sm text-muted-foreground mt-2">Location not available.</div>}
        </CardContent>
      </Card>

      {job.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Job & Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm">Rating (1-5)</label>
                <input type="number" min="1" max="5" className="border rounded px-3 py-2 w-full" value={review.rating}
                  onChange={(e) => setReview(r => ({ ...r, rating: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm">Comments</label>
                <input className="border rounded px-3 py-2 w-full" placeholder="How was the service?"
                  value={review.comment} onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))} />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={review.paymentConfirmed} onChange={(e) => setReview(r => ({ ...r, paymentConfirmed: e.target.checked }))} />
              Payment received (COD)
            </label>
            <div>
              <Button onClick={submitCompletion}>Submit Review & Complete Job</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <ChatWindow chatId={chatId} />
        </CardContent>
      </Card>
    </div>
  );
}
