import React, { useState, useEffect } from 'react';
import { api, type PatentDetail, type RiskDetail, type Department } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  User, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Upload, 
  Download, 
  CornerDownRight, 
  Sparkles,
  ChevronLeft,
  Calendar
} from 'lucide-react';

interface PatentDetailsProps {
  patentId: number;
  onBack: () => void;
}

export const PatentDetails: React.FC<PatentDetailsProps> = ({ patentId, onBack }) => {
  const { user } = useAuth();
  
  // Data States
  const [patent, setPatent] = useState<PatentDetail | null>(null);
  const [risk, setRisk] = useState<RiskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'documents'>('info');

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
      const [detRes, riskRes] = await Promise.all([
        api.getPatentDetail(patentId),
        api.getAiRiskAssessment(patentId)
      ]);
      setPatent(detRes);
      setRisk(riskRes);
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  const getRiskColor = (lvl: string) => {
    switch (lvl) {
      case 'High': return 'bg-red-500/10 border-red-500/35 text-red-400';
      case 'Medium': return 'bg-amber-500/10 border-amber-500/35 text-amber-400';
      default: return 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400';
    }
  };

  const isEditor = user?.role !== 'management_viewer';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Back Header Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold"
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
        <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white leading-tight">
          {patent.title}
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            {patent.category} Category
          </span>
          {patent.domain && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/25 text-[10px] font-bold text-brand-400">
              {patent.domain}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            Current Stage: <span className="text-white ml-1">{patent.status}</span>
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'info' 
              ? 'border-brand-500 text-brand-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Repository Info & Risk
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'timeline' 
              ? 'border-brand-500 text-brand-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Lifecycle Status History
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'documents' 
              ? 'border-brand-500 text-brand-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Document Manager ({patent.documents.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Metadata details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-5">
              <h3 className="text-base font-bold font-display text-white">Application Abstract</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {patent.description || 'No description or abstract details provided for this record.'}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold font-display text-white">Inventors List</h3>
              <div className="divide-y divide-slate-800/40">
                {patent.inventors.map((inv) => (
                  <div key={inv.id} className="py-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <User size={14} />
                      </div>
                      <div>
                        <span className="font-semibold text-white">{inv.inventor_name}</span>
                        {inv.user_id && (
                          <span className="text-[10px] text-brand-400 block font-medium">Registered Member</span>
                        )}
                      </div>
                    </div>
                    {inv.is_primary && (
                      <span className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/25 text-brand-400 text-[9px] font-bold uppercase tracking-wider">
                        Primary Inventor
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Official Registration details */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold font-display text-white">Filing Milestones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-1">Filing Date</span>
                  <span className="text-white font-bold">{patent.filing_date ? new Date(patent.filing_date).toLocaleDateString() : 'Pending'}</span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">{patent.application_number || 'No App Number'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-1">Publication Date</span>
                  <span className="text-white font-bold">{patent.publication_date ? new Date(patent.publication_date).toLocaleDateString() : 'Pending'}</span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">{patent.publication_number || 'No Pub Number'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-1">Grant Date</span>
                  <span className="text-white font-bold">{patent.grant_date ? new Date(patent.grant_date).toLocaleDateString() : 'Pending'}</span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">{patent.grant_number || 'No Grant Number'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk Assessment panel */}
          <div className="lg:col-span-5 space-y-6">
            {risk && (
              <div className={`glass-panel p-6 rounded-xl border ${getRiskColor(risk.risk_level)} space-y-4`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} />
                    <h3 className="font-bold font-display">AI Risk Evaluation</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    risk.risk_level === 'High' ? 'bg-red-500 text-white' :
                    risk.risk_level === 'Medium' ? 'bg-amber-500 text-slate-950' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {risk.risk_level} Risk
                  </span>
                </div>

                <div className="text-xs space-y-2 border-t border-slate-800/40 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Days in status stage:</span>
                    <span className="font-bold text-white">{risk.days_in_status} Days</span>
                  </div>
                </div>

                {risk.reasons.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/20">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Delay Warning Reasons
                    </span>
                    <div className="space-y-2">
                      {risk.reasons.map((reason, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-slate-300">
                          <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {risk.action_items.length > 0 ? (
                  <div className="space-y-2 pt-3 border-t border-slate-800/20">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Recommended Administrative Actions
                    </span>
                    <div className="space-y-2 bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                      {risk.action_items.map((act, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-slate-400 font-medium">
                          <CornerDownRight size={12} className="text-brand-500 mt-0.5 flex-shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-lg text-xs font-semibold">
                    <CheckCircle size={14} />
                    <span>No process delays detected. Patent is moving normally.</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Milestone timeline display */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-slate-800/80">
            <h3 className="text-base font-bold font-display text-white mb-6">Status Log Audits</h3>
            <div className="space-y-6 relative pl-4">
              <div className="absolute top-2 bottom-2 left-7 w-0.5 bg-slate-800"></div>
              
              {patent.status_history.map((hist, idx) => (
                <div key={hist.id} className="relative flex gap-4 text-sm timeline-item">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border z-10 ${
                    idx === 0 
                      ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    {idx === 0 ? <Clock size={12} /> : <History size={12} />}
                  </div>
                  <div className="space-y-1 mt-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white">{hist.status}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(hist.changed_at).toLocaleDateString()}
                      </span>
                    </div>
                    {hist.notes && (
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/25 p-2 rounded.5 border border-slate-850 mt-1.5">
                        {hist.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status update control panel */}
          {isEditor && (
            <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold font-display text-white">Transition Patent Stage</h3>
              <p className="text-slate-500 text-xs">Update the lifecycle stage of the patent and log remarks</p>
              
              <form onSubmit={handleStatusTransition} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Status Stage</label>
                  <select
                    value={transitionStatus}
                    onChange={(e) => setTransitionStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-slate-300 text-sm rounded-lg px-3.5 py-2.5 outline-none cursor-pointer"
                  >
                    {STATUS_STAGES.filter(s => s !== 'All').map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Remarks/Notes</label>
                  <textarea
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3.5 py-2.5 text-white text-xs outline-none transition-colors"
                    placeholder="Log detail reasons, hearing details, or filing code updates here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingStatus || transitionStatus === patent.status}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg text-xs shadow shadow-brand-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submittingStatus ? 'Updating Stage...' : 'Log Status Transition'}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Document list */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-slate-800/80">
            <h3 className="text-base font-bold font-display text-white mb-6">Uploaded Document Files</h3>
            {patent.documents.length > 0 ? (
              <div className="space-y-3">
                {patent.documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex justify-between items-center p-4 rounded bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors"
                  >
                    <div className="flex gap-3 pr-4 overflow-hidden">
                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 mt-0.5 flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate leading-tight">{doc.filename}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500 mt-1">
                          <span className="font-semibold text-brand-400">{doc.document_type}</span>
                          <span>•</span>
                          <span>Version {doc.version}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href={api.getDownloadUrl(patent.id, doc.id)}
                      download
                      className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/45 hover:bg-brand-500/5 transition-all flex-shrink-0"
                      title="Download File"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-950/20 rounded-lg border border-slate-800/40">
                <FileText size={36} className="text-slate-650 mb-2.5" />
                <p className="text-slate-400 text-sm font-semibold">No documents uploaded</p>
                <p className="text-slate-500 text-xs mt-1">Provide filing certificates, drafts, or hearing notices for audit trails.</p>
              </div>
            )}
          </div>

          {/* Document Upload Form */}
          {isEditor && (
            <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold font-display text-white">Upload Supporting Document</h3>
              <p className="text-slate-500 text-xs">Add official gazette certificates or examination sheets to the record</p>
              
              {uploadError && (
                <div className="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-red-300 text-xs">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-slate-300 text-sm rounded-lg px-3.5 py-2.5 outline-none cursor-pointer"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select File</label>
                  <div className="relative border border-dashed border-slate-800 rounded-lg p-6 bg-slate-950/30 flex flex-col items-center justify-center hover:border-slate-700 transition-colors">
                    <Upload size={24} className="text-slate-500 mb-2" />
                    <input
                      id="file-upload-input"
                      type="file"
                      required
                      onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-semibold truncate max-w-[200px]">
                      {uploadFile ? uploadFile.name : 'Choose file or drag here'}
                    </span>
                    <span className="text-[10px] text-slate-650 mt-1">PDF, DOCX, PNG up to 10MB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadingDoc || !uploadFile}
                  className="w-full flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg text-xs shadow shadow-brand-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Upload size={14} />
                  <span>{uploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
