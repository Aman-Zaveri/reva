'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIFloatingActions } from '@/components/shared/AIFloatingActions';

export default function ImportResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
      setMessageType('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a resume file first');
      setMessageType('error');
      return;
    }

    setIsUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/import-resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Resume imported successfully! Redirecting to data page...');
        setMessageType('success');
        
        // Redirect to data page after a short delay
        setTimeout(() => {
          router.push('/data');
        }, 2000);
      } else {
        setMessage(result.error || 'Failed to import resume');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while importing your resume');
      setMessageType('error');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Import Your Resume</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Upload your existing resume and we&apos;ll automatically extract all the information 
              to populate your master data. This saves you from entering everything manually!
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Supported formats:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• .txt files (plain text resume)</li>
                <li>• .docx files (Microsoft Word documents)</li>
                <li>• Hyperlinks are automatically extracted (LinkedIn, GitHub, project links)</li>
                <li>• For best results, ensure your resume is well-formatted</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume File
              </label>
              <input
                id="resume-file"
                type="file"
                accept=".txt,.text,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Importing...' : 'Import Resume'}
              </button>
              
              <button
                onClick={() => router.push('/data')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Skip & Enter Manually
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Upload your resume as a .txt or .docx file</li>
              <li>2. Our AI will automatically extract:</li>
              <li className="ml-4">• Personal information (name, email, phone, location)</li>
              <li className="ml-4">• LinkedIn, GitHub, and website URLs from hyperlinks</li>
              <li className="ml-4">• Work experiences with bullet points</li>
              <li className="ml-4">• Projects and achievements with links</li>
              <li className="ml-4">• Skills and technologies</li>
              <li className="ml-4">• Education details</li>
              <li>3. Review and edit the imported data</li>
              <li>4. Start creating optimized resumes!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* AI Floating Actions */}
      <AIFloatingActions
        context="import"
        onAIAction={async (actionId: string, params?: any) => {
          try {
            // Handle AI actions in the import context
            switch (actionId) {
              case 'extract-linkedin':
                console.log('Triggering AI LinkedIn extraction...');
                const linkedinUrl = prompt('Please paste your LinkedIn profile URL:');
                if (linkedinUrl) {
                  const response = await fetch('/api/ai-agents/single-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      agent: 'resume-builder',
                      prompt: `Extract professional information from LinkedIn profile: ${linkedinUrl}. Generate structured resume data.`,
                    }),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    alert('LinkedIn extraction complete! Check console for details.');
                    console.log('LinkedIn Extraction Result:', result);
                  }
                }
                break;
                
              case 'parse-resume':
                console.log('Triggering AI resume parsing...');
                const resumeText = prompt('Please paste your resume text for AI parsing:');
                if (resumeText) {
                  const response = await fetch('/api/ai-agents/single-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      agent: 'resume-builder',
                      prompt: `Parse this resume text and extract structured data: ${resumeText}`,
                    }),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    alert('Resume parsing complete! Check console for details.');
                    console.log('Resume Parsing Result:', result);
                  }
                }
                break;
                
              default:
                console.log(`AI Action: ${actionId} not implemented yet`);
            }
          } catch (error) {
            console.error('AI Action failed:', error);
            alert('AI action failed. Please try again.');
          }
        }}
      />
    </div>
  );
}
