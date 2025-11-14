import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = user?.role || "sme";

  const config = useMemo(() => roleMeta[role] || roleMeta.sme, [role]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      setLoading(true);
      setError("");

      try {
        const { data } = await axiosClient.get(config.endpoint);
        setStats(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "We couldn’t load your dashboard stats right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [config.endpoint, token]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-sm text-slate-600">{config.subtitle}</p>
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
