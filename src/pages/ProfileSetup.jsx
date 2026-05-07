import React, { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  FileUp,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  School,
  MapPin,
  Target,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Initial fetch loader
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    age: "",
    gender: "",
    maritalStatus: "Single",
    phone: "",
    aadharNumber: "",
    address: "",
    tenthPercent: "",
    twelfthPercent: "",
    gradDegree: "",
    gradPercent: "",
    pgDegree: "Master of Computer Applications (MCA)",
    enrollmentNo: "",
    mcaYear: "1st Year",
    branch: "",
  });

  const [files, setFiles] = useState({
    profilePic: null,
    resume: null,
    marksheetPG: null,
    marksheet10th: null,
    marksheet12th: null,
    marksheetGrad: null,
  });

  // --- 1. SESSION GETTER ---
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  // --- 2. FETCH EXISTING DATA (If any) ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await fetch(
          "http://https://davv-backend-api.onrender.com/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (response.ok && result) {
          // Fill form if user already has some data saved
          setFormData((prev) => ({ ...prev, ...result }));
        }
      } catch (err) {
        console.log("No existing profile found or backend offline");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const validateStep = () => {
    // Basic validation for mandatory fields in current step
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  // --- 3. FINAL SUBMIT TO REAL API ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();

    // Append text data
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // Append files
    Object.keys(files).forEach((key) => {
      if (files[key]) data.append(key, files[key]);
    });

    try {
      const response = await fetch(
        "http://https://davv-backend-api.onrender.com/api/users/profile",
        {
          method: "PUT", // Put for updating profile
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        },
      );

      const result = await response.json();

      if (response.ok) {
        // Sync local storage with new profile data
        const updatedInfo = { ...userInfo, ...(result.user || result) };
        localStorage.setItem("userInfo", JSON.stringify(updatedInfo));

        alert("✨ Profile Updated Successfully!");
        navigate("/student-dashboard");
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert("Backend connection failed! Is server running?");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className="animate-spin text-indigo-600 mx-auto mb-4"
            size={48}
          />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Initializing Secure Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-10 flex flex-col items-center font-sans transition-all">
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3 uppercase">
          <Edit3 size={32} className="text-indigo-500" /> Complete Profile
        </h2>
        <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">
          DAVV Official Record Maintenance
        </p>
      </div>

      {/* Modern Stepper */}
      <div className="w-full max-w-5xl flex justify-between mb-12 px-6 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 rounded-full"></div>
        <div
          className={`absolute top-1/2 left-0 h-0.5 bg-indigo-600 -z-10 rounded-full transition-all duration-500`}
          style={{ width: `${(step - 1) * 25}%` }}
        ></div>

        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center gap-3 text-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-black transition-all shadow-lg ${step >= s ? "bg-indigo-600 text-white scale-110" : "bg-white text-slate-400"}`}
            >
              {s === 1 ? (
                <User size={24} />
              ) : s === 2 ? (
                <MapPin size={24} />
              ) : s === 3 ? (
                <BookOpen size={24} />
              ) : s === 4 ? (
                <School size={24} />
              ) : (
                <FileUp size={24} />
              )}
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${step >= s ? "text-indigo-700" : "text-slate-400"}`}
            >
              {s === 1
                ? "Personal"
                : s === 2
                  ? "Contact"
                  : s === 3
                    ? "Academics"
                    : s === 4
                      ? "College"
                      : "Documents"}
            </span>
          </div>
        ))}
      </div>

      {/* Main Form Box */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white w-full max-w-6xl transition-all">
        <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}>
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="section-title">
                <User size={20} /> Identity Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="field-group">
                  <label>First Name*</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Middle Name</label>
                  <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="input-v2"
                  />
                </div>
                <div className="field-group">
                  <label>Last Name*</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group md:col-span-2">
                  <label>Father's Name*</label>
                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Mother's Name</label>
                  <input
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    className="input-v2"
                  />
                </div>
                <div className="field-group">
                  <label>Age</label>
                  <input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input-v2"
                  />
                </div>
                <div className="field-group">
                  <label>Gender*</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="section-title">
                <ShieldCheck size={20} /> Secure Contact Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="field-group">
                  <label>Mobile (10 Digits)*</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    maxLength="10"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Aadhar Number (12 Digits)*</label>
                  <input
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    maxLength="12"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group md:col-span-2">
                  <label>Permanent Residence Address*</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-v2"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="section-title">
                <BookOpen size={20} /> Academic History
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="field-group">
                  <label>10th Percent*</label>
                  <input
                    name="tenthPercent"
                    value={formData.tenthPercent}
                    type="number"
                    step="0.01"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>12th Percent*</label>
                  <input
                    name="twelfthPercent"
                    value={formData.twelfthPercent}
                    type="number"
                    step="0.01"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>UG Degree*</label>
                  <input
                    name="gradDegree"
                    value={formData.gradDegree}
                    placeholder="e.g. BCA/BSc"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>UG Percent/CGPA*</label>
                  <input
                    name="gradPercent"
                    value={formData.gradPercent}
                    type="number"
                    step="0.01"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h4 className="section-title">
                <School size={20} /> Current Course Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="field-group">
                  <label>University Enrollment No*</label>
                  <input
                    name="enrollmentNo"
                    value={formData.enrollmentNo}
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Branch/Stream*</label>
                  <input
                    name="branch"
                    value={formData.branch}
                    placeholder="e.g. Computer Application"
                    onChange={handleInputChange}
                    className="input-v2"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Course Year</label>
                  <select
                    name="mcaYear"
                    value={formData.mcaYear}
                    onChange={handleInputChange}
                    className="input-v2"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h4 className="section-title">
                <FileUp size={20} /> Document Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="upload-card">
                  <label className="doc-label italic text-indigo-600 font-black tracking-widest">
                    MCA Current Marksheet (AI SCAN)*
                  </label>
                  <input
                    type="file"
                    name="marksheetPG"
                    onChange={handleFileChange}
                    className="doc-input"
                    required
                  />
                </div>
                <div className="upload-card">
                  <label className="doc-label">
                    Professional Resume (PDF Only)*
                  </label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    className="doc-input"
                    required
                  />
                </div>
                <div className="upload-card">
                  <label className="doc-label">10th Marksheet</label>
                  <input
                    type="file"
                    name="marksheet10th"
                    onChange={handleFileChange}
                    className="doc-input"
                  />
                </div>
                <div className="upload-card">
                  <label className="doc-label">12th Marksheet</label>
                  <input
                    type="file"
                    name="marksheet12th"
                    onChange={handleFileChange}
                    className="doc-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex justify-between pt-8 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="nav-btn-outline flex items-center gap-2"
              >
                <ChevronLeft size={18} /> BACK
              </button>
            ) : (
              <div />
            )}

            <button
              type={step === 5 ? "submit" : "button"}
              onClick={step < 5 ? nextStep : undefined}
              className="nav-btn-primary flex items-center gap-2 shadow-xl shadow-indigo-200"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : step === 5 ? (
                "SUBMIT PROFILE"
              ) : (
                "NEXT STEP"
              )}
              {step < 5 && <ChevronRight size={18} />}
            </button>
          </div>
        </form>
      </div>

      {/* Styled Internal CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .section-title { font-size: 14px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
        .field-group label { display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 7px; margin-left: 5px; }
        .input-v2 { width: 100%; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; font-weight: 700; color: #1e293b; outline: none; transition: 0.2s; }
        .input-v2:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.05); }
        .upload-card { padding: 20px; border: 1px solid #e2e8f0; border-radius: 20px; transition: all 0.2s; background: #fcfcfc; }
        .doc-label { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
        .doc-input { font-size: 10px; font-weight: 700; color: #94a3b8; cursor: pointer; width: 100%; }
        .nav-btn-primary { background: #4f46e5; color: white; padding: 14px 35px; border-radius: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
        .nav-btn-outline { font-weight: 900; color: #94a3b8; padding: 14px 25px; text-transform: uppercase; font-size: 12px; }
      `,
        }}
      />
    </div>
  );
}
