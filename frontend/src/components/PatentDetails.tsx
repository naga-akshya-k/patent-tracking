import React, { useState, useEffect } from 'react';
import { api, type PatentDetail, type Department } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';
import { 
  FileText, 
  User, 
  History, 
  CheckCircle, 
  Clock, 
  Upload, 
  Download, 
  ChevronLeft,
  Calendar
} from 'lucide-react';

const STATUS_STAGES = [
  'All',
  'Idea Identified',
  'Draft Preparation',
  'Patent Filed',
  'Under Examination',
  'Published',
  'FER Issued',
  'FER Responded',
  'Granted',
  'Rejected',
  'Abandoned'
];

interface PatentDetailsProps {
  patentId: number;
  onBack: () => void;
}

export const PatentDetails: React.FC<PatentDetailsProps> = ({ patentId, onBack }) => {
  const { user } = useAuth();
  
  // Data States
  const [patent, setPatent] = useState<PatentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Change Forms
  const [transitionStatus, setTransitionStatus] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Document Upload Forms
  const [docType, setDocType] = useState('Patent Draft');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const detRes = await api.getPatentDetail(patentId);
      setPatent(detRes);
      setTransitionStatus(detRes.status);
    } catch (err) {
      console.error("Failed to load patent detail view:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [patentId]);

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patent || transitionStatus === patent.status) return;

    setSubmittingStatus(true);
    try {
      await api.transitionStatus(patent.id, transitionStatus, transitionNotes);
      setTransitionNotes('');
      await fetchDetails();
    } catch (err) {
      console.error("Status transition failed:", err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patent || !uploadFile) return;

    setUploadingDoc(true);
    setUploadError('');
    try {
      await api.uploadDocument(patent.id, docType, uploadFile);
      setUploadFile(null);
      
      // Reset input element
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchDetails();
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading || !patent) {
    return <Loader />;
  }

  const isEditor = user?.role !== 'management_viewer';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Back Header Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold shadow-sm"
        >
          <ChevronLeft size={14} />
          <span>Back to Repository</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Database ID: #{patent.id}
        </span>
      </div>

      {/* Patent Title Block */}
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          {patent.title}
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-650">
            {patent.category} Category
          </span>
          {patent.domain && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-50 border border-brand-100 text-[10px] font-bold text-brand-600">
              {patent.domain}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-650">
            Current Stage: <span className="text-slate-800 font-bold ml-1">{patent.status}</span>
          </span>
        </div>
      </div>

      {/* Unified Details Grid (No tabs, no AI Risk Assessment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Main Details (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Application Abstract */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold font-sans text-slate-900">Application Abstract</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {patent.description || 'No description or abstract details provided for this record.'}
            </p>
          </div>

          {/* Inventors List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-sans text-slate-900">Inventors List</h3>
            <div className="divide-y divide-slate-100">
              {patent.inventors.map((inv) => (
                <div key={inv.id} className="py-3 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      <User size={14} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{inv.inventor_name}</span>
                      {inv.user_id && (
                        <span className="text-[10px] text-brand-600 block font-semibold">Registered Member</span>
                      )}
                    </div>
                  </div>
                  {inv.is_primary && (
                    <span className="px-2 py-0.5 rounded bg-brand-5 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wider">
                      Primary Inventor
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filing Milestones */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-sans text-slate-900">Filing Milestones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-1">Filing Date</span>
                <span className="text-slate-900 font-bold">{patent.filing_date ? new Date(patent.filing_date).toLocaleDateString() : 'Pending'}</span>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">{patent.application_number || 'No App Number'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-1">Publication Date</span>
                <span className="text-slate-900 font-bold">{patent.publication_date ? new Date(patent.publication_date).toLocaleDateString() : 'Pending'}</span>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">{patent.publication_number || 'No Pub Number'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-1">Grant Date</span>
                <span className="text-slate-900 font-bold">{patent.grant_date ? new Date(patent.grant_date).toLocaleDateString() : 'Pending'}</span>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">{patent.grant_number || 'No Grant Number'}</span>
              </div>
            </div>
          </div>

          {/* Document list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-sans text-slate-950 mb-4">Uploaded Document Files</h3>
            {patent.documents.length > 0 ? (
              <div className="space-y-3">
                {patent.documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex gap-3 pr-4 overflow-hidden">
                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 mt-0.5 flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{doc.filename}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500 mt-1">
                          <span className="font-semibold text-brand-600">{doc.document_type}</span>
                          <span>•</span>
                          <span>Version {doc.version}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={api.getDownloadUrl(patent.id, doc.id)}
                      download
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-650 hover:border-brand-200 hover:bg-brand-50 transition-all flex-shrink-0"
                      title="Download File"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-slate-200">
                <FileText size={28} className="text-slate-400 mb-2" />
                <p className="text-slate-700 text-xs font-semibold">No documents uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status Log Timelines & Actions (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Log Audits */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-sans text-slate-900 mb-4">Status Log Audits</h3>
            <div className="space-y-6 relative pl-4">
              <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-slate-200"></div>
              {patent.status_history.map((hist, idx) => (
                <div key={hist.id} className="relative flex gap-4 text-sm timeline-item">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border z-10 ${
                    idx === 0 
                      ? 'bg-brand-500 border-brand-500 text-white shadow-md' 
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {idx === 0 ? <Clock size={12} /> : <History size={12} />}
                  </div>
                  <div className="space-y-1 mt-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-900">{hist.status}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(hist.changed_at).toLocaleDateString()}
                      </span>
                    </div>
                    {hist.notes && (
                      <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1.5">
                        {hist.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status transition controller */}
          {isEditor && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold font-sans text-slate-900">Transition Patent Stage</h3>
              <p className="text-slate-500 text-xs">Update the lifecycle stage of the patent and log remarks</p>
              
              <form onSubmit={handleStatusTransition} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Status Stage</label>
                  <select
                    value={transitionStatus}
                    onChange={(e) => setTransitionStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-500 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 outline-none shadow-sm cursor-pointer"
                  >
                    {STATUS_STAGES.filter(s => s !== 'All').map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit Remarks/Notes</label>
                  <textarea
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-lg px-3.5 py-2.5 text-slate-800 text-xs outline-none transition-colors shadow-sm"
                    placeholder="Log detail reasons..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingStatus || transitionStatus === patent.status}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg text-xs shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submittingStatus ? 'Updating Stage...' : 'Log Status Transition'}
                </button>
              </form>
            </div>
          )}

          {/* Document Upload Form */}
          {isEditor && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold font-sans text-slate-900">Upload Supporting Document</h3>
              <p className="text-slate-500 text-xs">Add official gazette certificates or examination sheets to the record</p>
              
              {uploadError && (
                <div className="p-2.5 rounded bg-red-50 border border-red-150 text-red-750 text-xs">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-500 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 outline-none shadow-sm cursor-pointer"
                  >
                    <option value="Patent Draft">Patent Draft</option>
                    <option value="Filing Certificate">Filing Certificate</option>
                    <option value="Examination Report">Examination Report</option>
                    <option value="Publication Certificate">Publication Certificate</option>
                    <option value="Grant Certificate">Grant Certificate</option>
                    <option value="Supporting Document">Supporting Document</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select File</label>
                  <div className="relative border border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 flex flex-col items-center justify-center hover:border-slate-350 transition-colors">
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <input
                      id="file-upload-input"
                      type="file"
                      required
                      onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-655 font-semibold truncate max-w-[200px]">
                      {uploadFile ? uploadFile.name : 'Choose file or drag here'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">PDF, DOCX, PNG up to 10MB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadingDoc || !uploadFile}
                  className="w-full flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg text-xs shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Upload size={14} />
                  <span>{uploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
