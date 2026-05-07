import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  User,
  BookOpen,
  FileText,
  Award,
  Briefcase,
  Building2,
} from "lucide-react";
import axios from "axios";

export default function AuthPage({ setView }) {
  const searchParams = new URLSearchParams(window.location.search);
  const urlRole = searchParams.get("role");
  const urlCompany = searchParams.get("company");
  const isInvitedHR = urlRole === "hr";

  const [isLogin, setIsLogin] = useState(!isInvitedHR);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(isInvitedHR ? "company" : "student");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState(urlCompany || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInvitedHR) {
      setRole("company");
      setIsLogin(false);
      setCompanyName(urlCompany || "");
    }
  }, [isInvitedHR, urlCompany]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await axios.post(
          "http://localhost:5000/api/users/login",
          { email, password },
        );
        const dbRole = response.data.role;
        const selectedTab = role;

        const mappedDbRole = dbRole === "hr" ? "company" : dbRole;

        if (mappedDbRole !== selectedTab) {
          alert(
            `⚠️ Access Denied! This ID is registered as '${mappedDbRole.toUpperCase()}'. Please select the correct tab.`,
          );
          setIsLoading(false);
          return;
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userInfo", JSON.stringify(response.data));

        alert("Login Successful! Welcome " + (response.data.name || "User"));

        if (dbRole === "admin") setView("admin-dashboard");
        else if (dbRole === "hr") setView("hr-dashboard");
        else setView("student-dashboard");
      } else {
        const payload = {
          name,
          email,
          password,
          role: role === "company" ? "hr" : role,
          ...(role === "company" && { companyName }),
        };
        await axios.post("http://localhost:5000/api/users/register", payload);
        alert("Registration Successful! Please login now.");
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Authentication Failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: GraduationCap, left: "10%", delay: 0, size: 40, duration: 15 },
    { Icon: BookOpen, left: "25%", delay: 5, size: 30, duration: 18 },
    { Icon: FileText, left: "45%", delay: 2, size: 50, duration: 22 },
    { Icon: Award, left: "65%", delay: 7, size: 35, duration: 16 },
    { Icon: Briefcase, left: "15%", delay: 3, size: 35, duration: 20 },
  ];

  return (
    <div
      className="min-h-screen text-slate-900 font-sans flex items-center justify-center p-4 lg:p-8 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: "#124fd2" }}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.24), transparent 50%)`,
        }}
      ></div>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-white/20"
            style={{ left: item.left }}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: "linear",
            }}
          >
            <item.Icon size={item.size} />
          </motion.div>
        ))}
      </div>

      <div className="max-w-[1000px] w-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[620px] relative z-10 border border-white/20">
        {/* Left Side: Branding */}
        <div className="hidden md:flex w-[45%] bg-[#2563eb] p-12 flex-col justify-between items-center text-center">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white text-[#2563eb] rounded-full flex items-center justify-center shadow-xl mb-8 mx-auto">
              <GraduationCap size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-4">
              DAVV-APExP <br />{" "}
              <span className="text-blue-200">Placement Portal</span>
            </h1>
            <div className="mt-6 bg-white rounded-full w-[135px] h-[135px] flex items-center justify-center shadow-2xl border-4 border-blue-400/20 mx-auto group overflow-hidden">
              <div className="w-[130px] h-[130px] flex items-center justify-center ">
                <img
                  src="/scsit-logo.png"
                  alt="SCSIT Logo"
                  className="w-full h-full object-contain drop-shadow-md group-hover:rotate-6 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center justify-center gap-3 mb-2 text-white font-bold text-sm">
              <ShieldCheck size={20} /> Secure Access
            </div>
            <p className="text-blue-100/80 text-[11px]">
              All academic and personal records are encrypted.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-10 lg:p-14 flex flex-col bg-white">
          {/* Tab Selection */}
          <div className="flex justify-end mb-10">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              {["student", "company", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setIsLogin(true);
                  }}
                  disabled={isInvitedHR}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${role === r ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"} ${isInvitedHR ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-[360px] mx-auto"
              >
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl font-black text-[#0f172a] mb-2 tracking-tight">
                    {isInvitedHR && !isLogin
                      ? "HR Registration"
                      : isLogin
                        ? "Welcome Back!"
                        : "Create Account"}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    SCSIT Placement Portal Access.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Company Name Input */}
                  {!isLogin && role === "company" && (
                    <div className="relative">
                      <Building2
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        required
                        readOnly={isInvitedHR && urlCompany !== null}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={`w-full py-3.5 pl-11 pr-4 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm ${isInvitedHR ? "bg-slate-200 text-slate-600" : "bg-slate-50 focus:bg-white"}`}
                      />
                    </div>
                  )}

                  {/* Full Name Input */}
                  {!isLogin && role !== "admin" && (
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={
                          role === "company" ? "HR Manager Name" : "Full Name"
                        }
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none font-bold text-sm shadow-sm"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none font-bold text-sm shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3.5 pl-11 pr-11 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none font-bold text-sm tracking-widest shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1.5"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2563eb] text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-sm shadow-xl shadow-blue-200 active:scale-[0.98]"
                  >
                    {isLoading
                      ? "Validating..."
                      : isLogin
                        ? "Sign In"
                        : "Register"}{" "}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  {isLogin ? (
                    <>
                      {role === "student" ? (
                        <p className="text-sm font-bold text-slate-500">
                          New user?{" "}
                          <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className="text-blue-600 hover:underline"
                          >
                            Register here
                          </button>
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-slate-400 italic">
                          Recruiters & Admins are invited by TPO Cell.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-bold text-slate-500">
                      Already registered?{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="text-blue-600 hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
