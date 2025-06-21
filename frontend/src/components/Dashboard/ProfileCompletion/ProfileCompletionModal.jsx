import { useState, useEffect } from "react";
import { FaUser, FaGraduationCap, FaCalendarAlt, FaHashtag, FaRegAddressCard } from "react-icons/fa";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { RxCross1 } from "react-icons/rx";
import { UserAuth } from "../../../Context/AuthContext";

const ProfileCompletionModal = ({ isOpen, onClose, initialData, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { session } = UserAuth();
  const [coursesList, setCoursesList] = useState([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    course_id: "",
    semester: "",
    enrollment_number: "",
  });
  // for ID card
  const [file, setFile] = useState(null);
  // Fetch courses from Supabase
  useEffect(() => {
    if (isOpen) {
      const fetchCourses = async () => {
        try {
          const { data, error } = await supabase.from("courses").select("id, name");
          if (error) throw error;
          setCoursesList(data || []);
        } catch (error) {
          console.error("Error fetching courses:", error);
          toast.error("Could not load courses.");
        }
      };
      fetchCourses();
    }
  }, [isOpen]);

  // Static semesters list
  const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        course_id: initialData.course_id || "",
        semester: initialData.semester ? parseInt(initialData.semester, 10) : "",
        enrollment_number: initialData.enrollment_number || "",
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        course_id: "",
        semester: "",
        enrollment_number: "",
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (field, value) => {
    if (field === "semester") {
      setFormData(prev => ({ ...prev, [field]: value ? parseInt(value, 10) : "" }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const dataToUpdate = {
      ...formData,
      semester: formData.semester ? parseInt(formData.semester, 10) : null,
      updated_at: new Date().toISOString(),
    };

    if (dataToUpdate.course) delete dataToUpdate.course;

    try {
      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${session?.user?.id}/idcard.${fileExt}`;

        // Upload to idcard in storage
        const { error: uploadError } = await supabase.storage.from("idcards").upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          toast.error("File upload failed.");
          return;
        }

        // Get url to store in profiles table
        const { data: fileData } = supabase.storage.from("idcards").getPublicUrl(filePath);
        dataToUpdate.idcard_url = fileData.publicUrl;
        // Update in profile
        const { error } = await supabase.from("profiles").update(dataToUpdate).eq("id", session?.user?.id);
        if (error) throw error;

        toast.success("Profile Updated Successfully!");
        onProfileUpdate?.();
        onClose();
      } else {
        console.error("file not found!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      const MAX_SIZE_BYTES = 5 * 1024 * 1024;

      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type!");
        e.target.value = null;
        return;
      }

      if (selectedFile.size > MAX_SIZE_BYTES) {
        toast.error(`File is too large. Maximum size is ${MAX_SIZE_BYTES / 1024 / 1024}MB.`);
        e.target.value = null;
        return;
      }

      setFile(selectedFile);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        @keyframes modalOpen {
          from {
            opacity: 0;
            transform: scale(0.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes rippleEffect {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes magneticPull {
          0% {
            transform: scale(1) rotateX(0deg);
          }
          50% {
            transform: scale(1.03) rotateX(5deg);
          }
          100% {
            transform: scale(1.05) rotateX(0deg);
          }
        }

        .animated-button {
          position: relative;
          background: linear-gradient(135deg, #2b3333 0%, #1a2020 50%, #2b3333 100%);
          color: #fefefe;
          border: none;
          overflow: hidden;
          font-weight: 600;
          perspective: 1000px;
          box-shadow: 0 4px 15px rgba(43, 51, 51, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .animated-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #3a4444 0%, #2b3333 50%, #1a2020 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .animated-button::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(254, 254, 254, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        .animated-button:hover::before {
          opacity: 1;
        }

        .animated-button:hover {
          animation: magneticPull 0.6s ease-out forwards;
          box-shadow: 0 20px 40px rgba(43, 51, 51, 0.5), 0 0 20px rgba(26, 32, 32, 0.4);
          transform: translateY(-2px);
        }

        .animated-button:active::after {
          animation: rippleEffect 0.6s ease-out;
        }

        .animated-button .shimmer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(254, 254, 254, 0.3), transparent);
          transform: translateX(-100%);
          z-index: 3;
        }

        .animated-button:hover .shimmer-overlay {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .animated-button:active {
          transform: scale(0.98);
        }

        .animated-button > * {
          position: relative;
          z-index: 2;
        }

        .animated-button:disabled {
          transform: none !important;
          box-shadow: none !important;
          opacity: 0.5;
        }

        .animated-button:disabled::before {
          left: -100% !important;
        }

        .animated-button:disabled:hover {
          color: #2b3333;
        }
      `}</style>

      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
        <div
          className="relative max-w-xl w-full mx-4 max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-out"
          style={{
            animation: "modalOpen 0.2s ease-out forwards",
            transformOrigin: "center center",
          }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10">
            <RxCross1 size={20} />
          </button>

          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">This enables you to upload resources :)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaUser className="text-gray-500" size={14} />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={e => handleInputChange("first_name", e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaUser className="text-gray-500" size={14} />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={e => handleInputChange("last_name", e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaGraduationCap className="text-gray-500" size={14} />
                  Course
                </label>
                <select
                  value={formData.course_id}
                  onChange={e => handleInputChange("course_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-transparent"
                  required>
                  <option value="">Select your course</option>
                  {coursesList.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="text-gray-500" size={14} />
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={e => handleInputChange("semester", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-transparent"
                    required>
                    <option value="">Select semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>
                        {sem}
                        {sem === 1 ? "st" : sem === 2 ? "nd" : sem === 3 ? "rd" : "th"} Semester
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaHashtag className="text-gray-500" size={14} />
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={formData.enrollment_number}
                    onChange={e => handleInputChange("enrollment_number", e.target.value)}
                    placeholder="Enter enrollment number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-transparent"
                    required
                  />
                </div>

                <div className="">
                  <label htmlFor="file-upload-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FaRegAddressCard className="text-gray-500" size={14} />
                    Upload ID Card
                  </label>

                  <p className="text-xs text-gray-500 mb-2 ml-6">
                    <span className="text-red-500">*</span> Maximum file size: 5MB.
                    <br />
                    Preferable types: <strong>JPEG, JPG, PNG</strong>
                  </p>

                  <input
                    id="file-upload-input"
                    type="file"
                    required
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
                  />
                  {file && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-2.5 px-4 rounded-md mt-6 animated-button">
                <div className="shimmer-overlay"></div>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </div>
                ) : (
                  <span className="relative z-10">Save Profile</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCompletionModal;
