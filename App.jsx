import React, { useState, useEffect, useMemo } from 'react';
import { 
  Music, Globe, Zap, Terminal, RefreshCw, Play, 
  ShieldCheck, Database, AlertCircle, ExternalLink,
  ChevronRight, Cpu, HardDrive, LayoutGrid, Clock,
  Moon, Sun, Download, Music as MusicIcon, Video, 
  MapPin, Bell, BellRing
} from 'lucide-react';

const App = () => {
  const [activeModule, setActiveModule] = useState('tiktok');
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [logs, setLogs] = useState(['// auramage OS v19: Nusantara Ultimate Engine Active.']);
  const [previewData, setPreviewData] = useState(null);
  const [apiRaw, setApiRaw] = useState(null);
  
  const [time, setTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState({ city: 'Jakarta', zone: 'WIB' });

  const MASTER_KEY = "c65dc6a2c5mshfb24b91d1f6e1f8p14dfdbjsn5fdffba5530e";

  const addLog = (msg) => setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const offset = new Date().getTimezoneOffset() / -60;
    let zone = 'WIB';
    if (offset === 8) zone = 'WITA';
    if (offset === 9) zone = 'WIT';
    setLocation(prev => ({ ...prev, zone }));

    fetch(`https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=2`)
      .then(res => res.json())
      .then(data => setPrayerTimes(data.data.timings))
      .catch(() => addLog("⚠️ Gagal mengambil jadwal salat."));

    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-GB', { hour12: false });

  const currentPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    const now = formattedTime.substring(0, 5);
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return prayers.find(p => prayerTimes[p] === now);
  }, [formattedTime, prayerTimes]);

  const executeEngine = async () => {
    if (!inputVal) return;
    setLoading(true);
    setPreviewData(null);
    setApiRaw(null);
    addLog(`Eksekusi Jalur ${activeModule.toUpperCase()}...`);

    try {
      let url = "";
      let options = { headers: { 'x-rapidapi-key': MASTER_KEY } };

      if (activeModule === 'tiktok') {
        url = 'https://tiktok-video-no-watermark2.p.rapidapi.com/';
        options.method = 'POST';
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.headers['x-rapidapi-host'] = 'tiktok-video-no-watermark2.p.rapidapi.com';
        options.body = new URLSearchParams({ url: inputVal, hd: '1' });
      } else {
        url = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';
        options.method = 'POST';
        options.headers['Content-Type'] = 'application/json';
        options.headers['x-rapidapi-host'] = 'social-download-all-in-one.p.rapidapi.com';
        options.body = JSON.stringify({ url: inputVal });
      }

      const response = await fetch(url, options);
      const result = await response.json();
      setApiRaw(result);

      if (activeModule === 'tiktok' && result.data) {
        setPreviewData({
          video_hd: result.data.play,
          video_wm: result.data.wmplay,
          music: result.data.music,
          title: result.data.title || "TikTok Content",
          author: result.data.author?.nickname
        });
        addLog("✅ TikTok Engine: Sukses.");
      } else if (activeModule === 'universal') {
        const media = result.medias || [];
        setPreviewData({
          video_hd: media.find(m => m.quality === 'hd')?.url || media[0]?.url,
          video_wm: media.find(m => m.watermark)?.url || null,
          music: media.find(m => m.extension === 'mp3')?.url || null,
          title: result.title || "Universal Media",
          author: result.source
        });
        addLog("✅ Universal Engine: Sukses.");
      }
    } catch (err) {
      addLog(`❌ Gangguan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-400 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0a0a0f] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500 rounded-2xl shadow-[0_0_15px_#06b6d4]"><Clock className="text-black" size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{location.zone} TIME</p>
                   <p className="text-2xl font-black text-white font-mono">{formattedTime}</p>
                </div>
             </div>
          </div>

          <div className={`bg-[#0a0a0f] border ${currentPrayer ? 'border-cyan-500 animate-pulse' : 'border-white/5'} p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl transition-all`}>
             <div className="flex items-center gap-4">
                <div className={`p-3 ${currentPrayer ? 'bg-cyan-500' : 'bg-slate-800'} rounded-2xl`}>
                   {currentPrayer ? <BellRing className="text-black" size={20}/> : <Moon className="text-white" size={20}/>}
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">PRAYER TIMES</p>
                   <p className="text-xs font-bold text-white uppercase">
                      {currentPrayer ? `Waktunya Salat ${currentPrayer}!` : prayerTimes ? `Next: Dzuhur ${prayerTimes.Dhuhr}` : 'Menghubungkan...'}
                   </p>
                </div>
             </div>
          </div>

          <div className="bg-[#0a0a0f] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl"><MapPin className="text-black" size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">SYSTEM NODE</p>
                   <p className="text-xs font-bold text-white uppercase italic tracking-tighter">Nusantara_Edition_V19</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
             <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[3.5rem] shadow-2xl">
                <div className="flex items-center gap-3 mb-12">
                   <div className="p-3 bg-cyan-500 rounded-2xl"><Zap className="text-black" size={20}/></div>
                   <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">SKYZO<span className="text-cyan-500">PRO</span></h1>
                </div>

                <div className="space-y-4">
                   {[
                     {id:'tiktok', name:'TikTok Locked', icon:<Music size={16}/>},
                     {id:'universal', name:'Universal (IG/YT)', icon:<Globe size={16}/>}
                   ].map(m => (
                     <button 
                       key={m.id}
                       onClick={() => { setActiveModule(m.id); setPreviewData(null); }}
                       className={`w-full flex items-center justify-between px-8 py-6 rounded-3xl transition-all ${activeModule === m.id ? 'bg-white text-black scale-105 shadow-2xl' : 'bg-white/5 text-slate-600 hover:text-white'}`}
                     >
                       <div className="flex items-center gap-4">
                          {m.icon}
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{m.name}</span>
                       </div>
                       <ChevronRight size={14} className={activeModule === m.id ? 'opacity-100' : 'opacity-0'}/>
                     </button>
                   ))}
                </div>
             </div>

             {prayerTimes && (
               <div className="bg-black/40 border border-white/5 p-8 rounded-[3rem]">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 italic text-center">Jadwal Salat</p>
                  <div className="grid grid-cols-2 gap-3">
                     {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                        <div key={p} className={`p-4 rounded-2xl border ${prayerTimes[p] === formattedTime.substring(0, 5) ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5'}`}>
                           <p className="text-[8px] text-slate-500 uppercase font-black">{p}</p>
                           <p className="text-xs font-bold text-white font-mono">{prayerTimes[p]}</p>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </aside>

          <main className="lg:col-span-8 space-y-8">
             <section className="bg-slate-900/20 border border-white/5 p-10 rounded-[4rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-6 italic">Secure Gateway</p>
                      <input 
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder={`Masukkan link ${activeModule.toUpperCase()}...`}
                        className="w-full bg-black/60 border border-slate-800 rounded-full px-10 py-8 text-sm text-white focus:border-cyan-500 outline-none transition-all shadow-inner"
                      />
                   </div>
                   <button 
                     onClick={executeEngine}
                     disabled={loading}
                     className="w-full bg-white hover:bg-cyan-500 text-black font-black py-8 rounded-full flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-30 shadow-2xl"
                   >
                     {loading ? <RefreshCw className="animate-spin"/> : <><Play size={18} className="fill-current"/> START EXTRACTION</>}
                   </button>
                </div>
             </section>

             {previewData && (
                <div className="bg-[#0a0a0f] border border-white/5 rounded-[4.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-700 shadow-2xl">
                   <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="bg-black aspect-[9/16] border-r border-white/5">
                         <video 
                           key={previewData.video_hd}
                           src={previewData.video_hd} 
                           controls 
                           autoPlay 
                           className="w-full h-full object-contain"
                         ></video>
                      </div>
                      <div className="p-12 flex flex-col justify-between">
                         <div className="space-y-8">
                            <div className="flex items-center gap-2 text-cyan-500">
                               <ShieldCheck size={18}/>
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Data Ready</p>
                            </div>
                            <h3 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase italic">{previewData.title}</h3>
                            
                            <div className="space-y-3">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic ml-4">Opsi Unduhan</p>
                               <div className="grid grid-cols-1 gap-3">
                                  <button onClick={() => window.open(previewData.video_hd, '_blank')} className="w-full bg-white text-black flex items-center justify-between px-6 py-5 rounded-3xl hover:bg-cyan-500 transition-all font-black text-[10px] uppercase">
                                     <div className="flex items-center gap-3"><Video size={16}/> HD - No Watermark</div>
                                     <Download size={14}/>
                                  </button>
                                  
                                  {previewData.video_wm && (
                                     <button onClick={() => window.open(previewData.video_wm, '_blank')} className="w-full bg-white/5 border border-white/5 text-white flex items-center justify-between px-6 py-5 rounded-3xl hover:bg-white/10 transition-all font-black text-[10px] uppercase">
                                        <div className="flex items-center gap-3"><Video size={16}/> With Watermark</div>
                                        <Download size={14}/>
                                     </button>
                                  )}

                                  {previewData.music && (
                                     <button onClick={() => window.open(previewData.music, '_blank')} className="w-full bg-white/5 border border-white/5 text-cyan-500 flex items-center justify-between px-6 py-5 rounded-3xl hover:bg-cyan-500/10 transition-all font-black text-[10px] uppercase">
                                        <div className="flex items-center gap-3"><MusicIcon size={16}/> Music - MP3 Only</div>
                                        <Download size={14}/>
                                     </button>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             <footer className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <div className="bg-black/60 border border-white/5 rounded-[3rem] p-10 shadow-xl">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-6 flex items-center gap-2"><Terminal size={14}/> Sys_Logs</p>
                   <div className="h-24 overflow-y-auto font-mono text-[9px] text-emerald-500/30 space-y-1 scrollbar-hide">
                      {logs.map((l, i) => <div key={i}>{l}</div>)}
                   </div>
                </div>
                <div className="bg-black/60 border border-white/5 rounded-[3rem] p-10 shadow-xl">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-6 flex items-center gap-2"><Database size={14}/> Raw_Buffer</p>
                   <div className="h-24 overflow-y-auto font-mono text-[9px] text-cyan-500/20 scrollbar-hide">
                      {apiRaw ? JSON.stringify(apiRaw, null, 2) : "// Empty."}
                   </div>
                </div>
             </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;

