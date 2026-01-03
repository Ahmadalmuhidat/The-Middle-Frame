export default function PhotoCard({ photo, onViewDetails, onAlbumClick, aspectRatio = 'aspect-[3/2]' }) {
  const { title, captureDate, url, uploader, album } = photo;

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60 border border-slate-100">
      <div className={`relative ${aspectRatio} overflow-hidden bg-slate-100`}>
        <img
          src={url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          onClick={() => onViewDetails(photo)}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer flex items-end justify-center pb-6"
        >
          <button className="px-5 py-2 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">{title || 'Untitled'}</h3>
          <span className="shrink-0 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            {captureDate ? new Date(captureDate).getFullYear() : '—'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">by {uploader || 'Unknown'}</p>
        {album && (
          <button
            onClick={(e) => { e.stopPropagation(); onAlbumClick?.(album); }}
            className="inline-flex items-center space-x-1.5 px-2 py-1 bg-indigo-50/80 border border-indigo-100/50 rounded-md transition-all hover:bg-indigo-100 hover:border-indigo-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">{album.title}</span>
          </button>
        )}
      </div>
    </div>
  );
}
