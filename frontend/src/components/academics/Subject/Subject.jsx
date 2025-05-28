import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../supabaseClient"; 
import FilterPanel from "./FilterPanel";
import SubjectCard from "./SubjectCard";
import EmptyState from "./EmptyState";
import Header from "../Header/Header";
import Footer from "../../Home/Footer"; 

function Subject() {
  const navigate = useNavigate();

  // Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(""); 
  const [allSubjects, setAllSubjects] = useState([]);
  const [courses, setCourses] = useState([]); 
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false)

 
  const semesters = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
       
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("id, name")
          .order("name", { ascending: true });
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select(`
            id, 
            name, 
            code, 
            description, 
            semester_number, 
            teacher_name, 
            course_id, 
            course:course_id (name)
          `)
          .order("name", { ascending: true });
        if (subjectsError) throw subjectsError;
        setAllSubjects(subjectsData || []);
        setFilteredSubjects(subjectsData || []); 

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data.");
        setAllSubjects([]);
        setFilteredSubjects([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    let tempFiltered = [...allSubjects];

    
    if (departmentFilter) { 
      tempFiltered = tempFiltered.filter(subject => subject.course_id === departmentFilter);
    }

    // Semester Filter
    if (semesterFilter) {
      tempFiltered = tempFiltered.filter(subject => subject.semester_number === parseInt(semesterFilter, 10));
    }


    if (searchFilter) {
      const lowerSearchFilter = searchFilter.toLowerCase();
      tempFiltered = tempFiltered.filter(subject =>
        subject.name.toLowerCase().includes(lowerSearchFilter) ||
        (subject.teacher_name && subject.teacher_name.toLowerCase().includes(lowerSearchFilter))
      );
    }
    setFilteredSubjects(tempFiltered);
  }, [searchFilter, semesterFilter, departmentFilter, allSubjects]);

  const clearFilters = useCallback(() => {
    setSearchFilter("");
    setSemesterFilter("");
    setDepartmentFilter("");
  }, []);

  const handleCardClick = (id) => {
    navigate(`/subject/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEFE]">
      <Header />
      
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <FilterPanel
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            semesterFilter={semesterFilter}
            setSemesterFilter={setSemesterFilter}
            departmentFilter={departmentFilter} 
            setDepartmentFilter={setDepartmentFilter}
            departmentDropdownOpen={departmentDropdownOpen} 
            setDepartmentDropdownOpen={setDepartmentDropdownOpen} 
            departments={courses} 
            semesters={semesters} 
            clearFilters={clearFilters}
          />
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {loading && <p className="text-center text-gray-500">Loading subjects...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <>
            <div className="mb-8">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-[#003366]">
                  {filteredSubjects.length}
                </span>{" "}
                {filteredSubjects.length === 1 ? "subject" : "subjects"}
              </p>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="w-full max-w-md mx-auto">
                <EmptyState onClear={clearFilters} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-16">
                {filteredSubjects.map((subject) => {
                 
                  const cardSubjectData = {
                    id: subject.id,
                    code: subject.code || "N/A",
                    name: subject.name,
                    description: subject.description || "No description available.",
                    semester: `Semester ${subject.semester_number}`,
                    department: subject.course?.name || "N/A", 
                    teacher: subject.teacher_name || "To Be Announced",
                  };
                  return (
                    <SubjectCard
                      key={subject.id}
                      subject={cardSubjectData}
                      onClick={handleCardClick}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Subject;
