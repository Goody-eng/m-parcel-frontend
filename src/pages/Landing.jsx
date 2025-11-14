import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";

const heroBackground =
  "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1600&q=80";

const stats = [
  { label: "Active SMEs", value: "2,500+" },
  { label: "Daily Deliveries", value: "35K" },
  { label: "Driver Network", value: "8,200" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-indigo-900" />

      <LandingNavbar />

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20 lg:flex-row lg:items-center">
        <section className="max-w-2xl space-y-8">
          <span className="inline-flex items-center rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-200">
            Simplifying deliveries for modern teams
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Manage every parcel with real-time visibility & control
          </h1>
          <p className="text-lg text-slate-200">
            Eliminate manual processes and scale your operations with M-PARCEL’s delivery management suite—
            including electronic proof of delivery, live driver tracking, customer notifications, and smart route
            optimization.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400"
            >
              Get Started Free
            </Link>
            <Link
              to="#book-demo"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white hover:bg-white/10"
            >
              Book a Demo
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 pt-8 text-slate-200">
            {stats.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="text-sm uppercase tracking-wide text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-xl space-y-6 rounded-2xl bg-white/5 p-8 shadow-xl backdrop-blur lg:ml-auto">
          <h2 className="text-xl font-semibold text-white">Why teams choose M-PARCEL</h2>
          <ul className="space-y-4 text-sm text-slate-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
              Keep customers informed with automated ETA alerts and live tracking links.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
              Equip drivers with mobile tools for digital proof-of-delivery and instant updates.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-teal-400" />
              Monitor operations in a single dashboard with metrics that matter for your business.
            </li>
          </ul>
          <div className="flex items-center gap-4 rounded-xl bg-slate-900/80 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500 text-lg font-bold">
              4.9
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Customer satisfaction rating</p>
              <p className="text-xs text-slate-300">Based on feedback from delivery teams across Africa</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
