import React, { useEffect, useState } from "react";
import { DownloadIcon, EyeIcon, XIcon } from "../../../Icons";
import { supabase } from "../../../supabaseClient";
import { saveAs } from "file-saver";

function ResourceItem({ id, title, file, uploaded_at, file_size_bytes }) {
  const [fileUrl, setFileUrl] = useState("");
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    const generateSignedUrl = async () => {
      const { data, error } = await supabase.storage.from("uploads").createSignedUrl(file, 60 * 60, { download: false });
      if (data?.signedUrl) setFileUrl(data.signedUrl);
      else console.error("Signed URL error:", error);
    };
    generateSignedUrl();
  }, [file]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchRatings = async () => {
      const { data: existing } = await supabase.from("ratings").select("rating_value").eq("profile_id", user.id).eq("resource_id", id).single();

      if (existing) {
        setUserRating(existing.rating_value);
        setHasRated(true);
      }

      const { data: resource } = await supabase.from("resources").select("rating_average").eq("id", id).single();

      if (resource) setAvgRating(resource.rating_average || 0);
    };

    fetchRatings();
  }, [user, id]);

  const handleRating = async rating => {
    if (!user || hasRated) return;

    await supabase.from("ratings").upsert({
      profile_id: user.id,
      resource_id: id,
      rating_value: rating,
    });

    const { data: allRatings } = await supabase.from("ratings").select("rating_value").eq("resource_id", id);

    const avg = allRatings.reduce((sum, r) => sum + r.rating_value, 0) / allRatings.length;

    await supabase
      .from("resources")
      .update({
        rating_average: avg,
        rating_count: allRatings.length,
      })
      .eq("id", id);

    setUserRating(rating);
    setAvgRating(avg);
    setHasRated(true);
  };

  const downloadFile = async () => {
    const { data, error } = await supabase.storage.from("uploads").download(file);
    if (error) return console.error("Download error:", error);

    saveAs(data, `iips_academics_${title}.pdf`);

    const { data: log } = await supabase.from("user_download_log").select("id").eq("resource_id", id).eq("profile_id", user.id).maybeSingle();

    if (!log) {
      await supabase.from("user_download_log").insert({
        resource_id: id,
        profile_id: user.id,
        downloaded_at: new Date(),
      });
    }
  };

  return (
    <>
      <li className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-[5px_7px_4px_rgba(0,0,0,0.25)]  flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="font-semibold text-lg text-gray-800 break-words">{title}</h4>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center px-3 py-1.5 text-sm border-2 border-[#2B3333] rounded-xl font-semibold hover:border-[#C79745] hover:shadow-[6px_7px_4px_rgba(0,0,0,0.1)] transition">
              <EyeIcon className="w-4 h-4 mr-1" /> Preview
            </button>
            <button
              onClick={downloadFile}
              className="flex items-center px-3 py-1.5 text-sm bg-yellow-400 border-2 border-[#2B3333] hover:bg-yellow-500 rounded-xl font-semibold hover:shadow-[6px_7px_4px_rgba(0,0,0,0.1)] transition">
              <DownloadIcon className="w-4 h-4 mr-1" /> Download
            </button>
          </div>
        </div>

        {/* Ratings */}
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              disabled={hasRated}
              className={`text-lg ${hover ? (star <= hover ? "text-yellow-400" : "text-gray-300") : star <= userRating ? "text-yellow-400" : "text-gray-300"} ${hasRated ? "cursor-not-allowed" : ""}`}>
              ★
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
          <span>📅 {uploaded_at ? new Date(uploaded_at).toLocaleDateString() : "N/A"}</span>
          <span>📄 {(file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>
          <span>⭐ {avgRating.toFixed(2)}</span>
        </div>
      </li>
      {/* Preview Modal */}
      {showPreview && (
        <div onClick={() => setShowPreview(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-5xl rounded-lg shadow-lg bg-white">
            <button onClick={() => setShowPreview(false)} className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
              <XIcon className="w-6 h-6 text-gray-600" />
            </button>
            <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title="PDF Preview" className="w-full h-[80vh] rounded-b-lg" />
          </div>
        </div>
      )}
    </>
  );
}

export default ResourceItem;
