import { motion } from 'motion/react';
import { ArrowDown, Music, Play, ExternalLink, Mail, Disc } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const VideoCover = ({ src }: { src: string }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { rootMargin: '50px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [inView]);

  return (
    <div ref={ref} className="absolute inset-0 z-0 w-full h-full bg-zinc-900 transition-colors duration-500">
      {inView && (
        <video 
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100 pointer-events-none"
        />
      )}
    </div>
  );
};

export default function App() {
  const [volume, setVolume] = useState(0.1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [bounce, setBounce] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLocked]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isLocked && window.scrollY === 0) {
        if (e.deltaY > 0) {
          if (!bounce) {
            setBounce(true);
            setTimeout(() => {
              setBounce(false);
              setIsLocked(false);
            }, 600);
          }
        }
      }
    };

    let startY = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isSwiping = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isLocked && window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        if (startY - currentY > 20 && !isSwiping) { // Swiping up
          isSwiping = true;
          if (!bounce) {
            setBounce(true);
            setTimeout(() => {
              setBounce(false);
              setIsLocked(false);
            }, 600);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLocked, bounce]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0 && !isLocked) {
        setIsLocked(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLocked]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newVolume = Math.max(0, Math.min(1, 1 - (y / rect.height)));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsLocked(false);
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const [currentVideo, setCurrentVideo] = useState({
    title: "温差",
    type: "【星尘原创曲】 / 重型盯鞋",
    desc: "在极度的喧嚣中寻找宁静，于温差之间感受情绪的撕裂与弥合。",
    videoUrl: "https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/26/75/28553447526/28553447526-1-192.mp4?e=ig8euxZM2rNcNbRgnwdVhwdlhWN3hwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&platform=html5&gen=playurlv3&mid=0&nbs=1&uipk=5&trid=a1ee90cda3fb4058a39806d3de70febO&os=estghw&og=hw&deadline=1778497092&oi=1385955528&upsig=301235b7b8ff4d3fe481d3329c9888de&uparams=e,platform,gen,mid,nbs,uipk,trid,os,og,deadline,oi&bvc=vod&nettype=1&bw=1028614&agrr=1&buvid=&build=7330300&dl=0&f=O_0_0&orderid=0,3"
  });

  const discography = [
    {
      id: 1,
      title: "温差",
      type: "【星尘原创曲】 / 重型盯鞋",
      desc: "在极度的喧嚣中寻找宁静，于温差之间感受情绪的撕裂与弥合。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/28553447526-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/4d9W/5%25E6%259C%258811%25E6%2597%25A5.mp4"
    },
    {
      id: 2,
      title: "if_深呼吸",
      type: "【星尘原创曲】 / 盯鞋核 / 重型盯鞋",
      desc: "如果在深渊中无法停下坠落，不如尝试最后一次深呼吸。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/35816540671-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/1Zi1/5%25E6%259C%258811%25E6%2597%25A5%288%29.mp4"
    },
    {
      id: 3,
      title: "你会来我的葬礼吗",
      type: "【星尘原创曲】 / 金属核 / 盯鞋",
      desc: "金属核与盯鞋的交织融合，于激烈的节奏中质问内心的归属。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/30601838745-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/KeqS/5%25E6%259C%258811%25E6%2597%25A5%287%29.mp4"
    },
    {
      id: 4,
      title: "PANIC ATTACK",
      type: "【星尘原创】",
      desc: "强烈的情绪如同恐慌发作，冲击着崩坏的现实边界。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/1276391741-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/NKUP/5%25E6%259C%258811%25E6%2597%25A5%283%29.mp4"
    },
    {
      id: 5,
      title: "-- --- - ....",
      type: "【星尘原创曲】",
      desc: "M-O-T-H，如飞蛾扑火般去向未知的迷茫。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/27052740232-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/0n4A/5%25E6%259C%258811%25E6%2597%25A5%285%29.mp4"
    },
    {
      id: 6,
      title: "...只是幻觉",
      type: "feat.星尘infinity / 盯鞋 / 金属核",
      desc: "重重迷雾与声墙之中，究竟什么是真实，什么只是幻觉。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/30471291973-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/9Ac0/5%25E6%259C%258811%25E6%2597%25A5%284%29.mp4"
    },
    {
      id: 7,
      title: "深呼吸",
      type: "【星尘原创】",
      desc: "深呼吸，在一切坠落之前找回自我片刻的宁静。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/1353293988-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/5pHc/5%25E6%259C%258811%25E6%2597%25A5%286%29.mp4"
    },
    {
      id: 8,
      title: "空想话剧",
      type: "【赤羽原创曲】",
      desc: "一出未命名的空想话剧，在荒诞的舞台上默然谢幕。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/324480500-1-208.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/TVhj/5%25E6%259C%258811%25E6%2597%25A5%282%29.mp4"
    },
    {
      id: 9,
      title: "淹没于靛蓝",
      type: "【诗岸原创曲】",
      desc: "任由身躯与意识一起，被这深不见底的靛蓝海水彻底淹没。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/25939019125-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/aN8w/5%25E6%259C%258811%25E6%2597%25A5%281%29.mp4"
    }
  ];

  const handleDoubleClick = (track: any) => {
    setCurrentVideo({
      title: track.title,
      type: track.type,
      desc: track.desc,
      videoUrl: track.videoUrl
    });
    setIsLocked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0d8d0] font-sans relative flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
        <div className="w-full mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-baseline space-x-2"
          >
            <span className="text-2xl font-serif font-bold tracking-tighter text-white">伤口</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">SchazkeLF_p</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex gap-10 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60"
          >
            <a href="#works" onClick={(e) => handleNavClick(e, 'works')} className="hover:text-white border-b border-transparent hover:border-white/40 pb-1 transition-all">WORKS</a>
            <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white border-b border-transparent hover:border-white/40 pb-1 transition-all">ABOUT</a>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section: Full Screen Video */}
      <section className="relative w-full h-screen bg-[#050505] overflow-hidden">
        <motion.div 
          className="absolute inset-0 flex flex-col justify-end pb-16 px-6 md:px-12"
          animate={bounce ? { y: [0, -60, 0] } : { y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Cinematic Background Layer */}
          <div className="absolute inset-0 z-0 pointer-events-auto cursor-pointer" onClick={handleVideoClick}>
          <video 
            ref={videoRef}
            src={currentVideo.videoUrl}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-40 z-10 pointer-events-none mix-blend-screen">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_30%_40%,#4a1c12_0%,transparent_50%),radial-gradient(circle_at_70%_60%,#1a2a3a_0%,transparent_50%)] blur-[80px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-20 pointer-events-none"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-semibold border-l-2 border-white/20 pl-3">
              Featured Work
            </span>
          </div>
          <h1 className="text-6xl md:text-[100px] font-serif leading-[0.85] tracking-tighter text-white mb-6">
            {currentVideo.title}<br/>
            <span className="text-3xl md:text-5xl italic font-light tracking-normal opacity-80">SchazkeLF_p</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed opacity-60 font-light drop-shadow-md">
            {currentVideo.type}<br/>
            {currentVideo.desc}
          </p>
        </motion.div>

          <motion.div 
            className="absolute bottom-12 right-6 md:right-12 pointer-events-none text-white/30 z-20 flex flex-col items-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLocked ? 1 : 0 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <span className="text-[9px] uppercase tracking-[0.5em] opacity-50 font-semibold" style={{ writingMode: 'vertical-rl' }}>
              {isLocked ? (bounce ? "Unlocking..." : "Scroll to Unlock") : ""}
            </span>
            <div className="h-16 w-[1px] bg-gradient-to-b from-white/40 to-transparent relative overflow-hidden">
              {isLocked && <motion.div 
                 animate={{y: [0, 64]}} 
                 transition={{repeat: Infinity, duration: 1.5, ease: "linear"}} 
                 className="absolute top-0 left-0 w-full h-1/2 bg-white/80" 
              />}
            </div>
          </motion.div>

          {/* Volume Control */}
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 h-[40vh] md:h-[50vh] z-50 flex flex-col items-center pointer-events-auto">
            <span className="text-white/60 text-[10px] font-pixel mb-4 select-none w-8 text-center drop-shadow-md">
              {Math.round(volume * 100)}
            </span>
            <div 
              className="relative flex-1 w-6 flex justify-center cursor-pointer group"
              title="Adjust Volume"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                handleVolumeChange(e);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) { // if left mouse button is pressed
                  handleVolumeChange(e);
                }
              }}
            >
              <div className="absolute inset-y-0 w-[2px] bg-white/20 rounded-full group-hover:bg-white/40 transition-colors pointer-events-none">
                <div 
                  className="absolute bottom-0 w-full bg-white rounded-full transition-all duration-75"
                  style={{ height: `${volume * 100}%` }}
                />
              </div>
            </div>
            <span className="text-white/40 text-[8px] font-pixel mt-4 select-none">
              VOL
            </span>
          </div>
        </motion.div>
      </section>

      {/* Discography Section */}
      <section id="works" className="relative z-20 py-32 max-w-full mx-auto w-full px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 w-full">
          {discography.map((item, index) => (
            <div
              key={item.id}
              className="cursor-pointer relative overflow-hidden bg-zinc-900 group aspect-square md:aspect-[4/3] flex items-center justify-center"
              onDoubleClick={() => handleDoubleClick(item)}
            >
              <VideoCover src={item.cover} />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end pointer-events-none z-10">
                <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide drop-shadow-md">{item.title}</h3>
                <p className="text-[10px] uppercase tracking-[0.1em] opacity-80 mt-1 text-white drop-shadow-md">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-20 py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-white/20"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-semibold">Creator</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter mb-12">ABOUT</h2>
            
            <div className="grid md:grid-cols-2 gap-12 text-[#e0d8d0] text-sm leading-relaxed opacity-80 font-light">
               <div>
                  <p className="mb-6">
                    大家好，我是 <strong className="font-semibold text-white">伤口SchazkeLF_p</strong>。<br/><br/>
                    我主要创作 VOCALOID / Synthesizer V 原创音乐，热衷于探索声音的质感，常将重型音乐的失真与盯鞋（Shoegaze）的氛围感结合。
                  </p>
                  <p>
                    每一首歌，都是一次情绪的记录。<br/>
                    星尘的声音赋予了这些器乐以灵魂，希望能在嘈杂的世界里，给你带去一丝共鸣。
                  </p>
               </div>
               
               <div className="space-y-4">
                  <a href="https://space.bilibili.com/630082679?spm_id_from=333.337.0.0" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="w-10 h-10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56v-.004C.556 20.12.036 18.861 0 17.35V9.98c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.054-1.2h.001c-.137-.152-.224-.316-.264-.492a.86.86 0 0 1-.018-.175.76.76 0 0 1 .236-.51c.143-.139.314-.216.513-.23.193-.014.372.031.536.136l2.453 2.753h6.98l2.46-2.766c.15-.105.323-.15.518-.136.196.014.365.1.508.24m-.34 8.287L15.352 10.8a.72.72 0 1 0-1.028 1.018l2.122 2.14a.725.725 0 0 0 1.027-1.018M6.541 12.94a.72.72 0 1 0 1.028-1.017l-2.121-2.14a.725.725 0 0 0-1.028 1.018l2.121 2.14"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-[0.1em] text-xs">Bilibili 个人主页</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-wider mt-1">Follow my latest releases</p>
                    </div>
                  </a>

                  <a href="https://open.spotify.com/intl-es/artist/4T2vBV5CipuF2G8ODSOSxK" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="w-10 h-10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-[0.1em] text-xs">Spotify</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-wider mt-1">Listen on Spotify</p>
                    </div>
                  </a>

                  <a href="https://vocadb.net/Ar/76318" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="w-10 h-10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-[0.1em] text-xs">VocaDB</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-wider mt-1">Vocaloid Database Profile</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="w-10 h-10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-[0.1em] text-xs">联系合作</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-wider mt-1">Contact for business & collabs</p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-30 px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center border-t border-white/5 gap-6">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.2em] font-semibold">
          <a href="https://space.bilibili.com/630082679?spm_id_from=333.337.0.0" target="_blank" rel="noreferrer" className="hover:text-white text-white/50 transition-colors">Bilibili</a>
          <a href="https://open.spotify.com/intl-es/artist/4T2vBV5CipuF2G8ODSOSxK" target="_blank" rel="noreferrer" className="hover:text-white text-white/50 transition-colors">Spotify</a>
          <a href="https://vocadb.net/Ar/76318" target="_blank" rel="noreferrer" className="hover:text-white text-white/50 transition-colors">VocaDB</a>
          <a href="#" className="hover:text-white text-white/50 transition-colors">Weibo</a>
          <a href="#" className="hover:text-white text-white/50 transition-colors">NetEase Music</a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-12 h-[1px] bg-white/20"></div>
          <span className="text-[9px] font-mono opacity-40 tracking-[0.3em]">
            © {new Date().getFullYear()} SCHAZKELF_P STUDIO
          </span>
        </div>
      </footer>
    </div>
  );
}

