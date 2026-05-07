import React, { useState } from "react";
import axios from "axios";
import { Upload, Loader2, CheckCircle, RefreshCw } from "lucide-react";

const CGPAUpload = ({ onUpdate }) => {
  const [semesterData, setSemesterData] = useState({
    sgpa: 0,
    credits: 0,
    isLocked: false,
    isScanning: false,
  });

  const API_URL = "https://davv-backend-api.onrender.com/api/users/ocr-extract";

  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setSemesterData((prev) => ({ ...prev, isScanning: true }));

  const formData = new FormData();
  formData.append("marksheet", file);

  try {
    const res = await axios.post(API_URL, formData, {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    
    if (res.data && res.data.data) {
      const { sgpa, credits } = res.data.data;

      
      if (sgpa > 0) {
        setSemesterData({
          sgpa: sgpa || 0,
          credits: credits || 0,
          isLocked: true,
          isScanning: false,
        });

        if (onUpdate) {
          onUpdate({ data: { sgpa, credits } });
        }
      } else {
        setSemesterData((prev) => ({ ...prev, isScanning: false }));
        alert(" Your marksheet is blurry or unreadable. Please try uploading a clean marksheet, or contact the Admin for manual verification.");
      }

    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.log("Upload Error:", error);
    setSemesterData((prev) => ({ ...prev, isScanning: false }));
    alert("Scan failed. Check console for details.");
  }
};


  const resetSemester = () => {
    setSemesterData({
      sgpa: 0,
      credits: 0,
      isLocked: false,
      isScanning: false,
    });
  };

  return (
    <div className="p-6 border-2 rounded-2xl border-dashed">
      {!semesterData.isLocked ? (
        <label className="flex flex-col items-center cursor-pointer">
          {semesterData.isScanning ? (
            <Loader2 className="animate-spin mb-2" />
          ) : (
            <Upload className="mb-2" />
          )}
          <span>Upload Marksheet</span>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center text-green-600 font-bold">
            <CheckCircle size={18} />
            <span>SGPA:</span>
            <input
              type="number"
              step="0.01"
              value={semesterData.sgpa}
              className="w-20 border rounded px-2 py-1"
              onChange={(e) => {
                const newVal = parseFloat(e.target.value);
                setSemesterData({ ...semesterData, sgpa: newVal });
                if (onUpdate)
                  onUpdate({ sgpa: newVal, credits: semesterData.credits });
              }}
            />
          </div>

          <button
            onClick={resetSemester}
            className="text-gray-500 hover:text-red-500"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CGPAUpload;
