import { useState, useRef, useEffect } from 'react';
import { apiInstance } from '../utils/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploadMode, setUploadMode] = useState(null);
  const [albumData, setAlbumData] = useState({
    album_id: '',
    title: '',
    description: ''
  });
  const [photos, setPhotos] = useState([]);
  const [showNewAlbumFields, setShowNewAlbumFields] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedPhotoIdx, setExpandedPhotoIdx] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            base64: reader.result,
            filename: file.name,
            title: file.name.split('.')[0],
            description: '',
            captureDate: new Date().toISOString().split('T')[0]
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      if (uploadMode === 'single') {
        setPhotos([results[0]]);
      } else {
        setPhotos([...photos, ...results]);
        setExpandedPhotoIdx(photos.length);
      }
      setIsProcessing(false);
    });
  };

  const updatePhotoMetadata = (idx, field, value) => {
    const updated = [...photos];
    updated[idx] = { ...updated[idx], [field]: value };
    setPhotos(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length === 0) {
      return alert("Please select at least one image");
    }

    const missingTitle = photos.some(p => !p.title.trim());
    if (missingTitle) {
      return alert("All photos must have a title.");
    }

    const payload = {
      album_id: uploadMode === 'album' ? (showNewAlbumFields ? null : (albumData.album_id || null)) : null,
      album: uploadMode === 'album' ? ({ title: albumData.title, description: albumData.description }) : null,
      photos: photos.map(p => ({
        photo: p.base64,
        filename: p.filename,
        title: p.title,
        description: p.description,
        capture_date: p.captureDate
      }))
    };

    try {
      const response = await apiInstance.post('photos/upload', payload);
      if (response.data.success) {
        onClose();
        onUploadSuccess?.();
      } else {
        alert(response.data.error || "Upload failed");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Upload failed");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setUploadMode(null);
    setAlbumData({ album_id: '', title: '', description: '' });
    setPhotos([]);
    setShowNewAlbumFields(false);
    setIsProcessing(false);
    setExpandedPhotoIdx(0);
  };

  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {uploadMode === 'single' ? 'Single Frame' : uploadMode === 'album' ? 'Create Collection' : 'Archive Entry'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {uploadMode ? 'Each frame requires unique technical cataloging.' : 'Choose how you want to contribute to the archive.'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          {!uploadMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8">
              <button
                onClick={() => setUploadMode('single')}
                className="group p-8 border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left space-y-4"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:shadow-indigo-100 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide">Individual Frame</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Upload a single masterpiece with specific metadata.</p>
                </div>
              </button>
              <button
                onClick={() => { setUploadMode('album'); setShowNewAlbumFields(true); }}
                className="group p-8 border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left space-y-4"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:shadow-indigo-100 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide">Curated Collection</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Bulk upload multiple frames, each with its own story.</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              {uploadMode === 'album' && (
                <div className="space-y-4 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Archive Context</label>
                    <input
                      required
                      type="text"
                      value={albumData.title}
                      onChange={(e) => setAlbumData({ ...albumData, title: e.target.value })}
                      placeholder="Collection Title..."
                      className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Source</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center py-8 bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-slate-100"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{uploadMode === 'single' ? 'Pick Masterpiece' : 'Add Frames to Batch'}</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple={uploadMode === 'album'}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="space-y-6">
                {photos.map((photo, idx) => (
                  <div key={idx} className={`border rounded-2xl transition-all overflow-hidden ${expandedPhotoIdx === idx ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-100'}`}>
                    <div onClick={() => setExpandedPhotoIdx(idx)} className="flex items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={photo.base64} className="w-full h-full object-cover" alt="Thumb" />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="text-sm font-bold text-slate-900">{photo.title || "Untitled Frame"}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{photo.filename}</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPhotos(photos.filter((_, i) => i !== idx)); }} className="p-2 text-slate-300 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    {expandedPhotoIdx === idx && (
                      <div className="p-6 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Title</label>
                            <input required type="text" value={photo.title} onChange={(e) => updatePhotoMetadata(idx, 'title', e.target.value)} placeholder="Identifier..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capture Date</label>
                            <input required type="date" value={photo.captureDate} onChange={(e) => updatePhotoMetadata(idx, 'captureDate', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Notes</label>
                          <textarea required value={photo.description} onChange={(e) => updatePhotoMetadata(idx, 'description', e.target.value)} placeholder="Lighting, lens, location..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none h-20" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <button type="submit" disabled={isProcessing || photos.length === 0} className="w-full py-4.5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50">
                  {isProcessing ? 'Processing Archive...' : `Commit ${photos.length} Frame(s) to Archive`}
                </button>
                <button type="button" onClick={() => setUploadMode(null)} className="w-full mt-3 py-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-500 transition-colors">
                  Back to Type Selection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
