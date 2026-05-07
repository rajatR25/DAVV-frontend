import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, Users, Building2, Send, CheckCircle, 
  Activity, LayoutDashboard, LogOut, Clock,
  Bell, FileText, Eye, X, MapPin, GraduationCap, Briefcase, PlusCircle
} from 'lucide-react';

export default function AdminDashboard() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('overview'); 
  const [students, setStudents] = useState([]); 
  const [applications, setApplications] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inviteStatus, setInviteStatus] = useState('');

  // --- FETCH ALL NECESSARY DATA (STUDENTS & APPLICATIONS) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [studentRes, appRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all-students", config),
          axios.get("http://localhost:5000/api/jobs/applications", config)
        ]);
        
        setStudents(studentRes.data);
        setApplications(appRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setLoading(false);

        // AUTO-LOGOUT LOGIC ADDED HERE
        if (error.response && error.response.status === 401) {
          alert("Session Expired! For your security, you have been logged out. Please log in again.");
          localStorage.clear();
          window.location.reload();
        }
      }
    };
    fetchData();
  }, []);

  // --- HANDLER: VERIFY STUDENT PROFILE ---
  const handleVerify = async (studentId) => {
    if (!window.confirm("Verify this student's profile?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/users/verify/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(prev => prev.map(s => s._id === studentId ? { ...s, isVerified: true } : s));
      if(selectedStudent?._id === studentId) setSelectedStudent({...selectedStudent, isVerified: true});
      alert("Student Verified Successfully!");
    } catch (error) {
      alert("Verification Failed!");
    }
  };

  // --- HANDLER: POST NEW JOB DRIVE ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = Object.fromEntries(formData.entries());

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/jobs/post", jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Job Drive Published Successfully!");
      e.target.reset();
      setActiveTab('overview');
    } catch (error) {
      alert("Failed to post job. Ensure all fields are filled.");
    }
  };
  // --- HANDLER: INVITE HR ---
  const handleInviteHR = async (e) => {
    e.preventDefault();
    setInviteStatus('loading');
    const companyName = e.target.companyName.value;
    const email = e.target.email.value;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/users/invite-hr", 
        { companyName, email }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteStatus('success');
      alert("Invite sent successfully!");
      e.target.reset();
    } catch (error) {
      setInviteStatus('');
      alert("Failed to send invite.");
    }
  };

  // --- HANDLER: UPDATE APPLICATION STATUS ---
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/jobs/applications/${appId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(prev => prev.map(app => app._id === appId ? { ...app, status: newStatus } : app));
      alert(`Application marked as ${newStatus}`);
    } catch (error) {
      alert("Update failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- CALCULATE STATS ---
  const pendingVerifications = students.filter(s => s.isProfileComplete && !s.isVerified);
  const totalVerified = students.filter(s => s.isVerified).length;

  // --- COMPONENT: STUDENT PROFILE MODAL ---
  const StudentModal = () => {
    if (!selectedStudent) return null;
    const s = selectedStudent;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative p-8 md:p-12">
          <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400" /></button>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10 border-b border-slate-100 pb-10">
            <div className="w-32 h-32 bg-blue-50 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
              {s.profilePic ? <img src={`http://localhost:5000${s.profilePic}`} className="w-full h-full object-cover" alt="Profile" /> : <Users size={48} className="text-blue-200" />}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-800 mb-2">{s.fullName || s.name}</h2>
              <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4">{s.enrollmentNo}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => s.resume ? window.open(`http://localhost:5000${s.resume}`, '_blank') : alert("No Resume")} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><FileText size={14}/> Resume</button>
                <button onClick={() => s.marksheetPG ? window.open(`http://localhost:5000${s.marksheetPG}`, '_blank') : alert("No Marksheet")} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Eye size={14}/> Marksheet</button>
                {!s.isVerified && <button onClick={() => handleVerify(s._id)} className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase">Verify Profile</button>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="bg-slate-50 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><MapPin size={14}/> Personal</h4>
              <DetailRow label="Father" value={s.fatherName} />
              <DetailRow label="Mother" value={s.motherName} />
              <DetailRow label="Phone" value={s.phone} />
              <DetailRow label="Address" value={s.address} />
            </section>
            <section className="bg-slate-50 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><GraduationCap size={14}/> Academics</h4>
              <DetailRow label="CGPA" value={s.cgpa} highlight />
              <DetailRow label="10th %" value={s.tenthPercent} />
              <DetailRow label="12th %" value={s.twelfthPercent} />
              <DetailRow label="Grad %" value={s.gradPercent} />
            </section>
          </div>
        </div>
      </div>
    );
  };

  const DetailRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
      <span className={`text-sm font-black ${highlight ? 'text-blue-600' : 'text-slate-700'}`}>{value || 'N/A'}</span>
    </div>
  );

  // --- RENDER MODULES ---
  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-[#1d3c93] to-[#2b52cd] text-white rounded-[2rem] p-8">
          <h2 className="text-3xl font-black mb-2">Welcome, TPO Admin</h2>
          <p className="text-blue-100">Monitoring Placement Drive 2026.</p>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase">Verified</p>
          <h4 className="text-4xl font-black text-emerald-500">{totalVerified}</h4>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase">Total Students</p>
          <h4 className="text-4xl font-black text-blue-600">{students.length}</h4>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2"><Clock className="text-orange-400"/> Verification Queue</h3>
        {pendingVerifications.map(student => (
          <div key={student._id} className="flex items-center justify-between p-4 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black uppercase text-slate-400">{student.fullName?.charAt(0)}</div>
              <div><p className="font-bold text-sm">{student.fullName}</p><p className="text-[10px] text-slate-400">{student.enrollmentNo}</p></div>
            </div>
            <button onClick={() => setSelectedStudent(student)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Review</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudentList = () => (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm overflow-x-auto">
      <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Users className="text-blue-600"/> Student Directory</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
            <th className="pb-4">Student</th><th className="pb-4">CGPA</th><th className="pb-4">Status</th><th className="pb-4 text-center">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {students.map(s => (
            <tr key={s._id} className="hover:bg-slate-50 transition-colors">
              <td className="py-5 font-bold text-sm">{s.fullName} <p className="text-[10px] text-slate-400">{s.enrollmentNo}</p></td>
              <td className="py-5 font-black">{s.cgpa || '0.0'}</td>
              <td className="py-5"><span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${s.isVerified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>{s.isVerified ? 'Verified' : 'Pending'}</span></td>
              <td className="py-5 text-center"><button onClick={() => setSelectedStudent(s)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye size={18}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f7f9] overflow-hidden">
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col p-8 flex-shrink-0">
         <div className="flex items-center gap-3 mb-10"><Shield size={22} className="text-blue-600" /><h1 className="font-black text-2xl">TPO ADMIN</h1></div>
         <nav className="flex-1 space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}><LayoutDashboard size={20}/> Overview</button>
            <button onClick={() => setActiveTab('student-list')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm ${activeTab === 'student-list' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><Users size={20}/> Students</button>
            <button onClick={() => setActiveTab('post-job')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm ${activeTab === 'post-job' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><PlusCircle size={20}/> Post Job</button>
            <button onClick={() => setActiveTab('invite-hr')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm ${activeTab === 'invite-hr' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><Send size={20}/> Invite HR</button>
            <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm ${activeTab === 'applications' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><Activity size={20}/> Applications</button>
         </nav>
         <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-4 w-full text-red-500 font-bold"><LogOut size={20}/> Logout</button>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafd]">
        <header className="flex justify-between items-center mb-10"><span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"><Shield size={12} className="inline mr-2"/> Master Access</span><div className="w-10 h-10 bg-[#1d3c93] text-white rounded-full flex items-center justify-center font-black">A</div></header>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'student-list' && renderStudentList()}
        {activeTab === 'post-job' && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm max-w-4xl mx-auto">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><PlusCircle className="text-blue-600"/> New Placement Drive</h3>
            <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="companyName" placeholder="Company Name" required className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
              <input name="role" placeholder="Job Role" required className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
              <textarea name="description" placeholder="Description" rows="3" className="md:col-span-2 p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none"></textarea>
              <input name="minCGPA" type="number" step="0.1" placeholder="Min CGPA" required className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
              <input name="salary" placeholder="Salary (LPA)" required className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
              <button type="submit" className="md:col-span-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase">Publish Now</button>
            </form>
          </div>
        )}
        {activeTab === 'invite-hr' && (
           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm max-w-xl mx-auto">
             <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Send className="text-blue-600"/> Invite HRs</h3>
             <form onSubmit={handleInviteHR} className="space-y-6">
               <input name="companyName" placeholder="Company Name" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
               <input name="email" type="email" placeholder="HR Email" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
               <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase">{inviteStatus === 'loading' ? 'Processing...' : 'Generate Invite Link'}</button>
             </form>
           </div>
        )}
        {activeTab === 'applications' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm overflow-x-auto">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Activity className="text-blue-600"/> Applications</h3>
            <table className="w-full text-left">
              <thead><tr className="text-slate-400 uppercase text-[10px] font-black border-b border-slate-100"><th className="pb-4">Student</th><th className="pb-4">Company</th><th className="pb-4">Status</th><th className="pb-4 text-center">Decision</th></tr></thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50">
                    <td className="py-5 font-bold text-sm">{app.student?.fullName}</td>
                    <td className="py-5 font-bold text-sm text-blue-600">{app.job?.companyName} <p className="text-[10px] text-slate-400">{app.job?.role}</p></td>
                    <td className="py-5"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${app.status === 'Selected' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>{app.status}</span></td>
                    <td className="py-5 text-center flex justify-center gap-2">
                      <button onClick={() => handleUpdateStatus(app._id, 'Selected')} className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={16}/></button>
                      <button onClick={() => handleUpdateStatus(app._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg"><X size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <StudentModal />
    </div>
  );
}