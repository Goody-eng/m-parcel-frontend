import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  XMarkIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  PlusIcon,
  CameraIcon,
  CurrencyDollarIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultCenter = { lat: -1.286389, lng: 36.817223 }; // Nairobi CBD

function MapClickHandler({ onPickupClick, onDropoffClick, activeType }) {
  useMapEvents({
    click: (e) => {
      if (activeType === "pickup" && onPickupClick) {
        onPickupClick(e.latlng);
      } else if (activeType === "dropoff" && onDropoffClick) {
        onDropoffClick(e.latlng);
      }
    },
  });
  return null;
}

export default function CreateOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [driverMode, setDriverMode] = useState("auto"); // auto, manual, unassigned
  const [selectedDriver, setSelectedDriver] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffTime, setDropoffTime] = useState("ASAP");
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [additionalDropoffs, setAdditionalDropoffs] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [referenceId, setReferenceId] = useState("");
  const [amount, setAmount] = useState("");
  const [activeMapType, setActiveMapType] = useState(null); // "pickup" or "dropoff"

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        console.log("🔄 Fetching drivers from API...");
        const { data } = await axiosClient.get("/orders/drivers");
        console.log("📥 Received drivers response:", data);
        
        if (data && Array.isArray(data)) {
          setDrivers(data);
          const unassignedCount = data.filter(d => !d.isAssigned).length;
          const assignedCount = data.filter(d => d.isAssigned).length;
          console.log(`✅ Loaded ${data.length} driver(s): ${unassignedCount} unassigned, ${assignedCount} assigned`);
          
          if (data.length === 0) {
            console.warn("⚠️ No drivers found in the database. Make sure you've created a driver account with role='driver'");
          }
        } else {
          console.error("❌ Drivers data is not an array:", data);
          setDrivers([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch drivers:", err);
        console.error("Error details:", err.response?.data || err.message);
        setDrivers([]);
      }
    };
    fetchDrivers();
  }, []);

  const handlePickupMapClick = (latlng) => {
    setPickupLocation(latlng);
    // Reverse geocode to get address (simplified - in production use a geocoding service)
    setPickupAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    setActiveMapType(null);
  };

  const handleDropoffMapClick = (latlng) => {
    setDropoffLocation(latlng);
    setDropoffAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    setActiveMapType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!customerName || !customerPhone || !pickupAddress || !dropoffAddress || !amount) {
      setError("Please fill in all required fields (*)");
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        customerName,
        customerPhone,
        pickupAddress,
        dropoffAddress,
        amount: parseFloat(amount),
        vehicleType: driverMode !== "unassigned" ? vehicleType : null,
        referenceId: referenceId || null,
        paymentMethod: paymentMethod || null,
      };

      if (driverMode === "manual" && selectedDriver) {
        orderData.assignedDriver = selectedDriver;
      }

      const { data } = await axiosClient.post("/orders/create", orderData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const addDropoff = () => {
    setAdditionalDropoffs([...additionalDropoffs, { address: "", location: null }]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Form */}
          <div className="w-full max-w-2xl bg-white shadow-lg overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TruckIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-semibold text-slate-900">On-Demand</span>
                </div>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                  On Demand
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Customer Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                  <label className="font-semibold text-slate-900">
                    Customer<span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Search by name or phone number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full mt-2 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Driver Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TruckIcon className="w-5 h-5 text-slate-600" />
                  <label className="font-semibold text-slate-900">Driver</label>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setDriverMode("auto")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                      driverMode === "auto"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverMode("manual")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                      driverMode === "manual"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverMode("unassigned")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                      driverMode === "unassigned"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Unassigned
                  </button>
                </div>
                {driverMode !== "unassigned" && (
                  <div className="space-y-3">
                        {driverMode === "manual" && (
                          <div>
                            <select
                              value={selectedDriver}
                              onChange={(e) => setSelectedDriver(e.target.value)}
                              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                              <option value="">Select a driver</option>
                              {drivers.length === 0 ? (
                                <option value="" disabled>No drivers available</option>
                              ) : (
                                drivers.map((driver) => {
                                  // Always show all drivers, with assigned/unassigned label
                                  const label = driver.isAssigned ? " (Assigned)" : " (Unassigned)";
                                  return (
                                    <option key={driver._id} value={driver._id}>
                                      {driver.name}{label}
                                    </option>
                                  );
                                })
                              )}
                            </select>
                            {drivers.length > 0 && (
                              <p className="mt-2 text-xs text-slate-500">
                                {drivers.filter(d => !d.isAssigned).length > 0
                                  ? `${drivers.filter(d => !d.isAssigned).length} unassigned, ${drivers.filter(d => d.isAssigned).length} assigned driver(s)`
                                  : `All ${drivers.length} driver(s) are currently assigned. You can still select them.`}
                              </p>
                            )}
                      </div>
                    )}
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="bike">Bike</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Collection From */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-5 h-5 text-slate-600" />
                  <label className="font-semibold text-slate-900">
                    Collection from<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Search and select address"
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                  >
                    <CalendarIcon className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">ASAP</span>
                  <button
                    type="button"
                    className={`p-2 rounded-lg transition ${
                      activeMapType === "pickup"
                        ? "bg-indigo-100 text-indigo-600"
                        : "hover:bg-slate-100 text-indigo-600"
                    }`}
                    onClick={() => setActiveMapType(activeMapType === "pickup" ? null : "pickup")}
                    title="Click on map to set pickup location"
                  >
                    <MapPinIcon className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <CameraIcon className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>

              {/* Deliver To */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-5 h-5 text-slate-600" />
                  <label className="font-semibold text-slate-900">
                    Deliver to<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    placeholder="Search and select address"
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                  >
                    <CalendarIcon className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">ASAP</span>
                  <button
                    type="button"
                    className={`p-2 rounded-lg transition ${
                      activeMapType === "dropoff"
                        ? "bg-indigo-100 text-indigo-600"
                        : "hover:bg-slate-100 text-indigo-600"
                    }`}
                    onClick={() => setActiveMapType(activeMapType === "dropoff" ? null : "dropoff")}
                    title="Click on map to set dropoff location"
                  >
                    <MapPinIcon className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <CameraIcon className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>

              {/* Add Dropoff */}
              <button
                type="button"
                onClick={addDropoff}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-indigo-600 font-medium hover:border-indigo-400 hover:bg-indigo-50 transition"
              >
                <PlusIcon className="w-5 h-5" />
                Add Dropoff
              </button>

              {/* Other Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HashtagIcon className="w-5 h-5 text-slate-600" />
                  <label className="font-semibold text-slate-900">Other</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount (KES)"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div className="relative">
                    <HashtagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="Reference ID"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-3 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="M-PESA">M-PESA</option>
                  <option value="Prepaid">Prepaid</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-red-500">*</span>
                  <span>Fill in or Select required Fields</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel - Map */}
          <div className="flex-1 relative">
            {activeMapType && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg">
                Click on the map to set {activeMapType === "pickup" ? "pickup" : "dropoff"} location
              </div>
            )}
            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler
                onPickupClick={handlePickupMapClick}
                onDropoffClick={handleDropoffMapClick}
                activeType={activeMapType}
              />
              {pickupLocation && (
                <Marker position={pickupLocation} icon={pickupIcon}>
                  <Popup>Pickup Location</Popup>
                </Marker>
              )}
              {dropoffLocation && (
                <Marker position={dropoffLocation} icon={dropoffIcon}>
                  <Popup>Dropoff Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

