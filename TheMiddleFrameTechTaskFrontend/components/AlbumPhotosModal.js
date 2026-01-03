import { useState, useEffect } from 'react';
import { apiInstance, SERVER_URL } from '../utils/api';
import PhotoCard from './PhotoCard';

export default function AlbumPhotosModal({ album, onClose, onViewDetails }) {
  const [photos, setPhotos] = useState([]);
  const [albumDetails, setAlbumDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAlbumDetails = async (albumId) => {
    try {
      const response = await apiInstance.get(`albums/${albumId}`);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch collection details' };
    }
  };

  const fetchAlbumPhotos = async () => {
    setIsLoading(true);
    try {
      const res = await getAlbumDetails(album.id);
      if (res.success && Array.isArray(res.photos)) {
        setAlbumDetails(res.album);
        const formatted = res.photos.map(p => ({
          ...p,
          captureDate: p.capture_date,
          url: p.image?.startsWith('http') ? p.image : `${SERVER_URL}${p.image}`,
          watermarkedUrl: p.image?.startsWith('http') ? p.image : `${SERVER_URL}${p.image}`,
          hqUrl: p.original_image?.startsWith('http') ? p.original_image : `${SERVER_URL}${p.original_image}`
        }));
        setPhotos(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch album photos", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (album) {
      fetchAlbumPhotos();
    }
  }, [album]);

    if (!album) {
    return null;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-12">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-7xl h-full max-h-[92vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
        <div className="px-8 py-10 md:px-14 md:py-12 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
              <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] ml-1">Archive Collection</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              {album.title}
            </h2>
            <div className="flex items-center space-x-4 mt-4">
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                {photos.length} Professional Assets
              </p>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase italic">
                by {albumDetails?.uploader || album.uploader || 'Senior Contributor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all group relative overflow-hidden"
          >
            <svg className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto px-8 py-10 md:px-14 md:py-12 custom-scrollbar bg-slate-50/30">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Archive Database...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center mb-6 text-slate-100">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Empty Archive</h3>
              <p className="text-slate-400 max-w-xs mx-auto">This collection currently contains no high-resolution assets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
              {photos.map(photo => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onViewDetails={onViewDetails}
                  isPhotographer={false}
                  aspectRatio="aspect-square"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
