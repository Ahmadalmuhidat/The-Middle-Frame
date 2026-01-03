import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { apiInstance, SERVER_URL } from '../utils/api';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ProfileSection from '../components/ProfileSection';
import PhotoGrid from '../components/PhotoGrid';
import PhotoDetailModal from '../components/PhotoDetailModal';
import Footer from '../components/Footer';
import UploadModal from '../components/UploadModal';
import AlbumPhotosModal from '../components/AlbumPhotosModal';

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState('buyer');
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('marketplace');
  const [viewingAlbum, setViewingAlbum] = useState(null);

  const getPhotos = async () => {
    try {
      const response = await apiInstance.get('photos/');
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch photos' };
    }
  };

  const fetchPhotos = async () => {
    setIsLoading(true);
    const data = await getPhotos();
    if (Array.isArray(data)) {
      const formatted = data.map(photo => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        captureDate: photo.capture_date,
        url: photo.image?.startsWith('http') ? photo.image : `${SERVER_URL}${photo.image}`,
        watermarkedUrl: photo.image?.startsWith('http') ? photo.image : `${SERVER_URL}${photo.image}`,
        hqUrl: photo.original_image?.startsWith('http') ? photo.original_image : `${SERVER_URL}${photo.original_image}`,
        uploader: photo.user?.username || 'Unknown',
        album: photo.album
      }));
      setPhotos(formatted);
    }
    setIsLoading(false);
  };

  const handleAlbumClick = (album) => {
    setViewingAlbum(album);
    setSelectedPhoto(null);
  };

  const myPhotos = user?.username ? photos.filter(photo => photo.uploader === user.username) : [];
  const displayPhotos = activeView === 'marketplace' ? photos : myPhotos;
  const emptyMessage = activeView === 'marketplace' ? 'The marketplace archive is currently empty.' : "You haven't contributed any frames to the archive yet.";

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (!router.query.role) {
        setRole(parsedUser.role === 'uploader' ? 'photographer' : 'buyer');
      }
    }

    if (router.isReady && router.query.role) {
      const initialRole = router.query.role;
      if (initialRole === 'photographer' || initialRole === 'buyer') {
        setRole(initialRole);
      }
    }

    fetchPhotos();
  }, [router.isReady, router.query.role]);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      <Head>
        <title>The Middle Frame | Photography Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        role={role}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
        {activeView === 'marketplace' ? (
          <HeroSection />
        ) : (
          <ProfileSection user={user} photoCount={myPhotos.length} />
        )}

        <PhotoGrid
          photos={displayPhotos}
          isLoading={isLoading}
          onViewDetails={setSelectedPhoto}
          onAlbumClick={handleAlbumClick}
          emptyMessage={emptyMessage}
        />
      </main>

      <Footer />

      <PhotoDetailModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onAlbumClick={handleAlbumClick}
        showDeleteButton={activeView === 'profile'}
        onDeleteSuccess={fetchPhotos}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={fetchPhotos}
      />

      <AlbumPhotosModal
        album={viewingAlbum}
        onClose={() => setViewingAlbum(null)}
        onViewDetails={setSelectedPhoto}
      />
    </div>
  );
}
