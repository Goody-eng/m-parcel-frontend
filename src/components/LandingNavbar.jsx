import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  MapIcon,
  ArrowsRightLeftIcon,
  CursorArrowRaysIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  GlobeEuropeAfricaIcon,
  CpuChipIcon,
  ChatBubbleBottomCenterIcon,
  InboxStackIcon,
  BookOpenIcon,
  SparklesIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  {
    label: "Features",
    caption: "Modern delivery tooling for your whole team",
    items: [
      {
        label: "Live Delivery Tracking",
        description: "Watch every driver on the map with second-by-second updates.",
        icon: MapIcon,
      },
      {
        label: "Smart Route Optimization",
        description: "Balance speed and cost with AI-assisted routing decisions.",
        icon: ArrowsRightLeftIcon,
      },
      {
        label: "Proof Of Delivery",
        description: "Capture signatures, photos, and timestamps on any device.",
        icon: CursorArrowRaysIcon,
      },
    ],
  },
  {
    label: "Industries",
    caption: "Purpose-built playbooks for each vertical",
    items: [
      {
        label: "Logistics & 3PL",
        description: "Centralize fleets, subcontractors, and client SLAs.",
        icon: TruckIcon,
      },
      {
        label: "Retail & E‑commerce",
        description: "Delight customers with branded notifications & ETAs.",
        icon: BuildingStorefrontIcon,
      },
      {
        label: "Food & Beverage",
        description: "Temperature-sensitive workflows with driver checklists.",
        icon: GlobeEuropeAfricaIcon,
      },
    ],
  },
  {
    label: "Integrations",
    caption: "Connect M‑PARCEL to the stack you already trust",
    items: [
      {
        label: "Order Sources",
        description: "Sync from ERPs, POS, or marketplaces with webhooks.",
        icon: CpuChipIcon,
      },
      {
        label: "Customer Messaging",
        description: "Trigger SMS, WhatsApp, and email journeys automatically.",
        icon: ChatBubbleBottomCenterIcon,
      },
      {
        label: "Payments & Finance",
        description: "Collect COD, reconcile MPESA, and automate invoicing.",
        icon: InboxStackIcon,
      },
    ],
  },
  {
    label: "Resources",
    caption: "Templates, benchmarks, and launch guides",
    items: [
      {
        label: "Help Centre",
        description: "Step-by-step guides for admins, SMEs, and drivers.",
        icon: BookOpenIcon,
      },
      {
        label: "Customer Stories",
        description: "See how teams cut delivery costs by up to 32%.",
        icon: SparklesIcon,
      },
      {
        label: "API Reference",
        description: "Build custom workflows on top of our open APIs.",
        icon: CodeBracketIcon,
      },
    ],
  },
];

const simpleLinks = [
  { label: "Pricing", to: "#pricing" },
  { label: "Log in", to: "/login" },
];

const LandingNavbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuToggle = (label) => {
    setActiveMenu(label);
  };

  const isMenuActive = (label) => activeMenu === label;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-lg font-bold text-white">
            MP
          </div>
          <span className="text-xl font-semibold text-white">M-PARCEL</span>
        </Link>

        <nav className="relative hidden items-center gap-6 text-sm text-slate-100 lg:flex">
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              <button
                onMouseEnter={() => handleMenuToggle(item.label)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isMenuActive(item.label)
                    ? "bg-white/10 text-white"
                    : "text-slate-100 hover:text-white"
                }`}
              >
                {item.label}
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    isMenuActive(item.label) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMenuActive(item.label) && (
                <div className="absolute left-1/2 top-full mt-4 w-[28rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-indigo-300">
                    {item.caption}
                  </p>
                  <div className="space-y-4">
                    {item.items.map((subItem) => (
                      <div
                        key={subItem.label}
                        className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-indigo-300/50 hover:bg-white/10"
                      >
                        <subItem.icon className="mt-1 h-6 w-6 text-indigo-300" />
                        <div>
                          <p className="font-semibold text-white">{subItem.label}</p>
                          <p className="text-sm text-slate-300">{subItem.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {simpleLinks.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm font-medium text-slate-100 hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link
            to="/signup"
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-400"
          >
            Get Started
          </Link>
        </nav>

        <div className="lg:hidden">
          <Link
            to="/signup"
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
