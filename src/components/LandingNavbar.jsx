import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const navItems = [
  {
    label: "Features",
    items: [
      { label: "Delivery Tracking", description: "Real-time parcel and driver tracking" },
      { label: "Route Optimization", description: "Smart routing for faster deliveries" },
      { label: "Proof of Delivery", description: "Digital signatures & photo capture" },
    ],
  },
  {
    label: "Industries",
    items: [
      { label: "E-commerce", description: "Scale order fulfillment effortlessly" },
      { label: "Logistics Providers", description: "Manage fleets and drivers centrally" },
      { label: "Food & Grocery", description: "Keep perishables on time, every time" },
    ],
  },
  {
    label: "Integrations",
    items: [
      { label: "ERP & POS", description: "Sync orders from your business systems" },
      { label: "Communication", description: "Automated SMS & email notifications" },
      { label: "Payments", description: "Collect payments on delivery with ease" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Knowledge Base", description: "Guides, tutorials, and best practices" },
      { label: "Case Studies", description: "See how teams scale with M-PARCEL" },
      { label: "API Docs", description: "Build custom delivery experiences" },
    ],
  },
];

const simpleLinks = [
  { label: "Pricing", to: "#pricing" },
  { label: "Log in", to: "/login" },
];

const Dropdown = ({ label, items }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-1 text-sm font-medium text-slate-100 hover:text-white focus:outline-none">
        {label}
        <ChevronDownIcon className="h-4 w-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Menu.Items className="absolute left-0 mt-3 w-64 origin-top-left rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="space-y-3">
            {items.map((item) => (
              <Menu.Item key={item.label}>
                {({ active }) => (
                  <div
                    className={`rounded-md p-2 ${
                      active ? "bg-slate-100" : "bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const LandingNavbar = () => {
  return (
    <header className="bg-slate-900/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-lg font-bold text-white">
            MP
          </div>
          <span className="text-xl font-semibold text-white">M-PARCEL</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-100 lg:flex">
          {navItems.map((item) => (
            <Dropdown key={item.label} {...item} />
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
