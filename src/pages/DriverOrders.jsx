import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  XMarkIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

export default function DriverOrders() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finishingOrderId, setFinishingOrderId] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryProof, setDeliveryProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.role !== "driver") {
      navigate("/dashboard");
      return;
    }

    fetchOrders();
  }, [token, user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const [activeRes, completedRes] = await Promise.all([
        axiosClient.get("/orders/assigned"),
        axiosClient.get("/orders/completed"),
      ]);
      setActiveOrders(activeRes.data);
      setCompletedRides(completedRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRideClick = (order) => {
    setSelectedOrder(order);
    setShowFinishModal(true);
    setDeliveryProof(null);
    setProofPreview(null);
    setPaymentStatus("Paid");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setDeliveryProof(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishRide = async () => {
    if (!selectedOrder) return;

    setFinishingOrderId(selectedOrder.orderId);
    try {
      const formData = new FormData();
      formData.append("orderId", selectedOrder.orderId);
      formData.append("paymentStatus", paymentStatus);
      if (deliveryProof) {
        formData.append("deliveryProof", deliveryProof);
      }

      const { data } = await axiosClient.post("/orders/finish", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Show success message
      alert(data.message || "Ride completed successfully!");
      
      // Close modal and refresh orders list
      setShowFinishModal(false);
      setSelectedOrder(null);
      setDeliveryProof(null);
      setProofPreview(null);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to finish ride");
      console.error("Error finishing ride:", err);
    } finally {
      setFinishingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-600">Loading your orders...</p>
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
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage your active deliveries and view completed rides
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Active Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Active Orders</h2>
                <span className="text-sm text-slate-500">
                  {activeOrders.length} {activeOrders.length === 1 ? "order" : "orders"}
                </span>
              </div>

              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <ClockIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No active orders</p>
                  <p className="text-sm text-slate-500 mt-1">
                    You're free and ready for new assignments!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {activeOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-slate-900 text-lg">
                            Order #{order.orderId}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === "InTransit"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                          <UserIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {order.customerName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <PhoneIcon className="w-3 h-3" />
                              {order.customerPhone}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Pickup</p>
                            <p className="text-sm text-slate-900">{order.pickupAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon className="w-5 h-5 text-emerald-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Drop-off</p>
                            <p className="text-sm text-slate-900">{order.dropoffAddress}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Amount</span>
                            <span className="font-semibold text-slate-900">
                              KES {order.amount?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-slate-600">Payment</span>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                order.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {order.paymentStatus || "Unpaid"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFinishRideClick(order)}
                        disabled={finishingOrderId === order.orderId}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircleIconSolid className="w-5 h-5" />
                        Finish Ride
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Rides */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Completed Rides</h2>
                <span className="text-sm text-slate-500">
                  {completedRides.length} {completedRides.length === 1 ? "ride" : "rides"}
                </span>
              </div>

              {completedRides.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No completed rides yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Your completed deliveries will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedRides.map((ride) => (
                    <div
                      key={ride._id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">#{ride.orderId}</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                            Delivered
                          </span>
                        </div>
                        <CheckCircleIconSolid className="w-6 h-6 text-emerald-600" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Customer</p>
                          <p className="font-medium text-slate-900">{ride.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Route</p>
                          <p className="text-slate-700">
                            {ride.pickupAddress?.substring(0, 20)}... →{" "}
                            {ride.dropoffAddress?.substring(0, 20)}...
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-slate-600">Amount</span>
                          <span className="font-semibold text-slate-900">
                            KES {ride.amount?.toLocaleString() || "0"}
                          </span>
                        </div>
                        {ride.deliveredAt && (
                          <div className="text-xs text-slate-500">
                            Completed: {new Date(ride.deliveredAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Finish Ride Modal */}
      {showFinishModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Finish Ride</h2>
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    setSelectedOrder(null);
                    setDeliveryProof(null);
                    setProofPreview(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Order ID</p>
                  <p className="font-semibold text-slate-900">#{selectedOrder.orderId}</p>
                  <p className="text-sm text-slate-600 mt-2 mb-1">Customer</p>
                  <p className="font-medium text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-sm text-slate-600 mt-2 mb-1">Amount</p>
                  <p className="font-semibold text-emerald-600">
                    KES {selectedOrder.amount?.toLocaleString() || "0"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Reconciled">Reconciled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Delivery Proof (Optional)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Upload a photo of the delivered package or customer signature
                  </p>

                  {proofPreview ? (
                    <div className="relative">
                      <img
                        src={proofPreview}
                        alt="Delivery proof preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() => {
                          setDeliveryProof(null);
                          setProofPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CameraIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowFinishModal(false);
                      setSelectedOrder(null);
                      setDeliveryProof(null);
                      setProofPreview(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinishRide}
                    disabled={finishingOrderId === selectedOrder.orderId}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {finishingOrderId === selectedOrder.orderId ? (
                      <>
                        <ClockIcon className="w-5 h-5 animate-spin" />
                        Finishing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIconSolid className="w-5 h-5" />
                        Complete Ride
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

