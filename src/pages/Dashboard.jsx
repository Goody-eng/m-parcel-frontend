import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  WalletIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultMapCenter = {
  lat: -1.286389,
  lng: 36.817223,
};

const roleMeta = {
  admin: {
    title: "Operations Control Center",
    subtitle: "Monitor fleet, users, and delivery performance in real time.",
    endpoint: "/dashboard/admin",
    cards: [
      { 
        key: "totalOrders", 
        label: "Total Orders", 
        accent: "text-indigo-500",
        onClick: (navigate) => navigate("/dashboard?section=orders"),
      },
      { 
        key: "pendingOrders", 
        label: "Pending", 
        accent: "text-amber-500",
        onClick: (navigate) => navigate("/dashboard?section=orders&filter=Pending"),
      },
      { 
        key: "deliveredOrders", 
        label: "Delivered", 
        accent: "text-emerald-500",
        onClick: (navigate) => navigate("/dashboard?section=orders&filter=Delivered"),
      },
      { 
        key: "totalUsers", 
        label: "Platform Users", 
        accent: "text-sky-500",
        onClick: (navigate) => navigate("/dashboard?section=users"),
      },
      { 
        key: "activePanicAlerts", 
        label: "Active Panic Alerts", 
        accent: "text-red-500",
        onClick: (navigate) => navigate("/dashboard?section=panic"),
      },
    ],
  },
  sme: {
    title: "Delivery Operations Overview",
    subtitle: "Track customer orders, driver performance, and delivery SLAs.",
    endpoint: "/dashboard/sme",
    cards: [
      { key: "totalOrders", label: "Orders Created", accent: "text-indigo-500" },
      { key: "pendingOrders", label: "In Queue", accent: "text-amber-500" },
      { key: "deliveredOrders", label: "Delivered", accent: "text-emerald-500" },
    ],
  },
  driver: {
    title: "Driver Mission Board",
    subtitle: "Stay on top of assigned deliveries and completion targets.",
    endpoint: "/dashboard/driver",
    cards: [
      { key: "totalOrders", label: "Assigned", accent: "text-indigo-200" },
      { key: "inTransitOrders", label: "In Transit", accent: "text-amber-200" },
      { key: "deliveredOrders", label: "Delivered", accent: "text-emerald-200" },
    ],
  },
};

const roleBoards = {
  admin: [
    {
      title: "Unassigned",
      accent: "bg-amber-50 border-amber-200",
      items: [
        { ref: "MP-613996", pickup: "Githurai 40", dropoff: "Githurai Bus Stop", eta: "15 min" },
        { ref: "MP-613840", pickup: "Thika Road Mall", dropoff: "Kahawa Sukari", eta: "22 min" },
      ],
    },
    {
      title: "Dispatching",
      accent: "bg-sky-50 border-sky-200",
      items: [
        { ref: "MP-240834", pickup: "CBD Fulfillment Hub", dropoff: "Ridgeways Estate", eta: "Queued" },
      ],
    },
    {
      title: "In Progress",
      accent: "bg-emerald-50 border-emerald-200",
      items: [
        { ref: "MP-613920", pickup: "Industrial Area", dropoff: "Karen Hardy", eta: "32 min" },
        { ref: "MP-613840", pickup: "Lavington Curve", dropoff: "Gigiri Embassy Row", eta: "41 min" },
      ],
    },
  ],
  sme: [
    {
      title: "Queue",
      accent: "bg-amber-50 border-amber-200",
      items: [
        { ref: "MP-220123", pickup: "Kasarani Mall", dropoff: "Safari Park", eta: "Awaiting driver" },
      ],
    },
    {
      title: "On The Road",
      accent: "bg-blue-50 border-blue-200",
      items: [
        { ref: "MP-220111", pickup: "Ngara Textiles", dropoff: "Westlands", eta: "17 min" },
        { ref: "MP-220112", pickup: "City Market", dropoff: "Upper Hill", eta: "12 min" },
      ],
    },
    {
      title: "Completed Today",
      accent: "bg-emerald-50 border-emerald-200",
      items: [
        { ref: "MP-220085", pickup: "Gikomba", dropoff: "South B", eta: "Delivered" },
      ],
    },
  ],
  driver: [
    {
      title: "Assigned",
      accent: "bg-blue-50 border-blue-200",
      items: [
        { ref: "MP-110012", pickup: "Kahawa Wendani", dropoff: "Donholm", eta: "Pickup 14:10" },
      ],
    },
    {
      title: "Pickup",
      accent: "bg-indigo-50 border-indigo-200",
      items: [
        { ref: "MP-110013", pickup: "Garden Estate", dropoff: "Lang'ata", eta: "Awaiting OTP" },
      ],
    },
    {
      title: "History",
      accent: "bg-slate-50 border-slate-200",
      items: [
        { ref: "MP-110001", pickup: "Embakasi", dropoff: "CBD", eta: "Paid" },
      ],
    },
  ],
};

const roleMapPoints = {
  admin: [
    {
      id: 1,
      label: "Mega Fulfillment Hub",
      status: "Dispatching",
      lat: -1.233,
      lng: 36.883,
    },
    {
      id: 2,
      label: "CBD Drop-off",
      status: "Awaiting driver",
      lat: -1.286,
      lng: 36.8219,
    },
    {
      id: 3,
      label: "Karen Distribution",
      status: "In transit",
      lat: -1.325,
      lng: 36.7205,
    },
  ],
  sme: [
    { id: 1, label: "Warehouse - Githurai", status: "Queued", lat: -1.2208, lng: 36.9021 },
    { id: 2, label: "Customer - Kasarani", status: "Driver en-route", lat: -1.2243, lng: 36.8961 },
    { id: 3, label: "Customer - Ruaraka", status: "Delivered", lat: -1.245, lng: 36.886 },
  ],
  driver: [
    { id: 1, label: "Pickup - Ngumba Rd", status: "Scan parcel", lat: -1.226, lng: 36.897 },
    { id: 2, label: "Drop-off - Githurai Stadium", status: "ETA 12 min", lat: -1.228, lng: 36.903 },
  ],
};

const generateRegistrationData = (role, stats) => {
  const baseCustomers = Math.max(stats?.totalUsers || 6, 6);
  const baseDrivers = Math.max(stats?.deliveredOrders || 4, 4);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((day, index) => ({
    day,
    customers: Math.round((baseCustomers / 6) * (index / labels.length) * 1.4 + index * 0.2),
    drivers: Math.round((baseDrivers / 5) * (index / labels.length) * 1.6 + index * 0.3),
  }));
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <div className="flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent, onClick, clickable = false, variant = "light" }) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm ring-1 transition ${
        isDark
          ? "bg-white/10 text-white ring-white/20"
          : "bg-white ring-slate-200/60"
      } ${clickable ? "cursor-pointer hover:shadow-md hover:ring-2 hover:ring-indigo-300" : ""}`}
      onClick={onClick}
    >
      <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
    {message}
  </div>
);

const RegistrationChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="customers" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="drivers" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="day" stroke="#94a3b8" />
      <Tooltip
        contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
      />
      <Area
        type="monotone"
        dataKey="customers"
        stroke="#6366f1"
        fillOpacity={1}
        fill="url(#customers)"
      />
      <Area
        type="monotone"
        dataKey="drivers"
        stroke="#14b8a6"
        fillOpacity={1}
        fill="url(#drivers)"
      />
    </AreaChart>
  </ResponsiveContainer>
);

const NairobiMap = ({ points, heightClass = "h-64" }) => (
  <MapContainer
    center={[defaultMapCenter.lat, defaultMapCenter.lng]}
    zoom={12}
    scrollWheelZoom={false}
    className={`w-full rounded-2xl ${heightClass}`}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {points.map((point) => (
      <Marker
        key={point.id}
        position={[point.lat, point.lng]}
        icon={markerIcon}
      >
        <Popup>
          <p className="font-semibold text-slate-900">{point.label}</p>
          <p className="text-sm text-slate-600">{point.status}</p>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

const OrdersBoard = ({ columns }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {columns.map((column) => (
      <div
        key={column.title}
        className={`rounded-2xl border p-4 shadow-sm ${column.accent}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">{column.title}</h3>
          <span className="text-xs text-slate-500">{column.items.length} orders</span>
        </div>
        <div className="space-y-3">
          {column.items.map((item) => (
            <div
              key={item.ref}
              className="rounded-xl bg-white/80 p-3 text-sm shadow-sm ring-1 ring-white/50"
            >
              <p className="font-semibold text-slate-800">{item.ref}</p>
              <p className="text-xs text-slate-500">{item.pickup} → {item.dropoff}</p>
              <p className="text-xs font-medium text-slate-600">{item.eta}</p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const StatsGrid = ({ cards, stats, navigate, variant = "light" }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => (
      <StatCard
        key={card.key}
        label={card.label}
        value={stats?.[card.key] ?? 0}
        accent={card.accent}
        clickable={!!card.onClick}
        onClick={() => card.onClick && navigate && card.onClick(navigate)}
        variant={variant}
      />
    ))}
  </div>
);

const formatCurrency = (value = 0) => `KES ${Number(value || 0).toLocaleString()}`;

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case "InTransit":
      return "bg-indigo-100 text-indigo-700";
    case "Delivered":
      return "bg-emerald-100 text-emerald-700";
    case "Pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const DriverMissionPanel = ({ order }) => {
  if (!order) {
    return <EmptyState message="No active deliveries assigned yet." />;
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">On Demand</p>
          <h2 className="text-2xl font-semibold text-slate-900">Order {order.orderId}</h2>
          <p className="text-sm text-slate-500">Updated {new Date(order.updatedAt || Date.now()).toLocaleTimeString()}</p>
        </div>
        <span className={`rounded-full px-4 py-1 text-xs font-semibold ${getStatusBadgeClasses(order.status)}`}>
          {order.status || "Pending"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Customer</p>
            <p className="text-base font-semibold text-slate-900">{order.customerName || "Walk-in customer"}</p>
            <p className="text-sm text-slate-500">{order.customerPhone || "N/A"}</p>
          </div>
          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
            >
              <PhoneIcon className="h-4 w-4" />
              Call
            </a>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <TruckIcon className="h-4 w-4 text-indigo-500" />
              Vehicle & Service
            </div>
            <p className="text-sm text-slate-500">{order.vehicleType || "Van"}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">On-Demand</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">OTP Required</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <WalletIcon className="h-4 w-4 text-emerald-500" />
              Payment
            </div>
            <p className="text-2xl font-semibold text-slate-900">{formatCurrency(order.amount)}</p>
            <p className="text-sm text-slate-500">Wallet balance: {order.paymentStatus || "COD"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Pickup</p>
            <p className="mt-1 flex items-start gap-2 text-sm text-slate-700">
              <MapPinIcon className="mt-0.5 h-4 w-4 text-indigo-500" />
              {order.pickupAddress || "Awaiting confirmation"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Delivery</p>
            <p className="mt-1 flex items-start gap-2 text-sm text-slate-700">
              <MapPinIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
              {order.dropoffAddress || "Awaiting confirmation"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverTimeline = ({ status }) => {
  const steps = [
    { label: "Unassigned", description: "Awaiting dispatcher" },
    { label: "Dispatching", description: "Driver notified" },
    { label: "In Progress", description: "Parcel on the move" },
    { label: "Completed", description: "Proof submitted" },
  ];

  const statusIndexMap = {
    Pending: 1,
    InTransit: 2,
    Delivered: 3,
  };

  const activeIndex = statusIndexMap[status] ?? 0;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Journey</p>
          <h3 className="text-lg font-semibold text-slate-900">Today's mission status</h3>
        </div>
        <span className="text-xs text-slate-500">Auto-refresh</span>
      </div>
      <ol className="mt-4 space-y-4">
        {steps.map((step, index) => {
          const completed = index <= activeIndex;
          return (
            <li key={step.label} className="flex items-start gap-3">
              <span
                className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  completed ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {completed ? <CheckCircleIcon className="h-4 w-4 text-white" /> : index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const DriverWalletCard = ({ amount = 0, delivered = 0 }) => (
  <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg">
    <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Wallet</p>
    <h3 className="mt-2 text-2xl font-semibold">KES {(Number(amount) || 0).toLocaleString()}</h3>
    <p className="text-sm text-emerald-50">Projected payout for today's route</p>
    <div className="mt-6 flex items-center justify-between text-sm">
      <div>
        <p className="text-emerald-100">Completed</p>
        <p className="text-lg font-semibold text-white">{delivered}</p>
      </div>
      <div className="text-right">
        <p className="text-emerald-100">Next cashout</p>
        <p className="font-semibold">Friday, 4:00pm</p>
      </div>
    </div>
  </div>
);

const KanbanBoard = ({ columns }) => (
  <div className="space-y-4">
    {columns.map((column) => (
      <div key={column.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{column.title}</p>
            <h3 className="text-xl font-semibold text-slate-900">{column.items.length} orders</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Live
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {column.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Nothing here yet.
            </div>
          ) : (
            column.items.map((item) => (
              <div
                key={item.ref}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-700"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{item.ref}</p>
                  <span className="text-xs text-slate-500">{item.eta}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.pickup} → {item.dropoff}</p>
              </div>
            ))
          )}
        </div>
      </div>
    ))}
  </div>
);

const AdminDashboardView = ({
  config,
  stats,
  chartData,
  mapPoints,
  boardColumns,
  panicAlerts,
  navigate,
  onAcknowledgeAlert,
  onResolveAlert,
}) => (
  <div className="space-y-8">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-900 to-slate-900 p-8 text-white shadow-lg">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">Admin Center</p>
            <h1 className="text-3xl font-bold">Operations Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Monitor registrations, drivers, orders, and panic alerts in one glance.
            </p>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white">
            Auto-refresh every 10s
          </div>
        </div>
        <div className="mt-6">
          <StatsGrid cards={config.cards} stats={stats} navigate={navigate} variant="dark" />
        </div>
      </div>
    </section>

    {panicAlerts.length > 0 && (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-red-500">Active Panic Alerts</p>
                <h3 className="text-2xl font-semibold text-red-900">{panicAlerts.length} driver(s) flagged</h3>
              </div>
              <button
                onClick={() => navigate("/dashboard?section=panic")}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100/70"
              >
                Open panic center
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {panicAlerts.slice(0, 2).map((alert) => (
                <div key={alert._id} className="rounded-2xl bg-white/70 p-4 shadow-inner ring-1 ring-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{alert.driverName || alert.driver?.name}</p>
                      <p className="text-xs text-slate-500">{alert.driverPhone || alert.driver?.phone}</p>
                      {alert.location && (
                        <p className="text-xs text-slate-500">
                          {alert.location.lat?.toFixed(4)}, {alert.location.lon?.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onAcknowledgeAlert(alert._id)}
                      className="flex-1 rounded-xl bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => onResolveAlert(alert._id)}
                      className="flex-1 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Registrations</p>
            <h2 className="text-lg font-semibold text-slate-900">Customers & Drivers</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Last week
          </span>
        </div>
        <RegistrationChart data={chartData} />
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Field ops</p>
            <h2 className="text-lg font-semibold text-slate-900">Live Nairobi map</h2>
          </div>
          <span className="text-xs text-slate-500">Updated every 10s</span>
        </div>
        <NairobiMap points={mapPoints} heightClass="h-72" />
      </div>
    </div>

  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Order board</p>
          <h2 className="text-lg font-semibold text-slate-900">Dispatch pipeline</h2>
        </div>
        <button
          onClick={() => navigate("/dashboard?section=orders")}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
        >
          View insights
        </button>
      </div>
      {boardColumns.some((col) => col.items.length > 0) ? (
        <OrdersBoard columns={boardColumns} />
      ) : (
        <EmptyState message="No orders to display. Orders will appear here as they are created." />
      )}
    </div>
  </div>
);

const DriverDashboardView = ({ config, stats, orders, boardColumns, mapPoints }) => {
  const activeOrder =
    orders.find((o) => o.status === "InTransit" || o.status === "Pending") || orders[0];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-950 p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">Driver HQ</p>
            <h1 className="text-3xl font-bold">Today's mission board</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-200">
              Track assignments, earnings, and next stops without switching apps.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold">Last sync • 30s ago</div>
        </div>
        <div className="mt-6">
          <StatsGrid cards={config.cards} stats={stats} navigate={() => {}} variant="dark" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <DriverMissionPanel order={activeOrder} />
        <div className="space-y-6">
          <DriverTimeline status={activeOrder?.status} />
          <DriverWalletCard amount={activeOrder?.amount || stats?.deliveredOrders * 120} delivered={stats?.deliveredOrders || 0} />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Live map</p>
            <h2 className="text-lg font-semibold text-slate-900">Route preview</h2>
          </div>
          <span className="text-xs text-slate-500">Tap marker for details</span>
        </div>
        <NairobiMap points={mapPoints} heightClass="h-72" />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Queues</p>
            <h2 className="text-lg font-semibold text-slate-900">Tasks timeline</h2>
          </div>
          <span className="text-xs text-slate-500">Newest on top</span>
        </div>
        {boardColumns.some((col) => col.items.length > 0) ? (
          <OrdersBoard columns={boardColumns} />
        ) : (
          <EmptyState message="No tasks to display." />
        )}
      </div>
    </div>
  );
};

const SmeDashboardView = ({ config, stats, boardColumns, mapPoints, chartData, onCreateOrder, navigate }) => (
  <div className="space-y-8">
    <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-slate-900 to-slate-950 p-8 text-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-100">SME cockpit</p>
          <h1 className="text-3xl font-bold">Delivery operations overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100">
            Balance queues, drivers, and customer updates from a single canvas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCreateOrder}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white"
          >
            <PlusIcon className="h-4 w-4" />
            New order
          </button>
          <button
            onClick={() => navigate("/dashboard?section=orders")}
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            See insights
          </button>
        </div>
      </div>
      <div className="mt-6">
        <StatsGrid cards={config.cards} stats={stats} navigate={() => {}} variant="dark" />
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
      <KanbanBoard columns={boardColumns} />
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Field view</p>
              <h2 className="text-lg font-semibold text-slate-900">Routes & drivers</h2>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                Today
              </button>
              <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                Week
              </button>
            </div>
          </div>
          <NairobiMap points={mapPoints} heightClass="h-[420px]" />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Fulfilment pulse</p>
              <h2 className="text-lg font-semibold text-slate-900">Registrations & conversions</h2>
            </div>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <RegistrationChart data={chartData} />
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [panicAlerts, setPanicAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = user?.role || "sme";

  const config = useMemo(() => roleMeta[role] || roleMeta.sme, [role]);
  const chartData = useMemo(() => generateRegistrationData(role, stats || {}), [role, stats]);
  
  // Generate real map points from orders
  const mapPoints = useMemo(() => {
    if (!orders || orders.length === 0) {
      return roleMapPoints[role] || roleMapPoints.sme; // Fallback to static data
    }
    
    // Create map points from real orders (pickup locations)
    return orders.slice(0, 3).map((order, index) => ({
      id: index + 1,
      label: `Order ${order.orderId}`,
      status: order.status,
      lat: defaultMapCenter.lat + (Math.random() - 0.5) * 0.1, // Simulated - in production use real coordinates
      lng: defaultMapCenter.lng + (Math.random() - 0.5) * 0.1,
    }));
  }, [orders, role]);

  // Generate real order board from actual orders
  const boardColumns = useMemo(() => {
    if (!orders || orders.length === 0) {
      return roleBoards[role] || roleBoards.sme; // Fallback to static data
    }

    if (role === "admin") {
      return [
        {
          title: "Unassigned",
          accent: "bg-amber-50 border-amber-200",
          items: orders
            .filter((o) => o.status === "Pending" && !o.assignedDriver)
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Awaiting driver",
            })),
        },
        {
          title: "Dispatching",
          accent: "bg-sky-50 border-sky-200",
          items: orders
            .filter((o) => o.status === "Pending" && o.assignedDriver)
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Queued",
            })),
        },
        {
          title: "In Progress",
          accent: "bg-emerald-50 border-emerald-200",
          items: orders
            .filter((o) => o.status === "InTransit")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "In transit",
            })),
        },
      ];
    } else if (role === "sme") {
      return [
        {
          title: "Queue",
          accent: "bg-amber-50 border-amber-200",
          items: orders
            .filter((o) => o.status === "Pending")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Awaiting driver",
            })),
        },
        {
          title: "On The Road",
          accent: "bg-blue-50 border-blue-200",
          items: orders
            .filter((o) => o.status === "InTransit")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "In transit",
            })),
        },
        {
          title: "Completed Today",
          accent: "bg-emerald-50 border-emerald-200",
          items: orders
            .filter((o) => o.status === "Delivered")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Delivered",
            })),
        },
      ];
    } else {
      // Driver
      return [
        {
          title: "Assigned",
          accent: "bg-blue-50 border-blue-200",
          items: orders
            .filter((o) => o.status === "Pending")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Pickup",
            })),
        },
        {
          title: "In Transit",
          accent: "bg-indigo-50 border-indigo-200",
          items: orders
            .filter((o) => o.status === "InTransit")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Delivering",
            })),
        },
        {
          title: "History",
          accent: "bg-slate-50 border-slate-200",
          items: orders
            .filter((o) => o.status === "Delivered")
            .slice(0, 5)
            .map((o) => ({
              ref: o.orderId,
              pickup: o.pickupAddress?.substring(0, 20) + "...",
              dropoff: o.dropoffAddress?.substring(0, 20) + "...",
              eta: "Delivered",
            })),
        },
      ];
    }
  }, [orders, role]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const endpoint = config.endpoint;
      // Fetch stats
      const statsResponse = await axiosClient.get(endpoint);
      setStats(statsResponse.data);
      console.log("📊 Dashboard stats loaded:", statsResponse.data);

      // Fetch orders based on role
      let ordersResponse;
      if (role === "admin") {
        ordersResponse = await axiosClient.get("/orders/all");
      } else if (role === "sme") {
        ordersResponse = await axiosClient.get("/orders/mine");
      } else if (role === "driver") {
        const [assignedRes, completedRes] = await Promise.all([
          axiosClient.get("/orders/assigned"),
          axiosClient.get("/orders/completed"),
        ]);
        ordersResponse = { data: [...assignedRes.data, ...completedRes.data] };
      } else {
        ordersResponse = { data: [] };
      }

      setOrders(ordersResponse.data || []);

      // Fetch active panic alerts for admin
      if (role === "admin") {
        try {
          console.log("🔍 Fetching active panic alerts from API...");
          const panicResponse = await axiosClient.get("/panic/active");
          console.log("📥 Panic alerts API response:", panicResponse.data);
          
          // Ensure response is an array
          const alerts = Array.isArray(panicResponse.data) ? panicResponse.data : [];
          setPanicAlerts(alerts);
          console.log(`🚨 Active panic alerts loaded: ${alerts.length}`);
          if (alerts.length > 0) {
            alerts.forEach(alert => {
              console.log(`   - ${alert.driverName || alert.driver?.name} (${alert._id})`);
            });
          }
        } catch (panicErr) {
          console.error("❌ Failed to fetch panic alerts:", panicErr);
          console.error("❌ Error details:", panicErr.response?.data || panicErr.message);
          setPanicAlerts([]);
        }
      }

      console.log(`✅ Dashboard loaded: ${statsResponse.data.totalOrders || 0} total orders, ${ordersResponse.data?.length || 0} orders fetched for board`);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setError(
        err.response?.data?.message || "We couldn't load your dashboard stats right now."
      );
    } finally {
      setLoading(false);
    }
  }, [config, token, role]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 10 seconds for admin (to catch panic alerts quickly)
    // 30 seconds for other roles
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing dashboard data...");
      fetchDashboardData();
    }, role === "admin" ? 10000 : 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData, role]);

  // Render section views for admin
  if (role === "admin" && section) {
    if (section === "users") {
      return <UsersSection onBack={() => navigate("/dashboard")} />;
    }
    if (section === "orders") {
      const filter = searchParams.get("filter");
      return <OrdersInsightsSection filter={filter} onBack={() => navigate("/dashboard")} />;
    }
    if (section === "panic") {
      return <PanicAlertsSection onBack={() => navigate("/dashboard")} />;
    }
  }

  const acknowledgeAlert = async (id) => {
    try {
      await axiosClient.patch(`/panic/${id}/acknowledge`);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to acknowledge alert");
    }
  };

  const resolveAlert = async (id) => {
    if (!window.confirm("Mark this panic alert as resolved?")) return;
    try {
      await axiosClient.patch(`/panic/${id}/resolve`);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to resolve alert");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <EmptyState message="Loading your delivery insights..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <EmptyState message={error} />
      </DashboardLayout>
    );
  }

  let content;
  if (role === "admin") {
    content = (
      <AdminDashboardView
        config={config}
        stats={stats}
        chartData={chartData}
        mapPoints={mapPoints}
        boardColumns={boardColumns}
        panicAlerts={panicAlerts}
        navigate={navigate}
        onAcknowledgeAlert={acknowledgeAlert}
        onResolveAlert={resolveAlert}
      />
    );
  } else if (role === "driver") {
    content = (
      <DriverDashboardView
        config={config}
        stats={stats}
        orders={orders}
        boardColumns={boardColumns}
        mapPoints={mapPoints}
      />
    );
  } else {
    content = (
      <SmeDashboardView
        config={config}
        stats={stats}
        boardColumns={boardColumns}
        mapPoints={mapPoints}
        chartData={chartData}
        onCreateOrder={() => navigate("/orders/create")}
        navigate={navigate}
      />
    );
  }

  return <DashboardLayout>{content}</DashboardLayout>;
};

// Users Section Component
const UsersSection = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosClient.get("/users");
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      sme: "bg-blue-100 text-blue-800",
      driver: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || "bg-gray-100 text-gray-800"}`}>
        {role?.toUpperCase() || "N/A"}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
              <p className="text-sm text-slate-600 mt-1">View and manage all platform users</p>
            </div>
          </div>
        </div>

        {loading ? (
          <EmptyState message="Loading users..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600">
                            <PhoneIcon className="w-4 h-4" />
                            {user.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit User"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete User"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Orders Insights Section Component
const OrdersInsightsSection = ({ filter, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosClient.get("/orders/all");
        setOrders(filter ? data.filter(o => o.status === filter) : data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-amber-100 text-amber-800",
      InTransit: "bg-blue-100 text-blue-800",
      Delivered: "bg-emerald-100 text-emerald-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Orders Insights</h1>
              <p className="text-sm text-slate-600 mt-1">
                {filter ? `Showing ${filter} orders` : "View all orders across the platform"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <EmptyState message="Loading orders..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">{order.orderId}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{order.customerName}</p>
                            <p className="text-sm text-slate-500">{order.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                          KES {order.amount?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Panic Alerts Section Component
const PanicAlertsSection = ({ onBack }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await axiosClient.get("/panic/history");
        // Ensure data is an array
        if (Array.isArray(data)) {
          setAlerts(data);
        } else if (data && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        } else {
          console.warn("Panic alerts response is not an array:", data);
          setAlerts([]);
        }
      } catch (err) {
        console.error("Error fetching panic alerts:", err);
        setError(err.response?.data?.message || "Failed to load panic alerts");
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      Active: "bg-red-100 text-red-800",
      Acknowledged: "bg-blue-100 text-blue-800",
      Resolved: "bg-emerald-100 text-emerald-800",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Panic Alert History</h1>
              <p className="text-sm text-slate-600 mt-1">View all panic alerts and their status</p>
            </div>
          </div>
        </div>

        {loading ? (
          <EmptyState message="Loading panic alerts..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Triggered</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {!Array.isArray(alerts) || alerts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No panic alerts found
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                          {alert.driverName || alert.driver?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {alert.driverPhone || alert.driver?.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(alert.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(alert.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {alert.location 
                            ? `${alert.location.lat?.toFixed(4)}, ${alert.location.lon?.toFixed(4)}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
