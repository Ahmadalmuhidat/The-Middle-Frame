import PhotoCard from './PhotoCard';

export default function PhotoGrid({ photos, isLoading, onViewDetails, onAlbumClick, emptyMessage }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-[3/2] bg-slate-50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
        <p className="text-slate-400 font-medium tracking-tight">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onViewDetails={onViewDetails}
          onAlbumClick={onAlbumClick}
        />
      ))}
    </div>
  );
}
