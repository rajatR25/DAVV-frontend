// FILE: src/pages/StudentDashboard.jsx
// DESCRIPTION: Main Student Portal with Professional DAVV Styling & Real API

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LayoutDashboard,
  User,
  Briefcase,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Lock,
  CheckCircle2,
  Loader2,
  Activity,
  Mail,
  Calculator,
  Bell,
  Calendar,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

// --- COMPONENT IMPORTS ---
// Ensure these paths are correct according to your project structure
import StudentProfileForm from "../components/StudentProfileForm";
import CGPAUpload from "../components/CGPAUpload";

export default function StudentDashboard({ setView }) {
  // STATE MANAGEMENT

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [realJobs, setRealJobs] = useState([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Student Basic Info State
  const [studentData, setStudentData] = useState({
    name: "Student",
    email: "",
    enrollmentNo: "",
    cgpa: "0.00",
    appsCount: 0,
    isVerified: false,
  });

  // API INTEGRATION: FETCH PROFILE & APPLICATIONS
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [profileRes, appRes] = await Promise.all([
          axios.get(
            "http://https://davv-backend-api.onrender.com/api/users/profile",
            config,
          ),
          axios.get(
            "http://https://davv-backend-api.onrender.com/api/jobs/applications",
            config,
          ),
        ]);

        const user = profileRes.data;
        setStudentData({
          name: user.fullName || user.name || "Student",
          email: user.email || "",
          enrollmentNo: user.enrollmentNo || "DAVV-MCA-2026",
          cgpa: user.cgpa || "0.00",
          appsCount: appRes.data ? appRes.data.length : 0,
          isVerified: user.isVerified || false,
        });
        setIsProfileComplete(user.isProfileComplete || false);
        setAppliedJobs(appRes.data || []);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);

        // AUTO-LOGOUT LOGIC ADDED HERE
        if (error.response && error.response.status === 401) {
          alert(
            "Session Expired! For your security, you have been logged out. Please log in again.",
          );
          localStorage.clear();
          window.location.reload();
        }
      }
    };
    fetchProfileData();
  }, []);

  // API INTEGRATION: FETCH REAL JOBS (HR & ADMIN)

  useEffect(() => {
    const fetchRealJobs = async () => {
      setFetchingJobs(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://https://davv-backend-api.onrender.com/api/jobs",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setRealJobs(res.data);
      } catch (error) {
        console.error("Jobs Fetch Error:", error);
      } finally {
        setFetchingJobs(false);
      }
    };
    fetchRealJobs();
  }, [activeTab]);

  // HANDLERS (Apply & Logout)

  const handleApply = async (jobId) => {
    if (!isProfileComplete) {
      alert(
        "Incomplete Profile: Please complete your academic verification first.",
      );
      setActiveTab("profile");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://https://davv-backend-api.onrender.com/api/jobs/${jobId}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert(res.data.message);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Application Failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };
  // RENDER: ACADEMIC PROFILE & CGPA CALCULATOR
  const ProfileContent = () => {
    const [numSemesters, setNumSemesters] = useState(2);
    const [semesterData, setSemesterData] = useState(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        status: "idle",
        sgpa: 0,
        credits: 0,
      })),
    );
    const [calculating, setCalculating] = useState(false);

    const updateSemester = (semId, payload) => {
      setSemesterData((prev) =>
        prev.map((sem) =>
          sem.id === semId
            ? {
                ...sem,
                status: "verified",
                sgpa: parseFloat(payload.data?.sgpa ?? payload.sgpa ?? 0),
                credits: parseFloat(
                  payload.data?.credits ?? payload.credits ?? 0,
                ),
              }
            : sem,
        ),
      );
    };

    const handleCalculateAndSync = async () => {
      setCalculating(true);
      try {
        const token = localStorage.getItem("token");
        let totalQualityPoints = 0,
          totalCredits = 0;

        semesterData.slice(0, numSemesters).forEach((s) => {
          if (s.status === "verified" && s.credits > 0) {
            totalQualityPoints += s.sgpa * s.credits;
            totalCredits += s.credits;
          }
        });

        const finalCgpa =
          totalCredits > 0
            ? (totalQualityPoints / totalCredits).toFixed(2)
            : "0.00";

        await axios.put(
          "http://https://davv-backend-api.onrender.com/api/users/update-cgpa",
          { cgpa: Number(finalCgpa), isProfileComplete: true },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setStudentData((prev) => ({ ...prev, cgpa: finalCgpa }));
        setIsProfileComplete(true);
        alert(
          `Academic Metric Updated: Final CGPA ${finalCgpa} Synced Successfully!`,
        );
      } catch (error) {
        alert("System Sync Failed. Please try again.");
      } finally {
        setCalculating(false);
      }
    };

    return (
      <div className="space-y-8 pb-10">
        <StudentProfileForm />

        <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Calculator className="text-indigo-600" /> Academic Verification
              </h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">
                Upload Marksheets for Official Sync
              </p>
            </div>
            <select
              value={numSemesters}
              onChange={(e) => setNumSemesters(Number(e.target.value))}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] outline-none shadow-lg shadow-indigo-100 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  Semester {n}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {semesterData.slice(0, numSemesters).map((sem) => (
              <div
                key={sem.id}
                className={`border rounded-[2rem] p-6 transition-all ${sem.status === "verified" ? "bg-indigo-50/30 border-indigo-200 shadow-inner" : "bg-slate-50/50 border-slate-100 border-dashed"}`}
              >
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">
                  Semester {sem.id}
                </h4>

                <CGPAUpload onUpdate={(data) => updateSemester(sem.id, data)} />

                {sem.status === "verified" && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between px-1 items-center">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Credits
                      </p>
                      <p className="text-sm font-bold text-indigo-600">
                        {sem.credits}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        SGPA
                      </p>
                      <p className="text-sm font-bold text-indigo-600">
                        {sem.sgpa}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-50 pt-8">
            <button
              disabled={
                !semesterData.some((s) => s.status === "verified") ||
                calculating
              }
              onClick={handleCalculateAndSync}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {calculating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <RefreshCw size={18} />
              )}
              {calculating
                ? "Processing Metrics..."
                : "Finalize & Calculate CGPA"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // RENDER: DASHBOARD OVERVIEW
  const DashboardOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] p-12 relative overflow-hidden shadow-sm border border-slate-100">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight font-sans">
              Welcome,{" "}
              <span className="text-indigo-600">
                {studentData.name.split(" ")[0]}
              </span>
            </h2>
            <p className="text-slate-500 mt-3 font-medium flex items-center gap-2">
              <Mail size={16} className="text-indigo-400" /> {studentData.email}
            </p>
            <p className="text-slate-400 mt-4 text-sm font-medium leading-relaxed italic">
              Official TPO session tracking enabled for{" "}
              {studentData.enrollmentNo}.
            </p>
          </div>

          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
              Aggregate CGPA
            </p>
            <p className="text-7xl font-bold text-indigo-600 tracking-tighter">
              {studentData.cgpa}
            </p>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <Activity
            className="absolute -right-4 -top-4 opacity-10"
            size={120}
          />
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-[0.2em]">
              Active Submissions
            </p>
            <h3 className="text-7xl font-bold mt-2 tracking-tighter">
              {studentData.appsCount}
            </h3>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 uppercase text-[9px] font-bold tracking-[0.2em] border border-white/10 mt-6 inline-block">
            Status:{" "}
            {studentData.isVerified ? "Officially Verified" : "Pending Review"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
          <Activity className="text-indigo-600" /> Recent Application Ledger
        </h3>

        {appliedJobs.length > 0 ? (
          appliedJobs.map((app) => (
            <div
              key={app._id}
              className="flex justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 mb-4 transition-all hover:bg-slate-50"
            >
              <div className="flex gap-5 items-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-indigo-600 border border-slate-200 text-lg uppercase shadow-sm">
                  {app.job?.companyName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg leading-tight">
                    {app.job?.role}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-wider">
                    {app.job?.companyName} • Status: {app.status}
                  </p>
                </div>
              </div>
              <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center shadow-sm flex items-center gap-2">
                <CheckCircle2 size={14} className="text-indigo-500" /> System
                Logged
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em] italic">
            No Logs Found In Database
          </div>
        )}
      </div>
    </div>
  );

  // RENDER: REAL JOB BOARD (HR/Admin Connect)
  const CampusDrivesContent = () => (
    <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Briefcase className="text-indigo-600" size={24} /> Live Job
            Opportunities
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">
            Active Recruitment Drives for your batch
          </p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
          <Activity size={14} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
            {realJobs.length} Drives
          </span>
        </div>
      </div>

      {fetchingJobs ? (
        <div className="flex items-center justify-center py-20 text-indigo-600 gap-3">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Synchronizing Database...
          </span>
        </div>
      ) : (
        <div className="space-y-5">
          {realJobs.map((job) => {
            const eligible = parseFloat(studentData.cgpa) >= job.minCGPA;
            const alreadyApplied = appliedJobs.find(
              (a) => a.job?._id === job._id,
            );

            return (
              <div
                key={job._id}
                className="p-7 border border-slate-100 rounded-[2rem] flex justify-between items-center bg-slate-50/30 hover:bg-white hover:shadow-md transition-all border-l-4 border-l-indigo-500"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 border border-slate-100 shadow-sm uppercase">
                    {job.companyName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 leading-tight">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-lg">
                        {job.companyName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} /> Deadline:{" "}
                        {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="text-sm font-bold text-slate-700">
                    {job.salary} LPA
                  </span>

                  {alreadyApplied ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-emerald-100 shadow-sm">
                      <CheckCircle2 size={14} /> Application Submitted
                    </div>
                  ) : !isProfileComplete ? (
                    <button
                      onClick={() => {
                        alert("Please complete your profile first.");
                        setActiveTab("profile");
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-bold uppercase border border-slate-200"
                    >
                      <Lock size={14} /> Profile Locked
                    </button>
                  ) : eligible ? (
                    <button
                      onClick={() => handleApply(job._id)}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 tracking-widest"
                    >
                      Apply Now <ChevronRight size={14} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-rose-100 shadow-sm">
                      <AlertCircle size={14} /> Ineligible (Min: {job.minCGPA})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // MAIN LAYOUT RETURN
  return (
    <div
      className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans"
      onClick={() => {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }}
    >
      {/* PROFESSIONAL SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col flex-shrink-0 z-20">
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tighter">
              DAVV <span className="text-indigo-600">APExP</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              TPO Portal 2026
            </p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "profile", label: "Profile Verification", icon: User },
            { id: "drives", label: "Job Opportunities", icon: Briefcase },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8">
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-[10px] uppercase flex justify-center gap-3 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 tracking-widest"
          >
            <LogOut size={16} /> End Session
          </button>
        </div>
      </aside>

      {/* PROFESSIONAL MAIN AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* HEADER WITH CORNER DROPDOWNS */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 z-50">
          <div className="bg-indigo-50 px-4 py-2 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2 border border-indigo-100">
            <ShieldCheck size={14} /> Secured Student Environment
          </div>

          <div className="flex items-center gap-8">
            {/* 1. NOTIFICATION DROPDOWN */}
            <div
              className="relative cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationsOpen(!isNotificationsOpen);
              }}
            >
              <div
                className={`p-2 rounded-full transition-all ${isNotificationsOpen ? "bg-indigo-50" : "hover:bg-slate-50"}`}
              >
                <Bell
                  size={22}
                  className={
                    isNotificationsOpen ? "text-indigo-600" : "text-slate-400"
                  }
                />
              </div>
              {realJobs.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse border-2 border-white"></span>
              )}

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-[60]"
                  >
                    <p className="font-bold text-[10px] uppercase text-slate-400 border-b border-slate-50 pb-3 mb-4 tracking-widest">
                      Recent Activity
                    </p>
                    <div className="max-h-64 overflow-y-auto">
                      {realJobs.slice(0, 3).map((j) => (
                        <div
                          key={j._id}
                          className="flex gap-4 mb-4 items-start last:mb-0"
                        >
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-indigo-100">
                            {j.companyName[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 leading-tight mb-1">
                              New Drive: {j.companyName}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                              Hiring for {j.role}. Check your eligibility now.
                            </p>
                          </div>
                        </div>
                      ))}
                      {realJobs.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center">
                          No new notifications.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. PROFILE DROPDOWN */}
            <div
              className="relative flex items-center gap-4 cursor-pointer p-1.5 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpen(!isProfileOpen);
              }}
            >
              <div className="text-right leading-tight hidden md:block pl-2">
                <p className="text-sm font-bold text-slate-800">
                  {studentData.name}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {studentData.enrollmentNo}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-indigo-100 text-lg uppercase">
                {studentData.name[0]}
              </div>
              <ChevronDown size={14} className="text-slate-400 mr-1" />

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60]"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-2">
                      <p className="font-bold text-xs text-slate-800">
                        {studentData.name}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 truncate">
                        {studentData.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="w-full text-left px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest flex items-center gap-3"
                    >
                      <User size={14} className="text-indigo-500" /> Identity
                      Card
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-[11px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest flex items-center gap-3 mt-1"
                    >
                      <LogOut size={14} className="text-rose-500" /> End Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === "dashboard" && <DashboardOverview />}
              {activeTab === "profile" && <ProfileContent />}
              {activeTab === "drives" && <CampusDrivesContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* GLOBAL STYLES FOR DAVV LOOK */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `,
        }}
      />
    </div>
  );
}
