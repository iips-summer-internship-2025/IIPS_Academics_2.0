import StatusSummary from "./StatusSummary";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { MdAdminPanelSettings, MdVisibility, MdCheck, MdClose, MdPerson, MdOutlineBadge, MdOutlineSubject } from "react-icons/md";

const VerificationDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const [profiles, setProfiles] = useState([]);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [filterType, setFilterType] = useState("pending");
  //   pagination
  const [page, setPage] = useState(1);
  const profilesPerPage = 5;
  const [loadingMore, setLoadingMore] = useState(false);

  // fetch profile
  const fetchProfiles = async (reset = false) => {
    setLoadingMore(true);
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (filterType === "pending") query = query.is("verified", null);
    else if (filterType === "approved") query = query.eq("verified", true);
    else if (filterType === "rejected") query = query.eq("verified", false);

    query = query.range((page - 1) * profilesPerPage, page * profilesPerPage - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      setProfiles(prev => (reset ? data : [...prev, ...data]));
    }
    setLoadingMore(false);
  };

  //   for approve & reject
  const handleVerify = async (id, status) => {
    const { error } = await supabase.from("profiles").update({ verified: status }).eq("id", id);

    if (error) {
      console.error("Failed to update verification:", error);
    } else {
      setPage(1);
      fetchProfiles(true);
      updateCounts();
    }
  };

  //   for status card
  const updateCounts = async () => {
    try {
      const [total, approved, rejected, pending] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verified", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verified", false),
        supabase.from("profiles").select("*", { count: "exact", head: true }).is("verified", null),
      ]);

      setCounts({
        total: total.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0,
        pending: pending.count || 0,
      });
    } catch (err) {
      console.error("Error updating resource counts:", err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProfiles(true);
    updateCounts();
  }, [filterType]);

  //   styling badge
  const getStatusBadge = status => {
    switch (status) {
      case null:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white">Pending</span>;
      case true:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">Approved</span>;
      case false:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500 text-white">{status}</span>;
    }
  };

  //   preview, approve and reject
  const getActionButtons = (profile, setPreviewProfile, handleVerify) => {
    const baseButtonClass =
      "inline-flex items-center justify-center px-3 py-1 border-2 border-[#2B3333] rounded-md shadow-sm font-semibold text-sm transition-colors hover:shadow-[6px_7px_4px_rgba(0,0,0,0.1)]";
    const iconButtonClass = "w-4 h-4";

    return (
      <div className="flex gap-1 sm:gap-2 flex-wrap">
        <button onClick={() => setPreviewProfile(profile)} className={`${baseButtonClass} bg-white text-[#2B3333]`} aria-label="Preview">
          <MdVisibility className={iconButtonClass} />
          <span className="sr-only sm:not-sr-only sm:ml-1">Preview</span>
        </button>
        <button onClick={() => handleVerify(profile.id, true)} className={`${baseButtonClass} bg-green-500 text-white border-green-600 hover:bg-green-600`} aria-label="Approve">
          <MdCheck className={iconButtonClass} />
          <span className="sr-only sm:not-sr-only sm:ml-1">Approve</span>
        </button>
        <button onClick={() => handleVerify(profile.id, false)} className={`${baseButtonClass} bg-red-500 text-white border-red-600 hover:bg-red-600`} aria-label="Reject">
          <MdClose className={iconButtonClass} />
          <span className="sr-only sm:not-sr-only sm:ml-1">Reject</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFEFE] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8 relative">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-800 relative z-10">
            Admin Panel for<span className="text-red-500 ml-1">ID Verification</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg max-w-2xl">Review and approve student IDs to allow them to upload content.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">Admin Verification Dashboard</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">ID Review</span>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-md transition-all duration-200">
            <MdAdminPanelSettings className="text-xl" />
            Back to Admin
          </button>
        </div>

        <StatusSummary counts={counts} />

        <div className="bg-white rounded-md border-2 border-gray-300 shadow-[7px_8px_4.8px_rgba(0,0,0,0.1)] mt-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 0a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2m10 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">ID Verification</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Filter Resources</h3>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {["pending", "approved", "rejected"].map(status => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-full border-1 font-semibold transition-all ${
                    filterType === status ? "bg-[#2B3333] text-white border-[#2B3333]" : "bg-white text-gray-700 border-gray-300 hover:border-[#C79745] "
                  }`}
                  onClick={() => {
                    setFilterType(status);
                    setProfiles([]);
                  }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {profiles.length === 0 ? (
              <p className="text-gray-500 text-sm">No profiles found for "{filterType}".</p>
            ) : (
              profiles.map(profile => (
                <div key={profile.id} className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1 truncate">
                        <MdPerson className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate font-semibold text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 truncate">
                        <MdOutlineBadge className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">Enrollment: {profile.enrollment_number || "N/A"}</span>
                      </span>

                      <span className="flex items-center gap-1 truncate">
                        <MdOutlineSubject className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">Course: {profile.course || "N/A"}</span>
                      </span>

                      <span className="flex items-center gap-1 truncate">{getStatusBadge(profile.verified)}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">{filterType === "pending" && getActionButtons(profile, setPreviewProfile, handleVerify)}</div>
                  </div>

                  {previewProfile?.id === profile.id && (
                    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex justify-center items-center z-50">
                      <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 relative">
                        <button onClick={() => setPreviewProfile(null)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded font-bold">
                          ✕
                        </button>
                        {!previewProfile.idcard_url ? <p>Loading preview...</p> : <iframe src={previewProfile.idcard_url} className="w-full h-full" title="ID Preview" frameBorder="0" />}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {profiles.length > 0 && (
              <div className="text-center mt-6">
                <button
                  disabled={loadingMore}
                  onClick={() => {
                    setPage(prev => prev + 1);
                    fetchProfiles();
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50">
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDashboard;
