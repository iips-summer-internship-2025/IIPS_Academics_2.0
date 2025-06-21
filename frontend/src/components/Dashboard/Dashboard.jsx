import React, { useState, useEffect, useRef } from "react";
import demo from "../../assets/demo.png";
import { Line } from "rc-progress";
import { supabase } from "../../supabaseClient";
import { UserAuth } from "../../Context/AuthContext";
import { StarIcon, DownloadIcon, ChevronUpIcon, PlusIcon, UserIcon } from "../../Icons";
import imageCompression from "browser-image-compression";
import Contributions from "./Contributions/Contributions";
import Rewards from "./Rewards/Rewards";
import Downloads from "./Downloads/Downloads";
import ProfileCompletionModal from "./ProfileCompletion/ProfileCompletionModal";

const Dashboard = () => {
  const [active, setActive] = useState("Contributions");
  const { session } = UserAuth();
  const [profileData, setProfileData] = useState(null);
  const [canUpload, SetCanUpload] = useState(false);

  const [stats, setStats] = useState({
    uploads: 0,
    downloads: 0,
    avgRating: 0,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  const fetchDashboardData = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    const userId = session.user.id;
    setLoading(true);
    setError(null);
    setAvatarError(null);

    try {
      const { data: profile, error: profileError } = await supabase.from("profiles").select("*, course:course_id(name, duration_years), total_uploads, avatar_url, verified").eq("id", userId).single();

      if (profileError) throw profileError;
      setProfileData(profile);

      let completedFields = 0;
      const totalFields = 5;
      if (profile.first_name) completedFields++;
      if (profile.last_name) completedFields++;
      if (profile.enrollment_number) completedFields++;
      if (profile.course_id) completedFields++;
      if (profile.semester) completedFields++;
      const currentProfileCompletion = Math.round((completedFields / totalFields) * 100);
      setProfileCompletion(currentProfileCompletion);

      if (currentProfileCompletion === 100 && profile.verified === true) {
        SetCanUpload(true);
      } else {
        SetCanUpload(false);
      }

      const uploadCount = profile.total_uploads || 0;

      let downloadCount = 0;
      const { count: dlCount, error: dlError } = await supabase.from("user_download_log").select("*", { count: "exact", head: true }).eq("profile_id", userId);

      if (dlError) {
        console.warn("Error fetching download count:", dlError.message);
      } else {
        downloadCount = dlCount || 0;
      }

      const { data: avgRatingData, error: avgRatingError } = await supabase.from("resources").select("rating_average").eq("uploader_profile_id", userId).eq("status", "APPROVED").gt("rating_count", 0);

      if (avgRatingError) throw avgRatingError;

      let avgRating = 0;
      if (avgRatingData && avgRatingData.length > 0) {
        const sum = avgRatingData.reduce((acc, r) => acc + (r.rating_average || 0), 0);
        avgRating = (sum / avgRatingData.length).toFixed(1);
      }

      setStats({
        uploads: uploadCount,
        downloads: downloadCount,
        avgRating: parseFloat(avgRating) || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session?.user?.id]);

  // This run every sec to check whether admin has verified ID card to allow uploading.
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(async () => {
      const { data: profile, error } = await supabase.from("profiles").select("verified").eq("id", session.user.id).single();

      if (error) {
        console.error("Error checking verification:", error);
        return;
      }

      if (profile?.verified === true) {
        SetCanUpload(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleAvatarChange = async event => {
    const file = event.target.files[0];
    if (!file || !session?.user?.id) {
      setAvatarError("No file selected or user not available.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setAvatarError(null);

    const acceptedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!acceptedImageTypes.includes(file.type)) {
      setAvatarError("Invalid file type. Please select a JPG, PNG, or GIF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    setUploadingAvatar(true);
    try {
      const compressedFile = await imageCompression(file, options);

      if (compressedFile.size > 1 * 1024 * 1024) {
        setAvatarError("Compressed file is still too large (max 1MB).");
        setUploadingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const fileExt = compressedFile.name.split(".").pop() || "png";
      const filePath = `${session.user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, compressedFile, {
        upsert: true,
        cacheControl: "3600",
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Could not get public URL for avatar.");
      }
      const newAvatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      setProfileData(prevProfileData => ({
        ...prevProfileData,
        avatar_url: newAvatarUrl,
      }));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarError(`Upload failed: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const menuItems = [
    { label: "Contributions", icon: <ChevronUpIcon /> },
    { label: "Rewards", icon: <StarIcon size={16} /> },
    { label: "Downloads", icon: <DownloadIcon size={16} /> },
  ];

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Header */}
      <div className="w-full bg-[#F4F9FF] p-5">
        <p className="text-center  text-[40px] font-bold">Profile</p>
        <p className="text-center text-[#3B3838] ">Manage your profile and see your contributions</p>
      </div>

      {/* Main Content */}
      <div className="flex w-full max-w-7xl justify-center gap-4 lg:gap-8 mt-8 flex-col lg:flex-row">
        {/* Profile Overview Sidebar */}
        <div
          className="border-2 w-full lg:w-72 xl:w-80 flex flex-col items-center py-6 px-6 rounded-xl h-fit lg:h-[650px] bg-white 
        shadow-[5px_7px_8px_rgba(0,0,0,0.25)]">
          {/* Hidden file input */}
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/png, image/jpeg, image/gif" style={{ display: "none" }} />

          {/* User Avatar Section */}
          <div className="relative group mb-4">
            <img
              src={profileData?.avatar_url || demo}
              alt="user image"
              loading="lazy"
              className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover border-2 ${uploadingAvatar ? "opacity-50" : "opacity-100"} transition-opacity`}
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                <div className="w-8 h-8 border-4 border-t-[#C79745] border-r-[#C79745] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {!uploadingAvatar && session?.user?.id === profileData?.id && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-[#C79745] text-white p-1.5 rounded-full shadow-md hover:bg-[#b3863c] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Change profile picture">
                <PlusIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Avatar Error */}
          {avatarError && <p className="text-xs text-red-500 mb-2 text-center max-w-full break-words">{avatarError}</p>}

          {/* User Info */}
          <div className="text-center mb-6 w-full">
            <p className="font-bold text-lg lg:text-xl mb-2 break-words">
              {loading ? "Loading..." : error ? "Error" : profileData ? `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || "User Name" : "User Name"}
            </p>
            <p className="text-[#3B3838] text-sm lg:text-base break-words">
              {loading ? (
                "..."
              ) : error ? (
                "N/A"
              ) : profileData && profileData.course && profileData.semester ? (
                <>
                  {profileData.course.name} {profileData.semester}
                  <sup>th</sup> Semester
                </>
              ) : (
                "Course Info N/A"
        
              )}
              {!uploadingAvatar && session?.user?.id === profileData?.id && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-[#C79745] text-white p-1.5 rounded-full shadow-md hover:bg-[#b3863c] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Change profile picture"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {avatarError && (
              <p className="text-xs text-red-500 mb-2 text-center max-w-full break-words">
                {avatarError}
              </p>
            )}

            {/* User info */}
            <div className="text-center mb-6 w-full">
              <p className="font-bold text-lg lg:text-xl mb-2 break-words">
                {loading
                  ? "Loading..."
                  : error
                    ? "Error"
                    : profileData
                      ? `${profileData.first_name || ""} ${profileData.last_name || ""
                        }`.trim() || "User Name"
                      : "User Name"}
              </p>
              <p className="text-[#3B3838] text-sm lg:text-base break-words">
                {loading ? (
                  "..."
                ) : error ? (
                  "N/A"
                ) : profileData && profileData.course && profileData.semester ? (
                  <>
                    {profileData.course.name} {profileData.semester}
                    <sup>th</sup> Semester
                  </>
                ) : (
                  "Course Info N/A"
                )}
              </p>
            </div>

          {/* Profile Completion */}
          <div className="w-full mb-4">
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-between gap-4 border rounded-lg px-4 py-3 text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors w-full"
              title="View or update profile details">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">Profile Completion</span>
              </div>
              <span className="text-[#C79745] font-semibold flex-shrink-0">{loading ? "..." : error ? "N/A" : `${profileCompletion}%`}</span>

            </div>

          {/* Progress Bar */}
          <div className="w-full mb-6">
            <Line percent={loading || error ? 0 : profileCompletion} strokeWidth={4} strokeColor="#c79745" className="w-full border-2 rounded-2xl" />
          </div>

          {/* Stats Section */}
          <div className="w-full mb-6 flex-1 flex flex-col justify-center">
            <hr className="border-1 mb-4" />
            {loading ? (
              <p className="text-center text-sm">Loading stats...</p>
            ) : error ? (
              <p className="text-center text-red-500 text-sm">Error loading stats.</p>
            ) : (
              <div className="flex justify-around text-center">
                <div className="flex flex-col items-center">
                  <p className="text-xl lg:text-2xl font-bold">{stats.uploads}</p>
                  <p className="text-[#C79745] text-xs lg:text-sm">Uploads</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xl lg:text-2xl font-bold">{stats.downloads}</p>
                  <p className="text-[#C79745] text-xs lg:text-sm">Downloads</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xl lg:text-2xl font-bold">{stats.avgRating}</p>
                  <p className="text-[#C79745] text-xs lg:text-sm">Ratings</p>
          
                </div>
              )}
              <hr className="border-1 mt-4" />
            </div>

          {/* Navigation Buttons */}
          <div className="w-full flex flex-col gap-3">
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={() => setActive(item.label)}
                className={`flex items-center gap-4 border-2 rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors w-full ${
                  active === item.label ? "bg-gray-100 shadow-[5px_7px_4px_rgba(0,0,0,0.25)]" : "bg-white hover:bg-gray-50"
                }`}>
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

          </div>

        {/* Main Content Area */}
        <div className="flex mb-10 flex-col border-2 rounded-xl w-full lg:flex-1 h-[650px] bg-white  shadow-[5px_7px_8px_rgba(0,0,0,0.25)]">
          <div className="p-6 h-full overflow-y-auto">
            {active === "Contributions" ? <Contributions canUpload={canUpload} /> : active === "Rewards" ? <Rewards /> : active === "Downloads" ? <Downloads /> : null}
        
          </div>
        </div>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={profileData ?? undefined} onProfileUpdate={fetchDashboardData} />

    </div>
  );
};

export default Dashboard;

