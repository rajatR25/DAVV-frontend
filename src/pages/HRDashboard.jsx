import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Users,
  LayoutDashboard,
  Bell,
  LogOut,
  FileText,
  CheckCircle,
  Loader2,
  X,
  UserCheck,
  UserMinus,
  Briefcase,
  Send,
  ChevronRight,
  Plus,
  Sparkles,
  Edit3,
  Trash2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editingJob, setEditingJob] = useState(null);

  // --- UI STATES ---
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const rawData = JSON.parse(localStorage.getItem("userInfo")) || {};
  const userInfo = rawData.user ? rawData.user : rawData;
  const companyName = userInfo.companyName || "";

  console.log("Logged In HR Info:", userInfo);
  console.log("HR Company Name:", companyName);

  // FETCH DATA FUNCTION
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [jobRes, appRes] = await Promise.all([
        axios.get(
          "https://davv-backend-api.onrender.com/api/jobs",
          config,
        ),
        axios.get(
          "https://davv-backend-api.onrender.com/api/jobs/applications",
          config,
        ),
      ]);

      // MAGIC FIX: Ignore spaces and case sensitivity
      const safeHRCompany = companyName
        ? String(companyName).toLowerCase().trim()
        : "";

      const filteredJobs = jobRes.data.filter((j) => {
        const jobCompany = j.companyName
          ? String(j.companyName).toLowerCase().trim()
          : "";
        return jobCompany === safeHRCompany;
      });

      const filteredApps = appRes.data.filter((a) => {
        const appCompany = a.job?.companyName
          ? String(a.job.companyName).toLowerCase().trim()
          : "";
        return appCompany === safeHRCompany;
      });

      setMyJobs(filteredJobs);
      setCandidates(filteredApps);
    } catch (error) {
      console.error("Fetch Error:", error);

      if (error.response && error.response.status === 401) {
        alert(
          "Session Expired! For your security, you have been logged out. Please log in again.",
        );
        localStorage.clear();
        window.location.reload();
      }
    } finally {
      setFetching(false);
    }
  };

  // --- 1. FETCH DATA (Real-time from Backend) ---
  useEffect(() => {
    fetchData();
  }, [companyName]);

  // --- 2. HANDLER: POST & UPDATE JOB ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = {
      ...Object.fromEntries(formData.entries()),
      companyName: companyName, //
    };

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (editingJob) {
        await axios.put(
          `https://davv-backend-api.onrender.com/api/jobs/${editingJob._id}`,
          jobData,
          config,
        );
        alert("Job Updated Successfully!");
      } else {
        await axios.post(
          "https://davv-backend-api.onrender.com/api/jobs/post",
          jobData,
          config,
        );
        alert("Job Drive Published Successfully!");
      }

      setEditingJob(null);
      e.target.reset();
      setActiveTab("manage-vacancies");
      fetchData();
    } catch (error) {
      console.error("Post Job Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Action failed. Please refresh the page.";
      alert(errorMsg);
    }
  };

  // HANDLER: DELETE JOB
  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vacancy?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://davv-backend-api.onrender.com/api/jobs/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchData(); // List refresh
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const handleDecision = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://davv-backend-api.onrender.com/api/jobs/status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCandidates((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c)),
      );
      setSelectedStudent(null);
      alert(`Candidate ${status}!`);
    } catch (error) {
      alert("Update failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div
      className="flex h-screen bg-[#F4F7FA] font-sans text-slate-900 overflow-hidden w-full"
      onClick={() => {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }}
    >
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-[15px] uppercase">HR PORTAL</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                {companyName}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 mt-4">
          <SidebarBtn
            id="dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab}
            onClick={setActiveTab}
          />
          <SidebarBtn
            id="applicants"
            icon={<Users size={20} />}
            label="Applicant Tracking"
            active={activeTab}
            onClick={setActiveTab}
          />
          <SidebarBtn
            id="post-job"
            icon={<Plus size={20} />}
            label="Job Post"
            active={activeTab}
            onClick={setActiveTab}
          />
          <SidebarBtn
            id="manage-vacancies"
            icon={<Briefcase size={20} />}
            label="Manage Vacancies"
            active={activeTab}
            onClick={setActiveTab}
          />
        </nav>

        <div className="p-6 pb-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-500 py-3.5 rounded-2xl text-sm font-bold hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="px-10 py-5 flex justify-between items-center sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 shadow-sm px-5 py-2.5 rounded-full">
            <Briefcase size={16} className="text-indigo-600" />
            <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
              ACTIVE RECRUITMENT
            </span>
          </div>

          <div className="flex items-center gap-8">
            {/* NOTIFICATIONS */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div
                className="relative cursor-pointer p-2"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell
                  size={22}
                  className={
                    isNotificationsOpen ? "text-indigo-600" : "text-slate-400"
                  }
                />
                {candidates.filter((a) => a.status === "Pending").length >
                  0 && (
                  <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50"
                  >
                    <div className="p-4 border-b font-black text-sm">
                      Notifications
                    </div>
                    <div className="max-h-60 overflow-y-auto p-4 space-y-3 text-xs">
                      {candidates.filter((a) => a.status === "Pending").length >
                      0 ? (
                        candidates
                          .filter((a) => a.status === "Pending")
                          .map((c) => (
                            <p key={c._id}>
                              <b>{c.student?.fullName}</b> applied for{" "}
                              {c.job?.role}
                            </p>
                          ))
                      ) : (
                        <p className="text-slate-400">No new alerts</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div
                className="flex items-center gap-4 cursor-pointer pl-8 border-l border-slate-200 group"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black">
                  {userInfo.name[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold group-hover:text-indigo-600 transition-colors">
                    {userInfo.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {companyName}
                  </p>
                </div>
              </div>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-2"
                  >
                    <div className="p-4 border-b mb-2">
                      <p className="font-black text-sm">{userInfo.name}</p>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase">
                        {userInfo.email}
                      </p>
                    </div>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 rounded-xl transition-all">
                      Account Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl mt-1"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* WELCOME BANNER */}
                <div className="lg:col-span-7 bg-gradient-to-br from-[#1B1941] to-[#141235] rounded-[2.5rem] p-12 text-white relative shadow-xl overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-3 flex items-center gap-3">
                      Welcome, {companyName} HR{" "}
                      <Sparkles className="text-amber-400" size={28} />
                    </h2>
                    <p className="text-indigo-100 font-medium text-lg mb-10">
                      You have{" "}
                      {candidates.filter((a) => a.status === "Pending").length}{" "}
                      new applicants to review.
                    </p>
                    <button
                      onClick={() => setActiveTab("applicants")}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      Review Applicants <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                    <Building2 size={240} />
                  </div>
                </div>

                {/* STATS */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-6">
                  <StatBox
                    label="Active Jobs"
                    value={myJobs.length}
                    icon={<Briefcase size={22} />}
                    color="text-indigo-600"
                  />
                  <StatBox
                    label="Total Applicants"
                    value={candidates.length}
                    icon={<Users size={22} />}
                    color="text-purple-600"
                  />
                </div>

                {/* RECENT VACANCIES */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Briefcase size={24} className="text-indigo-600" /> Recently
                    Posted Vacancies
                  </h3>
                  <div className="space-y-4">
                    {myJobs.slice(0, 3).map((job) => (
                      <div
                        key={job._id}
                        className="bg-slate-50 rounded-3xl p-6 flex justify-between items-center border border-slate-100"
                      >
                        <div>
                          <h4 className="font-bold">{job.role}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Min CGPA: {job.minCGPA} • Package: {job.salary} LPA
                          </p>
                        </div>
                        <div className="text-right font-black text-indigo-600 text-2xl">
                          {
                            candidates.filter((c) => c.job?._id === job._id)
                              .length
                          }{" "}
                          <span className="block text-[9px] text-slate-400 uppercase tracking-widest">
                            Applied
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CALL TO ACTION */}
                <div className="lg:col-span-5 bg-[#F8FAFF] rounded-[2.5rem] p-10 shadow-sm border border-indigo-50 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white border border-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-sm text-indigo-600">
                    <Plus size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black mb-3">
                    Need more talent?
                  </h3>
                  <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4">
                    Post a new vacancy and let the system filter the best
                    candidates for you.
                  </p>
                  <button
                    onClick={() => setActiveTab("post-job")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20"
                  >
                    Create New Vacancy
                  </button>
                </div>
              </motion.div>
            )}

            {/* FORM FOR CREATE / EDIT JOB */}
            {activeTab === "post-job" && (
              <motion.div
                key="post"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 pointer-events-none"></div>
                <h2 className="text-3xl font-black mb-2">
                  {editingJob ? "Update Vacancy" : "Create New Vacancy"}
                </h2>
                <p className="text-sm font-bold text-slate-400 mb-10 uppercase tracking-widest">
                  {editingJob
                    ? "Modify existing recruitment details"
                    : "Post automated recruitment drive"}
                </p>
                <form className="space-y-8" onSubmit={handlePostJob}>
                  <div className="grid grid-cols-2 gap-8">
                    <InputField
                      label="Company Name *"
                      name="companyName"
                      defaultValue={editingJob?.companyName || companyName}
                      placeholder="e.g. Google"
                    />
                    <InputField
                      label="Job Designation *"
                      name="role"
                      defaultValue={editingJob?.role}
                      placeholder="e.g. Full Stack Engineer"
                    />
                    <InputField
                      label="Salary Package (LPA) *"
                      name="salary"
                      defaultValue={editingJob?.salary}
                      placeholder="e.g. 12.0"
                    />
                    <InputField
                      label="Min CGPA Required *"
                      name="minCGPA"
                      defaultValue={editingJob?.minCGPA}
                      type="number"
                      step="0.1"
                      placeholder="e.g. 7.5"
                    />
                    <InputField
                      label="Job Location *"
                      name="location"
                      defaultValue={editingJob?.location}
                      placeholder="e.g. Indore / Remote"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Application Deadline *
                      </label>
                      <input
                        name="deadline"
                        type="datetime-local"
                        required
                        defaultValue={
                          editingJob?.deadline
                            ? new Date(editingJob.deadline)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Eligibility & Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      defaultValue={editingJob?.description}
                      rows="4"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                      placeholder="Describe the role and key requirements..."
                    ></textarea>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button
                      type="submit"
                      className="px-10 py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-3 uppercase tracking-widest text-sm italic"
                    >
                      {editingJob ? "Save Changes" : "Publish Drive"}{" "}
                      <Send size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJob(null);
                        setActiveTab(
                          editingJob ? "manage-vacancies" : "dashboard",
                        );
                      }}
                      className="px-10 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                    >
                      {editingJob ? "Cancel" : "Discard"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* MANAGE VACANCIES */}
            {activeTab === "manage-vacancies" && (
              <motion.div
                key="manage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100"
              >
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <Briefcase className="text-indigo-600" /> Manage Active
                  Vacancies
                </h3>
                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <div
                      key={job._id}
                      className="p-6 border border-slate-100 rounded-3xl flex justify-between items-center hover:bg-slate-50 transition-all border-l-4 border-l-indigo-500"
                    >
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">
                          {job.role}
                        </h4>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1 tracking-widest">
                          {job.companyName} • {job.salary} LPA
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                          <Clock size={12} /> Deadline:{" "}
                          {job.deadline
                            ? new Date(job.deadline).toLocaleString()
                            : "Not set"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setActiveTab("post-job");
                          }}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {myJobs.length === 0 && (
                    <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      No vacancies found.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* APPLICANT LISTING */}
            {activeTab === "applicants" && (
              <motion.div
                key="apps"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-xl font-black">Applicant Tracking</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-10 py-6">Candidate</th>
                        <th className="px-10 py-6">Role</th>
                        <th className="px-10 py-6 text-center">Score</th>
                        <th className="px-10 py-6 text-center">View</th>
                        <th className="px-10 py-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {candidates.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-slate-50/50 transition-all"
                        >
                          <td className="px-10 py-6 font-bold text-sm">
                            {app.student?.fullName}{" "}
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">
                              {app.student?.enrollmentNo}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-sm font-bold text-indigo-600">
                            {app.job?.role}
                          </td>
                          <td className="px-10 py-6 text-center font-black">
                            {app.student?.cgpa} CGPA
                          </td>
                          <td className="px-10 py-6 text-center">
                            <button
                              onClick={() => setSelectedStudent(app)}
                              className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <FileText size={18} />
                            </button>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <span
                              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${app.status === "Selected" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
                            >
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* DECISION MODAL (Student Profile View) */}
      <AnimatePresence>
        {selectedStudent && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-8 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-6xl h-[85vh] rounded-[2.5rem] overflow-hidden flex shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 bg-slate-100 flex items-center justify-center p-10 relative">
                <div className="w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden">
                  {selectedStudent.student?.resume ? (
                    <iframe
                      src={`https://davv-backend-api.onrender.com${selectedStudent.student.resume}`}
                      className="w-full h-full border-0"
                    ></iframe>
                  ) : (
                    <div className="h-full flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">
                      No Resume Found
                    </div>
                  )}
                </div>
              </div>
              <div className="w-[400px] p-10 flex flex-col justify-between border-l border-slate-100 bg-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-xl uppercase">
                    {selectedStudent.student?.fullName[0]}
                  </div>
                  <h3 className="text-2xl font-black">
                    {selectedStudent.student?.fullName}
                  </h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                    {selectedStudent.student?.enrollmentNo}
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        Score
                      </p>
                      <p className="font-black text-indigo-600">
                        {selectedStudent.student?.cgpa} CGPA
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        Status
                      </p>
                      <p className="font-black text-amber-600 uppercase text-[9px]">
                        {selectedStudent.status}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() =>
                      handleDecision(selectedStudent._id, "Selected")
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 tracking-widest"
                  >
                    <UserCheck size={18} /> Shortlist
                  </button>
                  <button
                    onClick={() =>
                      handleDecision(selectedStudent._id, "Rejected")
                    }
                    className="w-full bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 tracking-widest"
                  >
                    <UserMinus size={18} /> Decline
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest"
                  >
                    Back
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// COMPONENTS
const SidebarBtn = ({ id, icon, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${active === id ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" : "text-slate-500 hover:bg-slate-50"}`}
  >
    {icon} {label}
  </button>
);

const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col justify-center">
    <div
      className={`w-12 h-12 bg-slate-50 ${color} rounded-2xl flex items-center justify-center mb-8`}
    >
      {icon}
    </div>
    <h3 className="text-5xl font-black text-slate-900 mb-2">{value}</h3>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </p>
  </div>
);

const InputField = ({ label, defaultValue, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      defaultValue={defaultValue}
      {...props}
      required
      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
    />
  </div>
);
