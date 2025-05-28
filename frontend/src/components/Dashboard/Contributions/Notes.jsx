import React, { useEffect, useState, useCallback } from "react";
import { BookIcon, CalendarIcon, StarIcon, PlusIcon } from "../../../Icons"; 
import { FaAngleRight } from "react-icons/fa6";
import noData from "../../../assets/noData.svg";
import { UserAuth } from "../../../Context/AuthContext";
import { supabase } from "../../../supabaseClient";
import ResourceUploadModal from "./ResourceUploadModal"; 

function Card({ children }) {
  return (
    <div className="bg-white shadow-sm border-b-2  cursor-pointer">
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return (
    <div className="p-4 flex items-center justify-between  ">{children}</div>
  );
}
const contributions = [
  {
    title: "Data Structures and Algorithms",
    semester: "MCA III Semester",
    date: "May 10, 2025",
    rating: 4.5,
    reward: "+2 Gold",
  },
  {
    title: "Calculus II: Integration Techniques",
    semester: "MCA II Semester",
    date: "April 15, 2025",
    rating: 4.1,
    reward: "+2 Gold",
  },
  {
    title: "Calculus II: Integration Techniques",
    semester: "MCA II Semester",
    date: "April 15, 2025",
    rating: 4.1,
    reward: "+2 Gold",
  },
  {
    title: "Calculus II: Integration Techniques",
    semester: "MCA II Semester",
    date: "April 15, 2025",
    rating: 4.1,
    reward: "+2 Gold",
  },
];

export default function Notes() {

  const { session } = UserAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0); 

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleUploadSuccess = useCallback(() => {
    setFetchTrigger((prev) => prev + 1); 
    setTimeout(() => {
      handleCloseModal();
    }, 1500);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchUserNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("resources")
          .select(
            `
            id, title, uploaded_at, rating_average, status, 
            subject:subject_id (
              semester_number,
              course:course_id (name)
            )
          `
          )
          .eq("uploader_profile_id", session.user.id)
          .eq("resource_type", "NOTE")
         
          .order("uploaded_at", { ascending: false });

        if (fetchError) throw fetchError;

        setNotes(
          data.map((note) => ({
            id: note.id, 
            title: note.title,
            semester: `${note.subject?.course?.name || ""} Semester ${
              note.subject?.semester_number || ""
            }`,
            date: note.uploaded_at
              ? new Date(note.uploaded_at).toLocaleDateString()
              : "N/A",
            rating: note.rating_average || 0,
           
            status: note.status,
          }))
        );
      } catch (err) {
        console.error("Error fetching user notes:", err);
        setError(err.message || "Failed to fetch notes.");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNotes();
  }, [session, fetchTrigger]); 

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your notes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-3">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#C79745] text-white rounded-md cursor-pointer hover:bg-[#b3863c] text-sm font-medium shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b3863c]"
        >
          <PlusIcon className="w-4 h-4" />
          Upload New Note
        </button>
      </div>
      <div className="flex flex-col gap-2 h-[calc(350px-50px)] overflow-y-auto pr-2 custom-scrollbar">
        {notes.length > 0 ? (
          notes.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full justify-between">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-gray-200 rounded-full shrink-0">
                      <BookIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base break-words">
                          {item.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#3B3838]">{item.semester}</p>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm text-[#3B3838]">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">
                            {item.date}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 sm:ml-4">
                          <span>
                            <StarIcon className="w-4 h-4 text-[#C79745]" />
                          </span>
                          <span className="text-xs sm:text-sm">
                            {item.rating}/5.0
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6  sm:mt-0 self-start sm:self-center ml-auto sm:ml-12">
                    {/* Reward display removed */}
                    <FaAngleRight className="bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] rounded-full w-5 h-5 sm:w-6 sm:h-6 " />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="w-full justify-center flex flex-col items-center text-center ">
            <img
              src={noData}
              className="w-[200px] md:w-[250px]"
              alt="No notes uploaded"
            />
            <p className="mt-4 text-lg text-gray-700">
              You haven't uploaded any notes yet.
            </p>
            <p className="text-sm text-gray-500">
              Click "Upload New Note" to share your first one!
            </p>
          </div>
        )}
      </div>
      <ResourceUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUploadSuccess={handleUploadSuccess}
        defaultResourceType="NOTE"
      />
    </div>
  );
}
