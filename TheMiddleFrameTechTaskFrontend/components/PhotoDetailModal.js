import { apiInstance } from '../utils/api';

export default function PhotoDetailModal({ photo, onClose, onAlbumClick, showDeleteButton, onDeleteSuccess }) {
  if (!photo) return null;

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'tmf-download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (photoId) => {
    const isConfirmed = confirm("Are you sure you want to delete this frame from your archive?");
    if (!isConfirmed) return;

    try {
      const response = await apiInstance.delete(`photos/delete/${photoId}`);
      if (response.data.success) {
        onClose();
        onDeleteSuccess?.();
      } else {
        alert(response.data.error || "Delete failed");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose}></div>
      <div className="relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh]">
        <div className="w-full lg:w-[65%] bg-slate-50 flex items-center justify-center overflow-hidden h-[40vh] lg:h-auto border-r border-slate-100">
          <img src={photo.url} className="w-full h-full object-contain p-4 lg:p-12" alt={photo.title} />
        </div>
        <div className="w-full lg:w-[35%] p-8 lg:p-12 flex flex-col h-full bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Image Asset {photo.id}</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">{photo.title || 'Untitled Archive'}</h2>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-slate-100 rounded-full"></div>
              <p className="text-sm font-bold text-indigo-600">{photo.uploader}</p>
            </div>
            {photo.album && (
              <div className="mt-8 pt-8 border-t border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 block mb-4">Part of Archive</span>
                <button
                  onClick={() => onAlbumClick(photo.album)}
                  className="flex items-center space-x-3 px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl group/modal-album transition-all hover:bg-indigo-100 hover:shadow-lg hover:shadow-indigo-50"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{photo.album.title}</span>
                </button>
              </div>
            )}
          </div>
          <div className="space-y-8 flex-grow">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-50 pb-2">Description</h4>
              <p className="text-slate-700 leading-relaxed text-sm">{photo.description || 'No detailed technical description provided for this frame.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-50 pb-2">Captured</h4>
                <p className="text-slate-700 text-sm font-medium">{photo.captureDate || 'Unknown Date'}</p>
              </div>
            </div>
          </div>
          <div className="mt-12 space-y-4">
            <button
              onClick={() => downloadImage(photo.watermarkedUrl, `watermarked-${photo.title || 'photo'}.jpg`)}
              className="w-full py-4 bg-white text-slate-900 border-2 border-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 shadow-sm"
            >
              <span className="text-xs uppercase tracking-widest">Download Watermarked (LQ)</span>
            </button>
            <button
              onClick={() => downloadImage(photo.hqUrl, `original-${photo.title || 'photo'}.jpg`)}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center space-x-3 shadow-lg shadow-slate-200"
            >
              <span className="text-xs uppercase tracking-widest">Download HQ (Original)</span>
            </button>
            {showDeleteButton && (
              <button
                onClick={() => handleDelete(photo.id)}
                className="w-full py-4 bg-white text-red-500 border-2 border-red-100 font-bold rounded-xl hover:bg-red-50 hover:border-red-500 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs"
              >
                Delete Frame
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
