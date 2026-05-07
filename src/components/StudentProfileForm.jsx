import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; 
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Loader2,
  Fingerprint,
  Image as ImageIcon,
  XCircle,
  Award,
  Search,
  Linkedin,
  Github,
} from "lucide-react";

export default function App({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const courseBranchMapping = {
    BCA: ["Computer Application"],
    "M.Sc.": ["CS", "IT"],
    MCA: ["Computer Application"],
    "M.Tech": [
      "CS",
      "CS (Cyber Security)",
      "NM & IS",
      "IA & SE",
      "CS (Executive)",
    ],
    MBA: ["CM"],
    PhD: ["CS"],
  };

  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    enrollmentNo: "",
    // Step 2: Academic
    college: "",
    university: "",
    course: "",
    branch: "",
    semester: "",
    cgpa: "",
    tenth: "",
    twelfth: "",
    graduation: "",
    // Step 3: Skills & Profiles
    skills: [],
    languages: "",
    project: "",
    internship: "",
    linkedin: "",
    github: "",
    // Step 4: Files
    profilePic: null,
    resume: null,
    agree: false,
    existingProfilePic: "",
    existingResume: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Real backend API se data fetch karna
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          if (res.data.isProfileComplete) {
            setIsCompleted(true);
          }

          setFormData((prev) => ({
            ...prev,
            fullName: res.data.name || prev.fullName,
            fatherName: res.data.fatherName || prev.fatherName,
            motherName: res.data.motherName || prev.motherName,
            dob: res.data.dob || prev.dob,
            gender: res.data.gender || prev.gender,
            mobile: res.data.phone || prev.mobile,
            email: res.data.email || prev.email,
            address: res.data.address || prev.address,
            enrollmentNo: res.data.enrollmentNo || prev.enrollmentNo,
            college: res.data.college || prev.college,
            university: res.data.university || prev.university,
            course: res.data.course || prev.course,
            branch: res.data.branch || prev.branch,
            semester: res.data.semester || prev.semester,
            cgpa: res.data.cgpa || prev.cgpa,
            tenth: res.data.tenthPercent || prev.tenth,
            twelfth: res.data.twelfthPercent || prev.twelfth,
            graduation: res.data.gradPercent || prev.graduation,
            skills: res.data.skills
              ? Array.isArray(res.data.skills)
                ? res.data.skills
                : res.data.skills.split(",").map((s) => s.trim())
              : prev.skills,
            languages: res.data.languages || prev.languages,
            project: res.data.project || prev.project,
            internship: res.data.internship || prev.internship,
            linkedin: res.data.linkedin || prev.linkedin,
            github: res.data.github || prev.github,
            existingProfilePic: res.data.profilePic || "",
            existingResume: res.data.resume || ""
          }));

          if (res.data.profilePic) {
            setProfilePreview(`http://localhost:5000${res.data.profilePic}`);
          }
        }
      } catch (err) {
        console.error("Profile load karne me error:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      if (name === "profilePic") {
        const maxSize = 2 * 1024 * 1024; // 2 MB limit
        const minSize = 10 * 1024; // 10 KB limit

        if (file.size > maxSize) {
          alert(
            "Error: Profile picture is too large. Maximum allowed size is 2 MB.",
          );
          e.target.value = "";
          return;
        }

        if (file.size < minSize) {
          alert(
            "Error: Profile picture is too small. Minimum allowed size is 10 KB.",
          );
          e.target.value = "";
          return;
        }

        setProfilePreview(URL.createObjectURL(file));
      }

      // Add Resume Size Validation 
      if (name === "resume") {
        const maxSize = 5 * 1024 * 1024; // 5 MB limit
        const minSize = 10 * 1024; // 10 KB limit

        if (file.size > maxSize) {
          alert(
            "Error: Resume file is too large. Maximum allowed size is 5 MB.",
          );
          e.target.value = "";
          return;
        }

        if (file.size < minSize) {
          alert(
            "Error: Resume file is too small or corrupted. Minimum allowed size is 10 KB.",
          );
          e.target.value = "";
          return;
        }
      }

      setFormData({ ...formData, [name]: file });
    } else {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
        if (name === "course") {
          updatedData.branch = "";
        }
        return updatedData;
      });
    }
  };

  const clearFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    if (fieldName === "profilePic") {
      setProfilePreview(
        formData.existingProfilePic
          ? `http://localhost:5000${formData.existingProfilePic}`
          : null,
      );
    }
    const fileInput = document.getElementById(`fileUpload-${fieldName}`);
    if (fileInput) fileInput.value = "";
  };

  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.fullName &&
        formData.enrollmentNo &&
        formData.dob &&
        formData.gender &&
        formData.mobile &&
        formData.email
      );
    }

    if (step === 2) {
      return (
        formData.college &&
        formData.course &&
        formData.branch &&
        formData.semester &&
        formData.cgpa &&
        formData.tenth &&
        formData.twelfth &&
        formData.graduation
      );
    }

    if (step === 3) {
      return formData.skills && formData.skills.length > 0;
    }

    if (step === 4) {
      const hasPhoto = formData.profilePic || formData.existingProfilePic;
      const hasResume = formData.resume || formData.existingResume;
      return hasPhoto && hasResume && formData.agree;
    }

    return false;
  };

  const nextStep = () => {
    if (isStepValid()) setStep((prev) => prev + 1);
  };
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "skills") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      await axios.put(
        "http://localhost:5000/api/users/advanced-profile-update",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert(" Profile successfully saved in database!");
      setIsCompleted(true); 
      if (onComplete) onComplete();
    } catch (error) {
      alert(
        "Error: " +
          (error.response?.data?.message || "Server error while saving"),
      );
    } finally {
      setLoading(false);
    }
  };

  const stepDetails = [
    { id: 1, title: "Personal", icon: <User size={20} /> },
    { id: 2, title: "Academic", icon: <GraduationCap size={20} /> },
    { id: 3, title: "Skills", icon: <Briefcase size={20} /> },
    { id: 4, title: "Documents", icon: <FileText size={20} /> },
  ];

  const formVariants = {
    hidden: { opacity: 0, x: 20, filter: "blur(5px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      x: -20,
      filter: "blur(5px)",
      transition: { duration: 0.2 },
    },
  };

  if (isCompleted) {
    return (
      <div
        className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 sm:p-8"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-3xl bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] text-center"
        >
          <div className="flex justify-center mb-6 relative">
            <div className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1 shadow-2xl relative bg-white flex items-center justify-center overflow-hidden">
              {profilePreview ? (
                <img
                  src={
                    profilePreview ||
                    `http://localhost:5000${formData.existingProfilePic}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={64} className="text-slate-300" />
              )}
              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full border-4 border-white">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">
            {formData.fullName || "Student Name"}
          </h1>
          <p className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-8">
            {formData.enrollmentNo || "ENROLLMENT-NO"} •{" "}
            {formData.course || "Course"} ({formData.branch || "Branch"})
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <InfoCard
              icon={<GraduationCap />}
              label="Aggregate CGPA"
              value={`${formData.cgpa || "N/A"} / 10.0`}
              highlight
            />
            <InfoCard
              icon={<FileText />}
              label="Resume Uploaded"
              value="Verified & Active"
              highlight
            />
            <InfoCard
              icon={<Briefcase />}
              label="Technical Skills"
              value={`${formData.skills.length} Skills Added`}
            />
            <InfoCard
              icon={<MapPin />}
              label="Contact"
              value={formData.mobile || "N/A"}
            />
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-500">
              Your profile is verified and active for campus placements.
            </p>
            <button
              onClick={() => setIsCompleted(false)}
              className="mt-4 px-6 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Edit Profile Details
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .custom-premium-font { font-family: 'Outfit', sans-serif; }
      `,
        }}
      />

      <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 sm:p-8 custom-premium-font">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

        <div className="relative z-10 w-full max-w-4xl bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)]">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 mb-3 tracking-tight">
              Student Profile
            </h2>
            <p className="text-slate-500 font-medium">
              Complete all steps to unlock campus drives.
            </p>
          </div>

          <div className="flex items-center justify-between mb-12 relative px-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-200/50 -z-10 rounded-full"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 -z-10 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {stepDetails.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-3 bg-transparent"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-500 ${step >= s.id ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-white text-white shadow-xl shadow-blue-500/30 scale-110" : "bg-white border-slate-100 text-slate-300"}`}
                >
                  {step > s.id ? <CheckCircle2 size={24} /> : s.icon}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest hidden md:block transition-colors duration-300 ${step >= s.id ? "text-indigo-700" : "text-slate-400"}`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="min-h-[350px] flex flex-col justify-between"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                {/* STEP 1: PERSONAL DETAILS */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup
                      label="Enrollment Number"
                      name="enrollmentNo"
                      value={formData.enrollmentNo}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup
                      label="Father's Name"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                    />
                    <InputGroup
                      label="Mother's Name"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                    />
                    <InputGroup
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                    <div className="space-y-2 group">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full py-4 px-5 bg-white/70 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-sm text-slate-700"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <InputGroup
                      label="Mobile Number"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      required
                    />
                    <div className="md:col-span-2">
                      <InputGroup
                        label="Full Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: ACADEMIC DETAILS */}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="College Name"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup
                      label="University"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                    />

                    <div className="space-y-2 group">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        required
                        className="w-full py-4 px-5 bg-white/70 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-sm text-slate-700"
                      >
                        <option value="">Select Course</option>
                        {Object.keys(courseBranchMapping).map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                        disabled={!formData.course}
                        className={`w-full py-4 px-5 bg-white/70 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-sm text-slate-700 ${!formData.course ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">Select Branch</option>
                        {formData.course &&
                          courseBranchMapping[formData.course].map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
                        Semester <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                        className="w-full py-4 px-5 bg-white/70 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-sm text-slate-700"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </div>

                    <InputGroup
                      label="Current Aggregate CGPA"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 8.5"
                    />
                    <InputGroup
                      label="10th Percentage"
                      name="tenth"
                      value={formData.tenth}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup
                      label="12th Percentage"
                      name="twelfth"
                      value={formData.twelfth}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup
                      label="Graduation CGPA/Percentage"
                      name="graduation"
                      value={formData.graduation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                {/* STEP 3: SKILLS & PROJECTS */}
                {step === 3 && (
                  <div className="grid grid-cols-1 gap-6">
                    <MultiSelectSkills
                      label="Technical Skills"
                      selectedSkills={formData.skills}
                      onChange={(newSkills) =>
                        setFormData({ ...formData, skills: newSkills })
                      }
                      required
                    />

                    <InputGroup
                      label="Languages"
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="English, Hindi"
                    />
                    <div className="space-y-2 group">
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
                        Best Project Details
                      </label>
                      <textarea
                        name="project"
                        value={formData.project}
                        onChange={handleChange}
                        rows="3"
                        className="w-full py-4 px-5 bg-white/70 backdrop-blur-sm border-2 border-slate-100 rounded-2xl outline-none font-semibold text-sm text-slate-700 resize-none"
                      ></textarea>
                    </div>

                    {/* 🚀 Naye LinkedIn aur GitHub Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup
                        label="LinkedIn Profile"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        icon={<Linkedin size={16} />}
                      />
                      <InputGroup
                        label="GitHub Profile"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        icon={<Github size={16} />}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: DOCUMENTS & SUBMIT */}
                {step === 4 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ProfileUploadGroup
                        label="Profile Photograph"
                        name="profilePic"
                        onChange={handleChange}
                        preview={profilePreview}
                        onClear={() => clearFile("profilePic")}
                        required={!formData.existingProfilePic}
                      />
                      <ResumeUploadGroup
                        label="Updated Resume (PDF)"
                        name="resume"
                        onChange={handleChange}
                        file={formData.resume}
                        existingFile={formData.existingResume}
                        onClear={() => clearFile("resume")}
                        required={!formData.existingResume}
                      />
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-2xl">
                      <label className="flex items-start gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agree"
                          checked={formData.agree}
                          onChange={handleChange}
                          className="w-6 h-6 rounded-lg cursor-pointer"
                          required
                        />
                        <span className="text-sm font-semibold text-slate-600">
                          I declare that all information is true.{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Form Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100/80">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${step === 1 ? "opacity-0 cursor-default" : "bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                <ChevronLeft size={18} /> Back
              </button>

              {/*Changed to step < 4 */}
              {step < 4 ? (
                <div className="flex items-center gap-3">
                  {!isStepValid() && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest hidden md:block">
                      * Fill required fields
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`px-9 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${isStepValid() ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className={`px-10 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-widest flex items-center gap-3 transition-all duration-300 ${isStepValid() && !loading ? "bg-slate-900 text-white shadow-lg hover:bg-black" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {loading ? "Submitting..." : "Submit Profile"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ==========================================
// UI COMPONENTS
// ==========================================

const InputGroup = ({ label, icon, required, ...props }) => (
  <div className="space-y-2 group">
    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        required={required}
        className={`w-full py-4 pr-5 bg-white/70 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-semibold text-sm text-slate-800 ${icon ? "pl-11" : "pl-5"} ${props.disabled ? "bg-slate-50/50 text-slate-400 cursor-not-allowed border-dashed" : ""}`}
        {...props}
      />
    </div>
  </div>
);

//Custom Multi-Select Component for Skills
const MultiSelectSkills = ({ label, selectedSkills, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  // Define standard tech skills here
  const availableSkills = [
    "Android Development",
    "Angular",
    "Artificial Intelligence",
    "AWS",
    "Azure",
    "Blockchain",
    "C",
    "C#",
    "C++",
    "CI/CD",
    "Cyber Security",
    "Data Analytics",
    "Data Science",
    "Deep Learning",
    "Django",
    "Docker",
    "Express.js",
    "Figma",
    "Firebase",
    "Flutter",
    "Frontend Development",
    "Full Stack Development",
    "GCP",
    "Git",
    "GitHub/GitLab",
    "Go",
    "HTML/CSS",
    "iOS Development",
    "Java",
    "JavaScript",
    "Kotlin",
    "Kubernetes",
    "Linux",
    "Machine Learning",
    "MEAN Stack",
    "MERN Stack",
    "MongoDB",
    "MySQL",
    "Next.js",
    "Node.js",
    "Pandas",
    "PHP",
    "PostgreSQL",
    "Power BI",
    "Python",
    "PyTorch",
    "React Native",
    "React.js",
    "Redis",
    "Ruby",
    "Rust",
    "Spring Boot",
    "SQL",
    "Swift",
    "Tableau",
    "Tailwind CSS",
    "TensorFlow",
    "TypeScript",
    "UI/UX Design",
    "Vue.js",
    "Web3",
  ];

  const handleSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      onChange([...selectedSkills, skill]);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = (skillToRemove) => {
    onChange(selectedSkills.filter((skill) => skill !== skillToRemove));
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm(""); // Search clear when closing
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSkills = availableSkills.filter(
    (skill) =>
      !selectedSkills.includes(skill) &&
      skill.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-2 group relative" ref={containerRef}>
      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`min-h-[56px] w-full p-2 px-3 bg-white/70 backdrop-blur-sm border-2 ${isOpen ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-100"} rounded-2xl flex flex-wrap gap-2 items-center cursor-pointer transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSkills.length === 0 && (
          <span className="text-slate-400 text-sm font-semibold ml-2">
            Select your skills...
          </span>
        )}

        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-200 transition-colors"
          >
            {skill}
            <XCircle
              size={14}
              className="cursor-pointer text-indigo-500 hover:text-indigo-900"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(skill);
              }}
            />
          </span>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[300px] flex flex-col bg-white border-2 border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
          >
            {/* Search Input field inside dropdown */}
            <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Typing karte samay close hone se bachaye
                  className="w-full py-2.5 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-2 overflow-y-auto custom-scrollbar flex-1 max-h-56">
              {filteredSkills.map((skill) => (
                <div
                  key={skill}
                  className="px-4 py-2.5 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer text-sm font-semibold text-slate-600 transition-colors"
                  onClick={() => handleSelect(skill)}
                >
                  {skill}
                </div>
              ))}
              {filteredSkills.length === 0 && (
                <div className="px-4 py-6 text-sm font-medium text-slate-400 text-center">
                  {searchTerm
                    ? "No skills found."
                    : "All standard skills selected!"}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

//RE-UPLOAD FEATURE: Photo (Added Size Limits text to UI)
const ProfileUploadGroup = ({
  label,
  name,
  onChange,
  preview,
  onClear,
  required,
}) => (
  <div className="border-2 border-dashed border-slate-300 bg-white/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative group h-[220px]">
    {preview ? (
      <>
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-2 relative group-hover:opacity-80 transition-opacity">
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full p-1 transition-colors z-20"
        >
          <XCircle size={20} />
        </button>
        <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
          <CheckCircle2 size={14} /> Photo Ready
        </p>
      </>
    ) : (
      <>
        <div className="p-4 bg-slate-100 rounded-full group-hover:bg-indigo-100 transition-colors mb-4">
          <User
            size={32}
            className="text-slate-400 group-hover:text-indigo-600"
          />
        </div>
        <p className="text-sm font-extrabold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Upload Passport Photo (10KB - 2MB)
        </p>
      </>
    )}
    {!preview && (
      <input
        type="file"
        id={`fileUpload-${name}`}
        name={name}
        onChange={onChange}
        accept="image/*"
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
    )}
  </div>
);

//RE-UPLOAD FEATURE: Resume
const ResumeUploadGroup = ({
  label,
  name,
  onChange,
  file,
  existingFile,
  onClear,
  required,
}) => {
  const isReady = file || existingFile;
  const fileName = file
    ? file.name
    : existingFile
      ? "Previous Resume Uploaded"
      : "Upload PDF format only (Max 5MB)";

  return (
    <div
      className={`border-2 border-dashed border-slate-300 bg-white/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative group h-[220px] ${isReady ? "border-emerald-200 bg-emerald-50/30" : ""}`}
    >
      {isReady && (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full p-1 z-20"
        >
          <XCircle size={20} />
        </button>
      )}
      <div
        className={`p-4 rounded-full mb-4 ${isReady ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-indigo-100"}`}
      >
        {isReady ? (
          <CheckCircle2 size={32} className="text-emerald-600" />
        ) : (
          <FileText size={32} className="text-slate-400" />
        )}
      </div>
      <p className="text-sm font-extrabold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <p
        className={`text-xs mt-1 font-medium px-4 truncate w-full ${isReady ? "text-emerald-600 font-bold" : "text-slate-500"}`}
      >
        {fileName}
      </p>

      {!isReady && (
        <input
          type="file"
          id={`fileUpload-${name}`}
          name={name}
          onChange={onChange}
          accept=".pdf"
          required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      )}
    </div>
  );
};

// PROFILE DASHBOARD INFO CARD
const InfoCard = ({ icon, label, value, highlight }) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-2xl border ${highlight ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}
  >
    <div
      className={`p-3 rounded-xl ${highlight ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 shadow-sm"}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`font-bold text-sm ${highlight ? "text-emerald-700" : "text-slate-700"}`}
      >
        {value}
      </p>
    </div>
  </div>
);
