export default function ProfileSection({ user, photoCount }) {
  return (
    <div className="mb-16 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="flex-grow">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4 block">Contributor Profile</span>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">{user?.username}</h1>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Email</span>
            <span className="text-sm font-medium text-slate-700">{user?.email}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Role</span>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full capitalize">{user?.role}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Archive Stats</span>
            <span className="text-sm font-medium text-slate-700">{photoCount} Frames Contributed</span>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 w-32 h-32 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-slate-100 uppercase tracking-tighter overflow-hidden">
        {user?.username?.charAt(0)}
      </div>
    </div>
  );
}
