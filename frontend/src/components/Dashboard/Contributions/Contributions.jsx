import React, { useState } from "react";
import PYQs from "./PYQs";
import Syllabus from "./Syllabus";
import Notes from "./Notes";
import ResourceUploadModal from "./ResourceUploadModal";
import { PlusIcon } from "../../../Icons";
import toast from "react-hot-toast";

const Contributions = ({ canUpload }) => {
  const [activeTab, setActiveTab] = useState("Notes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const tabs = ["Notes", "PYQs", "Syllabus"];

  const handleUploadClick = () => {
    if (!canUpload) {
      toast.error("Complete your profile to upload resources");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleUploadSuccess = () => {
    setFetchTrigger(prev => prev + 1);
    setTimeout(() => {
      handleCloseModal();
    }, 1500);
  };

  const resourceTypeMap = {
    Notes: "NOTE",
    PYQs: "PYQ",
    Syllabus: "SYLLABUS",
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Notes":
        return <Notes canUpload={canUpload} fetchTrigger={fetchTrigger} />;
      case "PYQs":
        return <PYQs canUpload={canUpload} fetchTrigger={fetchTrigger} />;
      case "Syllabus":
        return <Syllabus canUpload={canUpload} fetchTrigger={fetchTrigger} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#FFFEFE] pb-2">
        <div className="flex justify-between items-start mb-2 sm:flex-row flex-col">
          <div>
            <p className="text-3xl font-bold">Your Contributions</p>
            <p className="text-base text-gray-600">
              Resources you've shared with the community.
            </p>
          </div>
          {canUpload ? (
            <button
              onClick={handleUploadClick}
              className="bg-[#2B3333] text-white mt-4 px-4 py-2 rounded-sm font-medium hover:bg-[#1f2727] transition flex items-center gap-2"
            >
              <PlusIcon className="w-8 h-4" />
              Upload New {activeTab}
            </button>
          ) : (
            <p className="text-sm text-yellow-600 mt-4">
              Complete profile & wait for admin verification before uploading.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 mt-4 border-2 rounded-sm w-full">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full px-4 py-2 rounded-sm font-medium text-center transition-colors ${
                activeTab === tab
                  ? "bg-[#2B3333] text-white"
                  : "bg-[#FEFEFE] text-black hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 custom-scrollbar">
        {renderTabContent()}
      </div>

      {/* Upload Modal */}
      <ResourceUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUploadSuccess={handleUploadSuccess}
        defaultResourceType={resourceTypeMap[activeTab]}
      />
    </div>
  );
};

export default Contributions;
