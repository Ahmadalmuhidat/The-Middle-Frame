export default function Footer() {
  return (
    <footer className="py-12 border-t border-slate-100 bg-slate-50/30">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
        <p>© 2026 The Middle Frame</p>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
