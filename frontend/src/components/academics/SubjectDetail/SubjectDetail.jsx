import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { BookOpenIcon, DocumentTextIcon, ClipboardListIcon } from '../../../Icons';
import Header from './Header';
import EmptyState from './EmptyState'; 
import SubjectInfo from './SubjectInfo';
import ResourceSection from './ResourceSection';
import Footer from '../../Home/Footer'; 

function SubjectDetail() {
  const { id: subjectId } = useParams(); 
  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!subjectId) {
        setError("Subject ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch subject details
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select(`
            id,
            name,
            code,
            description,
            semester_number,
            teacher_name,
            course:course_id (name)
          `)
          .eq('id', subjectId)
          .single();

        if (subjectError) throw subjectError;
        if (!subjectData) {
          setError("Subject not found.");
          setLoading(false);
          return;
        }
        
        
        const mappedSubject = {
          id: subjectData.id,
          name: subjectData.name,
          code: subjectData.code || "N/A",
          description: subjectData.description || "No description available.", 
          about: subjectData.description || "No description available.", 
          semester: `Semester ${subjectData.semester_number}`,
          department: subjectData.course?.name || "N/A",
          teacher: subjectData.teacher_name || "To Be Announced",
        };
        setSubject(mappedSubject);

        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('id, title, resource_type, file_path, file_name') 
          .eq('subject_id', subjectData.id)
          .eq('status', 'APPROVED');

        if (resourcesError) throw resourcesError;

        const notesArray = [];
        const pyqsArray = [];
        const syllabusArray = [];

        (resourcesData || []).forEach(res => {
          const resourceItemData = {
            id: res.id, 
            title: res.title,
            file: res.file_path, 
            originalFileName: res.file_name 
          };
          if (res.resource_type === 'NOTE') notesArray.push(resourceItemData);
          else if (res.resource_type === 'PYQ') pyqsArray.push(resourceItemData);
          else if (res.resource_type === 'SYLLABUS') syllabusArray.push(resourceItemData);
        });

        setNotes(notesArray);
        setPyqs(pyqsArray);
        setSyllabus(syllabusArray);

      } catch (err) {
        console.error('Error fetching subject details:', err);
        setError(err.message || 'Failed to load subject details.');
        setSubject(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f5f7fa] to-[#f0f4f8]'>
        <p className="text-gray-500">Loading subject details...</p>
      </div>
    );
  }

  if (error || !subject) {
  
    return <EmptyState />; 
  }
  
  const totalItems = notes.length + pyqs.length + syllabus.length;

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-[#f5f7fa] to-[#f0f4f8]'>
      <Header subject={subject} /> {}
      <div className='container mx-auto py-6 px-6 flex-grow'>
        <SubjectInfo subject={subject} /> {}
        
        {totalItems > 0 ? (
          <>
            <div className='mb-4 flex justify-between items-center mt-6'>
              <h2 className='text-lg font-bold text-[#2b3333]'>Course Resources</h2>
              <span className='text-xs bg-[#e9f0f8] text-[#003366] px-2 py-1 rounded-full'>{totalItems} items</span>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <ResourceSection title='Lecture Notes' IconComponent={BookOpenIcon} resources={notes} folder='notes' />
              <ResourceSection title='Previous Year Questions' IconComponent={ClipboardListIcon} resources={pyqs} folder='pyqs' />
              <ResourceSection title='Course Syllabus' IconComponent={DocumentTextIcon} resources={syllabus} folder='syllabus' />
            </div>
          </>
        ) : (
          <div className="text-center py-10 mt-6 bg-white rounded-lg shadow-sm border border-[#e0e5ec]">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Resources Available</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no approved resources (Notes, PYQs, Syllabus) for this subject.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SubjectDetail;
