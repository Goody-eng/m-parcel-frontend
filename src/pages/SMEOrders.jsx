import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon,
  TruckIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PhoneIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export default function SMEOrders() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.role !== "sme") {
      navigate("/dashboard");
      return;
    }

    fetchOrders();
  }, [token, user, navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get("/orders/mine");
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(term) ||
          order.customerName?.toLowerCase().includes(term) ||
          order.customerPhone?.includes(term) ||
          order.pickupAddress?.toLowerCase().includes(term) ||
          order.dropoffAddress?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleViewDetails = async (orderId) => {
    try {
      const { data } = await axiosClient.get(`/orders/${orderId}`);
      setSelectedOrder(data);
      setShowDetailsModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load order details");
    }
  };

  const handleInitiatePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setActionLoading(orderId);
    try {
      await axiosClient.patch(`/orders/${orderId}/cancel`);
      alert("Order cancelled successfully!");
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
      console.error("Cancel error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    setActionLoading(orderId);
    try {
      console.log("Deleting order:", orderId);
      const response = await axiosClient.delete(`/orders/${orderId}`);
      console.log("Delete response:", response.data);
      alert("Order deleted successfully!");
      await fetchOrders();
    } catch (err) {
      console.error("Delete error details:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete order";
      alert(`Delete failed: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700 border-amber-200",
      InTransit: "bg-blue-100 text-blue-700 border-blue-200",
      Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    const icons = {
      Pending: <ClockIcon className="w-4 h-4" />,
      InTransit: <TruckIcon className="w-4 h-4" />,
      Delivered: <CheckCircleIcon className="w-4 h-4" />,
      Cancelled: <XCircleIcon className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Pending}`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const styles = {
      Unpaid: "bg-amber-100 text-amber-700",
      Paid: "bg-emerald-100 text-emerald-700",
      Reconciled: "bg-blue-100 text-blue-700",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[paymentStatus] || styles.Unpaid}`}>
        {paymentStatus || "Unpaid"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <div className="flex-1 px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage and track all your delivery orders
                </p>
              </div>
              <button
                onClick={() => navigate("/orders/create")}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                <PlusIcon className="w-5 h-5" />
                Create Order
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by order ID, customer, phone, or address..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="InTransit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <p className="text-slate-500 font-medium">No orders found</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first order to get started"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{order.orderId}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{order.customerName}</p>
                              <p className="text-sm text-slate-500">{order.customerPhone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-slate-900 truncate">
                                {order.pickupAddress}
                              </p>
                              <p className="text-xs text-slate-500">→ {order.dropoffAddress}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {order.assignedDriver ? (
                              <div>
                                <p className="font-medium text-slate-900">
                                  {order.assignedDriver.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {order.assignedDriver.phone}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPaymentBadge(order.paymentStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">
                              KES {order.amount?.toLocaleString() || "0"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(order._id)}
                                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="View Details"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              {order.paymentStatus !== "Paid" && order.status !== "Cancelled" && (
                                <button
                                  onClick={() => handleInitiatePayment(order)}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                  title="Initiate Payment"
                                >
                                  <CreditCardIcon className="w-5 h-5" />
                                </button>
                              )}
                              {order.status !== "Delivered" && order.status !== "Cancelled" && (
                                <>
                                  <button
                                    onClick={() => handleEdit(order)}
                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit Order"
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleCancel(order._id)}
                                    disabled={actionLoading === order._id}
                                    className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition disabled:opacity-50"
                                    title="Cancel Order"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              {(order.status === "Pending" || order.status === "Cancelled") && (
                                <button
                                  onClick={() => handleDelete(order._id)}
                                  disabled={actionLoading === order._id}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                  title="Delete Order"
                                >
                                  {actionLoading === order._id ? (
                                    <ClockIcon className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <TrashIcon className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {orders.filter((o) => o.status === "Pending").length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {orders.filter((o) => o.status === "InTransit").length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Delivered</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {orders.filter((o) => o.status === "Delivered").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          onInitiatePayment={handleInitiatePayment}
        />
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={fetchOrders}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onInitiatePayment }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
              <p className="text-sm text-slate-600 mt-1">#{order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Name:</span>
                  <span className="ml-2 font-medium text-slate-900">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Phone:</span>
                  <span className="ml-2 font-medium text-slate-900">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Order Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Status:</span>
                  <span className="ml-2 font-medium text-slate-900">{order.status}</span>
                </div>
                <div>
                  <span className="text-slate-600">Payment:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {order.paymentStatus || "Unpaid"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Amount:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    KES {order.amount?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
              {order.paymentStatus !== "Paid" && order.status !== "Cancelled" && (
                <button
                  onClick={() => {
                    onClose();
                    onInitiatePayment(order);
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  Initiate M-PESA Payment
                </button>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Pickup Location</h3>
              <p className="text-sm text-slate-700">{order.pickupAddress}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Drop-off Location</h3>
              <p className="text-sm text-slate-700">{order.dropoffAddress}</p>
            </div>

            {order.assignedDriver && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Assigned Driver</h3>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{order.assignedDriver.name}</p>
                  <p className="text-slate-600">{order.assignedDriver.phone}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Timeline</h3>
              <div className="text-sm space-y-1">
                <p className="text-slate-600">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
                {order.deliveredAt && (
                  <p className="text-slate-600">
                    Delivered: {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {order.deliveryProof && (
              <div className="md:col-span-2">
                <h3 className="font-semibold text-slate-900 mb-3">Delivery Proof</h3>
                <div className="relative">
                  <img
                    src={`https://m-parcel-backend.onrender.com${order.deliveryProof}`}
                    alt="Delivery proof"
                    className="w-full max-w-md h-auto rounded-lg border border-slate-200 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <div className="hidden text-sm text-slate-500 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    Unable to load delivery proof image
                  </div>
                  <a
                    href={`https://m-parcel-backend.onrender.com${order.deliveryProof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    View Full Image
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Order Modal Component
function EditOrderModal({ order, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customerName: order.customerName || "",
    customerPhone: order.customerPhone || "",
    pickupAddress: order.pickupAddress || "",
    dropoffAddress: order.dropoffAddress || "",
    amount: order.amount || "",
    assignedDriver: order.assignedDriver?._id || "",
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const { data } = await axiosClient.get("/orders/drivers");
        setDrivers(data);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
      }
    };
    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Updating order:", order._id, formData);
      const response = await axiosClient.put(`/orders/${order._id}`, formData);
      console.log("Update response:", response.data);
      alert("Order updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update error details:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update order";
      setError(errorMessage);
      alert(`Update failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDriver = () => {
    setFormData((prev) => ({ ...prev, assignedDriver: "" }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Edit Order</h2>
              <p className="text-sm text-slate-600 mt-1">#{order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-5 h-5 text-slate-600" />
                <label className="font-semibold text-slate-900">Customer Information</label>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Customer Name"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Addresses */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="w-5 h-5 text-slate-600" />
                <label className="font-semibold text-slate-900">Addresses</label>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Pickup Address</label>
                  <input
                    type="text"
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    placeholder="Pickup Address"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Drop-off Address</label>
                  <input
                    type="text"
                    name="dropoffAddress"
                    value={formData.dropoffAddress}
                    onChange={handleChange}
                    placeholder="Drop-off Address"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                <label className="font-semibold text-slate-900">Amount</label>
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount (KES)"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Driver Assignment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TruckIcon className="w-5 h-5 text-slate-600" />
                <label className="font-semibold text-slate-900">Driver Assignment</label>
              </div>
              {formData.assignedDriver ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">
                      {order.assignedDriver?.name || "Driver assigned"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.assignedDriver?.phone || ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDriver}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <select
                  name="assignedDriver"
                  value={formData.assignedDriver}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select a driver (optional)</option>
                  {drivers.length === 0 ? (
                    <option value="" disabled>No drivers available</option>
                  ) : (
                    drivers.map((driver) => {
                      const label = driver.isAssigned ? " (Assigned)" : " (Unassigned)";
                      return (
                        <option key={driver._id} value={driver._id}>
                          {driver.name}{label}
                        </option>
                      );
                    })
                  )}
                </select>
              )}
              {drivers.length > 0 && !formData.assignedDriver && (
                <p className="text-xs text-slate-500 mt-2">
                  {drivers.filter((d) => !d.isAssigned).length > 0
                    ? `${drivers.filter((d) => !d.isAssigned).length} unassigned, ${drivers.filter((d) => d.isAssigned).length} assigned driver(s) available`
                    : `All ${drivers.length} driver(s) are currently assigned. You can still select them.`}
                </p>
              )}
              {drivers.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  No drivers registered in the system. Please contact admin to add drivers.
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({ order, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState(order.customerPhone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Format phone number (ensure it starts with 254)
  const formatPhoneNumber = (phone) => {
    let formatted = phone.replace(/\D/g, ""); // Remove non-digits
    if (formatted.startsWith("0")) {
      formatted = "254" + formatted.substring(1);
    } else if (!formatted.startsWith("254")) {
      formatted = "254" + formatted;
    }
    return formatted;
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phoneNumber) {
      setError("Please enter a phone number");
      setLoading(false);
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { data } = await axiosClient.post("/payments/stkpush", {
        phoneNumber: formattedPhone,
        amount: order.amount,
        orderId: order.orderId,
      });

      if (data.ResponseCode === "0") {
        setPaymentInitiated(true);
        setCheckingStatus(true);
      } else {
        setError(data.CustomerMessage || "Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errorMessage ||
          "Failed to initiate payment. Please check your connection and try again."
      );
      console.error("Payment initiation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingStatus) return;

    let attempts = 0;
    const maxAttempts = 30; // Check for 30 seconds (30 attempts * 1 second)
    let isMounted = true;

    const checkInterval = setInterval(async () => {
      if (!isMounted) return;
      
      attempts++;
      try {
        const { data } = await axiosClient.get(`/orders/${order._id}`);
        if (data.paymentStatus === "Paid") {
          clearInterval(checkInterval);
          setCheckingStatus(false);
          alert("Payment successful! Order has been updated.");
          onSuccess();
          onClose();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setCheckingStatus(false);
          alert(
            "Payment status check timed out. Please check your M-PESA or refresh the order list."
          );
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setCheckingStatus(false);
        }
      }
    }, 1000); // Check every second

    // Cleanup on unmount
    return () => {
      isMounted = false;
      clearInterval(checkInterval);
    };
  }, [checkingStatus, order._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">M-PESA Payment</h2>
              <p className="text-sm text-slate-600 mt-1">Order #{order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {!paymentInitiated ? (
            <>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Amount to Pay</span>
                  <span className="text-2xl font-bold text-slate-900">
                    KES {order.amount?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Customer: {order.customerName}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleInitiatePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    M-PESA Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254712345678"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the phone number registered with M-PESA (format: 254712345678)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-medium mb-1">📱 What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>You'll receive an M-PESA prompt on your phone</li>
                    <li>Enter your M-PESA PIN to complete the payment</li>
                    <li>Payment status will update automatically</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <ClockIcon className="w-5 h-5 animate-spin" />
                        Initiating...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="w-5 h-5" />
                        Initiate Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCardIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Payment Request Sent!
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Check your phone for the M-PESA prompt and enter your PIN to complete the
                  payment.
                </p>
                {checkingStatus && (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    <span>Waiting for payment confirmation...</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

