import React, { useState, useEffect } from 'react';
import { DownloadIcon, EyeIcon, XIcon } from '../../../Icons';
import { supabase } from '../../../supabaseClient'; 

function ResourceItem({ title, file, originalFileName }) { 
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (file) {
        setIsLoadingUrl(true);
        setFileUrl(''); 
        try {
          const { data, error } = await supabase.storage
            .from('uploads') 
            .createSignedUrl(file, 3600); 

          if (error) {
            console.error('Error creating signed URL:', error);
            throw error; 
          }
          
          if (data && data.signedUrl) {
            setFileUrl(data.signedUrl);
          } else {
            console.error('No signed URL returned for:', file);
            
          }
        } catch (err) {
          console.error('Failed to get signed URL:', err);
          setFileUrl(''); 
        } finally {
          setIsLoadingUrl(false);
        }
      } else {
        
        setFileUrl('');
        setIsLoadingUrl(false);
      }
    };
    getSignedUrl();
  }, [file]);

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      
      link.setAttribute('download', originalFileName || `${title}.pdf`); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <>
      <li className='bg-[#f8f9fa] p-3 rounded hover:bg-[#e9f0f8] transition flex justify-between items-center'>
        <span className='text-sm text-[#2b3333] truncate' title={title}>{title}</span>
        <div className='flex items-center gap-3 flex-shrink-0'>
          {isLoadingUrl ? (
            <span className="text-xs text-gray-400">Loading...</span>
          ) : fileUrl ? (
            <>
              <button onClick={() => setShowPreview(true)} className='text-sm text-[#0077cc] hover:underline flex items-center cursor-pointer'>
                <EyeIcon className='h-4 w-4 mr-1' />
                Preview
              </button>
              <button onClick={handleDownload} className='text-sm text-[#003366] hover:underline flex items-center'>
                <DownloadIcon className='h-4 w-4 mr-1' />
                Download
              </button>
            </>
          ) : (
            <span className="text-xs text-red-500">Link N/A</span>
          )}
        </div>
      </li>

      {showPreview && fileUrl && (
        <div onClick={() => setShowPreview(false)} className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
          <div onClick={e => e.stopPropagation()} className='relative w-full max-w-5xl max-h-full rounded-lg shadow-lg bg-white overflow-hidden'>
            <button
              onClick={() => setShowPreview(false)}
              className='absolute top-2 right-2 text-gray-600 hover:text-red-600 bg-white rounded-full p-1 shadow-md z-50 cursor-pointer '
              title='Close Preview'>
              <XIcon className='w-6 h-6' />
            </button>

            <iframe src={fileUrl} title={`PDF Preview: ${title}`} className='w-full h-[80vh] rounded-b-lg' frameBorder='0' />
          </div>
        </div>
      )}
    </>
  );
}

export default ResourceItem;
