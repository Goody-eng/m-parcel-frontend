import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { PlusIcon } from "@heroicons/react/24/outline";
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
      { key: "totalOrders", label: "Total Orders", accent: "text-indigo-500" },
      { key: "pendingOrders", label: "Pending", accent: "text-amber-500" },
      { key: "deliveredOrders", label: "Delivered", accent: "text-emerald-500" },
      { key: "totalUsers", label: "Platform Users", accent: "text-sky-500" },
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
      { key: "totalOrders", label: "Assigned", accent: "text-indigo-500" },
      { key: "inTransitOrders", label: "In Transit", accent: "text-amber-500" },
      { key: "deliveredOrders", label: "Delivered", accent: "text-emerald-500" },
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

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-3 text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
  </div>
);

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

const NairobiMap = ({ points }) => (
  <MapContainer
    center={[defaultMapCenter.lat, defaultMapCenter.lng]}
    zoom={12}
    scrollWheelZoom={false}
    className="h-64 w-full rounded-2xl"
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

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
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
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing dashboard data...");
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
            <p className="text-sm text-slate-600">{config.subtitle}</p>
          </div>
          {role === "sme" && (
            <button
              onClick={() => navigate("/orders/create")}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              Create Order
            </button>
          )}
        </div>

        {loading ? (
          <EmptyState message="Loading your delivery insights..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {config.cards.map((card) => (
              <StatCard
                key={card.key}
                label={card.label}
                value={stats?.[card.key] ?? 0}
                accent={card.accent}
              />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Registrations</p>
                    <h2 className="text-lg font-semibold text-slate-900">Growth over the last week</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Last 7 days
                  </span>
                </div>
                <RegistrationChart data={chartData} />
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Field Ops</p>
                    <h2 className="text-lg font-semibold text-slate-900">Live map — Nairobi</h2>
                  </div>
                  <span className="text-xs text-slate-500">Updates every 30s</span>
                </div>
                <NairobiMap points={mapPoints} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Order board</p>
                  <h2 className="text-lg font-semibold text-slate-900">Live queue</h2>
                </div>
                <button 
                  onClick={() => {
                    if (role === "admin") {
                      navigate("/dashboard?section=orders");
                    } else if (role === "sme") {
                      navigate("/sme/orders");
                    } else {
                      navigate("/orders");
                    }
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                >
                  View all
                </button>
              </div>
              {boardColumns.some(col => col.items.length > 0) ? (
                <OrdersBoard columns={boardColumns} />
              ) : (
                <EmptyState message="No orders to display. Orders will appear here as they are created." />
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
