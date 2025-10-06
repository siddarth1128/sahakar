import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Input from "../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Bolt,
  Clock,
  MapPin,
  Wrench,
  ShowerHead,
  Plug,
  Hammer,
  WashingMachine,
  Paintbrush,
  Fan,
  CheckCircle2,
  ShieldCheck,
  Star,
} from "lucide-react";
// Removed decorative backgrounds for a cleaner look

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-4 bg-card">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Vetted, insured, background-checked pros
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Get home repairs done now with trusted local pros
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              FixItNow connects you with nearby professionals available today.
              Book in minutes, track in real time, and pay securely.
            </p>
            <div
              id="book"
              className="mt-6 rounded-xl border p-4 md:p-5 bg-card shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Select>
                  <SelectTrigger className="h-12 md:col-span-1">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="appliance">Appliance Repair</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative md:col-span-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-9 h-12"
                    placeholder="Enter your address or area"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            document.getElementById('address').value = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
                          },
                          (err) => alert('Failed to get location: ' + err.message)
                        );
                      }
                    }}
                  >
                    📍
                  </Button>
                </div>
                <Button className="h-12 md:col-span-1" id="findPro">Find a pro</Button>
              </div>
              <div id="results" className="mt-4 p-4 bg-card rounded-lg hidden">
                <h4 className="font-semibold mb-2">Nearby Technicians</h4>
                <div id="techList" className="space-y-2"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Most jobs confirmed within 5
                minutes
              </p>
            </div>
            {/* Hero CTAs */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">Book a Service</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signup?role=technician">Join as Pro</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-500" /> 4.9 average
                rating
              </Badge>
              <Badge variant="secondary">Upfront pricing</Badge>
              <Badge variant="secondary">No hidden fees</Badge>
            </div>
          </div>
          <div className="relative">
            <Card className="glass border-0 shadow-xl">
              <CardContent className="p-0">
                <img
                  src="/placeholder.svg"
                  alt="FixItNow app preview"
                  className="w-full h-[380px] object-cover rounded-xl"
                  loading="lazy"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Popular services
            </h2>
            <p className="text-muted-foreground">
              Book experienced professionals across dozens of categories.
            </p>
          </div>
          <a
            href="#book"
            className="hidden md:inline text-primary hover:underline"
          >
            See all services
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ServiceCard
            icon={<ShowerHead className="h-6 w-6" />}
            title="Plumbing"
            desc="Leaks, clogs, installs"
          />
          <ServiceCard
            icon={<Plug className="h-6 w-6" />}
            title="Electrical"
            desc="Sockets, wiring, lighting"
          />
          <ServiceCard
            icon={<WashingMachine className="h-6 w-6" />}
            title="Appliances"
            desc="Washer, fridge, oven"
          />
          <ServiceCard
            icon={<Hammer className="h-6 w-6" />}
            title="Carpentry"
            desc="Repairs, assembly, trim"
          />
          <ServiceCard
            icon={<Paintbrush className="h-6 w-6" />}
            title="Painting"
            desc="Rooms, doors, touch-ups"
          />
          <ServiceCard
            icon={<Fan className="h-6 w-6" />}
            title="HVAC"
            desc="AC, heating, maintenance"
          />
          <ServiceCard
            icon={<Bolt className="h-6 w-6" />}
            title="Emergency"
            desc="Urgent 24/7 jobs"
          />
          <ServiceCard
            icon={<Wrench className="h-6 w-6" />}
            title="More"
            desc="See all categories"
          />
        </div>
      </section>

      {/* Why Choose FixItNow */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
            Why choose FixItNow?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <FeatureCard icon="📅" title="Easy Booking" desc="Search, view availability, and book instantly" />
            <FeatureCard icon="📍" title="Live Tracking" desc="Track your technician in real time" />
            <FeatureCard icon="✅" title="Verified Pros" desc="Background-checked professionals" />
            <FeatureCard icon="💳" title="Secure Payments" desc="Transparent pricing and digital receipts" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
            How FixItNow works
          </h2>
          <div className="grid md:grid-cols-4 gap-4 md:gap-6">
            <Step
              number={1}
              title="Tell us what you need"
              desc="Choose a service and describe the job."
            />
            <Step
              number={2}
              title="Match with a pro"
              desc="We connect you with vetted, nearby pros."
            />
            <Step
              number={3}
              title="Track in real time"
              desc="See ETA, chat, and get updates as they work."
            />
            <Step
              number={4}
              title="Pay securely"
              desc="Pay with saved cards and rate your pro."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
            What our customers say
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Pros CTA */}
      <section id="pros" className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Pros: grow your business with FixItNow
            </h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> Free
                to join, pay per job — no monthly fees
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> Set
                your schedule and service radius
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{" "}
                Instant notifications for job requests
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{" "}
                Secure payouts and in‑app messaging
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/signup">Become a pro</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="#faq">Learn more</a>
              </Button>
            </div>
          </div>
          <Card className="glass border-0 shadow-xl">
            <CardContent className="p-0">
              <img
                src="/placeholder.svg"
                alt="Provider app preview"
                className="w-full h-[320px] object-cover rounded-xl"
                loading="lazy"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ placeholder anchor */}
      <section id="faq" className="container pb-16">
        <div className="rounded-2xl border p-6 md:p-8 bg-card">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
            Questions?
          </h3>
          <p className="text-muted-foreground mt-2">
            Ask anything about booking, pricing, or becoming a provider, and
            we'll help you get set up quickly.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link to="/login">Get started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  desc,
}) {
  return (
    <div className="group rounded-xl border p-5 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );

}

function Step({
  number,
  title,
  desc,
}) {
  return (
    <div className="rounded-xl border p-5 bg-card">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center font-bold">
          {number}
        </div>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-xl border p-5 bg-card">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 inline-flex items-center justify-center rounded-md bg-primary/10 text-xl">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsCarousel() {
  const items = [
    {
      stars: "⭐⭐⭐⭐⭐",
      text: "Quick service and professional work. Mike fixed our leak within an hour!",
      author: "Jennifer K.",
      service: "Plumbing",
    },
    {
      stars: "⭐⭐⭐⭐⭐",
      text: "Sarah was amazing! Explained everything clearly and fixed our electrical issue perfectly.",
      author: "David L.",
      service: "Electrical",
    },
    {
      stars: "⭐⭐⭐⭐⭐",
      text: "Reliable and efficient. The HVAC repair was done exactly as promised.",
      author: "Maria S.",
      service: "HVAC",
    },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${active * 100}%)`, width: `${items.length * 100}%` }}
        >
          {items.map((t, idx) => (
            <div key={idx} className="w-full px-2 shrink-0" style={{ width: `${100 / items.length}%` }}>
              <div className="rounded-xl border bg-card p-6 h-full">
                <div className="text-yellow-500 text-lg">{t.stars}</div>
                <p className="mt-3 text-muted-foreground">“{t.text}”</p>
                <div className="mt-4 text-sm">
                  <strong>{t.author}</strong>
                  <span className="ml-2 text-muted-foreground">{t.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === active ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}