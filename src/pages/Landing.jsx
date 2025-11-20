import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  MapIcon,
  ArrowUpRightIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import LandingNavbar from "../components/LandingNavbar";

const heroBackground =
  "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1600&q=80";

const stats = [
  { label: "Active SMEs", value: "2,500+" },
  { label: "Daily Deliveries", value: "35K" },
  { label: "Driver Network", value: "8,200" },
];

const logos = ["KoboFresh", "Nairobi Eats", "Krypton Logistics", "Savanna Stores", "BlueCargo"];

const featureCards = [
  {
    title: "Live Delivery Tracking",
    description: "See every driver and stop on a single interactive map with second-by-second pings.",
    icon: MapIcon,
  },
  {
    title: "Route Optimization",
    description: "Slash fuel costs by planning the most efficient routes for each SLA window.",
    icon: BoltIcon,
  },
  {
    title: "Proof of Delivery",
    description: "Capture signatures, photos, and notes directly from the driver handset.",
    icon: DevicePhoneMobileIcon,
  },
];

const solutionHighlights = [
  {
    title: "Customer Notifications",
    description: "Send branded SMS and WhatsApp alerts when orders are created, out for delivery, or complete.",
    bullets: ["Multi-channel templates", "ETA tracking pages", "Automatic retries"],
  },
  {
    title: "Fleet Intelligence",
    description: "Monitor utilization, driver performance, and recurring issues in a real-time control tower.",
    bullets: ["Heat maps & dwell time", "Driver scorecards", "Exception alerts"],
  },
];

const proofColumns = [
  {
    title: "Electronic POD",
    description: "Digital receipts with geo-coordinates, time stamps, and attachments stored for 5+ years.",
  },
  {
    title: "Live Tracking Links",
    description: "Reduce support calls by letting customers follow deliveries on a branded map.",
  },
  {
    title: "Route Planning",
    description: "Balance cost and speed using traffic-aware optimization across every vehicle type.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900/90 to-indigo-900" />

      <LandingNavbar />

      <main className="relative z-10 space-y-24">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-20 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <span className="inline-flex items-center rounded-full bg-rose-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
              Delivery OS for African teams
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Modern delivery software with the polish of global leaders
            </h1>
            <p className="text-lg text-slate-200">
              M-PARCEL brings driver tracking, proof-of-delivery, customer notifications, and payments into one
              experience—so you can scale faster without duct tape systems.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-rose-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400"
              >
                Start Free Trial
              </Link>
              <Link
                to="#demo"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white hover:border-white hover:bg-white/10"
              >
                Book a Demo
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 pt-6 text-slate-200">
              {stats.map((item) => (
                <div key={item.label}>
                  <p className="text-3xl font-bold text-white">{item.value}</p>
                  <p className="text-sm uppercase tracking-wide text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur">
            <div className="rounded-2xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-widest text-indigo-300">Control Tower</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">See every route, alert, and delivery in one pane</h3>
              <p className="mt-3 text-sm text-slate-300">
                Monitor SLA breaches, driver health, and payment status with auto-refreshing tiles.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">Customer Happiness</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">4.9/5 satisfaction score</p>
              <p className="text-sm text-slate-700">Based on surveys across Kenya, Uganda, and Tanzania.</p>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-5 text-sm text-slate-200">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Savings</p>
                <p className="text-2xl font-semibold text-white">-32%</p>
                <p className="text-xs text-slate-400">Average reduction in failed deliveries</p>
              </div>
              <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6">
            {logos.map((logo) => (
              <span key={logo} className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                {logo}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-10 px-6">
          <div className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">Feature suite</p>
            <h2 className="text-3xl font-semibold text-white">Everything a dispatch team expects in 2025</h2>
            <p className="text-slate-300">
              Inspired by global platforms like Detrack, crafted for the realities of African infrastructure.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <card.icon className="h-10 w-10 text-indigo-300" />
                <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/60 py-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row">
            <div className="flex-1 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">Playbooks that scale</p>
              <h2 className="text-3xl font-bold text-white">From first mile to last mile in one scroll</h2>
              <p className="text-slate-300">
                Build repeatable workflows with automation triggers, escalation logic, and KPI dashboards that your
                leadership team will actually read.
              </p>
              {solutionHighlights.map((solution) => (
                <div key={solution.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-xl font-semibold text-white">{solution.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{solution.description}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {solution.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-slate-200">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-300" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-slate-900 p-8 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">Live dashboard</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Dispatch map with proactive alerts</h3>
                <p className="mt-2 text-sm text-slate-200">
                  Highlight high-risk orders, stalled drivers, and SLA breaches before customers notice.
                </p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/10 p-8 text-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Automation score</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">87%</p>
                <p className="text-sm text-slate-600">Average workflows automated after week 4.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Driver app</p>
                <p className="mt-3 text-lg font-semibold text-white">Offline-first with automatic sync</p>
                <p className="text-sm text-slate-300">
                  Drivers capture POD even without data connectivity; entries sync once they’re back online.
                </p>
                <RocketLaunchIcon className="mt-6 h-12 w-12 text-indigo-300" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-10 px-6">
          <div className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Trust & transparency</p>
            <h2 className="text-3xl font-semibold text-white">Electronic proof reimagined</h2>
            <p className="text-slate-300">
              Keep every stakeholder updated with receipts that carry context, media, and fraud-proof data.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {proofColumns.map((column) => (
              <div key={column.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{column.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{column.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="bg-white py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">Ready to launch?</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Join teams that deliver with the polish of Detrack, built for Africa
            </h2>
            <p className="text-slate-600">
              Spin up a sandbox in minutes, invite your drivers, and start shipping real orders with instant visibility.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Launch Sandbox
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-900 px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-900/5"
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
