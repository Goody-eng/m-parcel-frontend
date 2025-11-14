import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const personas = [
  {
    value: "sme",
    label: "I manage delivery operations (SME)",
    description: "I need tools to coordinate parcels and drivers",
  },
  {
    value: "driver",
    label: "I am a driver looking for jobs",
    description: "I want to accept deliveries and update progress",
  },
  {
    value: "customer",
    label: "I am looking for a parcel",
    description: "I want to track deliveries and receive updates",
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    persona: personas[0].value,
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setLoading(true);

    try {
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        phone: formData.phone.replace(/\s+/g, ""),
        password: formData.password,
        role: formData.persona === "customer" ? "sme" : formData.persona, // temporary mapping until customer dashboard is ready
        email: formData.email,
      };

      if (!payload.name || payload.name === "") {
        throw new Error("Please provide your full name");
      }

      await axiosClient.post("/auth/register", payload);
      navigate("/login", {
        state: { message: "Account created! Please log in." },
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Unable to create account";
      setErrors(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-rose-600 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573167149237-3289d0bc07c7?auto=format&fit=crop&w=1400&q=80')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-indigo-900/60 to-rose-700/60" />
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
            <span className="text-sm font-medium uppercase tracking-widest">Welcome to M-PARCEL</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight">Deliver smarter with real-time operations intelligence.</h1>
          <p className="text-base text-slate-100">
            Build resilient delivery workflows, empower your drivers, and keep customers informed. Join thousands of
            African teams already scaling with M-PARCEL.
          </p>
          <ul className="space-y-3 text-sm text-slate-100">
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Route optimization tailored for African cities.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-300" /> Digital proof-of-delivery with photo & signature.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-teal-300" /> Real-time SMS & WhatsApp customer notifications.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex w-full max-w-xl flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Create your M-PARCEL account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-500">
                Log in instead
              </Link>
              .
            </p>
          </div>

          {errors && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="persona">
                What best describes you?
              </label>
              <select
                id="persona"
                name="persona"
                value={formData.persona}
                onChange={handleChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {personas.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {personas.find((option) => option.value === formData.persona)?.description}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 254712345678"
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-xs text-slate-400">
            By signing up, you agree to M-PARCEL’s
            <span className="px-1 font-medium text-slate-500">Terms</span>
            and
            <span className="pl-1 font-medium text-slate-500">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
