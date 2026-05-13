import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Music, Play, ExternalLink, Mail, Disc } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';

const CustomCursor = ({ audioIntensityRef }: { audioIntensityRef: React.RefObject<number> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCircleRef = useRef<HTMLDivElement>(null);
  const particles = useRef<any[]>([]);
  const trail = useRef<{x: number, y: number}[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const lastMoveTime = useRef(Date.now());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      lastMoveTime.current = Date.now();
      setIsIdle(false);

      // Mouse trail persistence
      trail.current.unshift({ x: e.clientX, y: e.clientY });
      if (trail.current.length > 20) {
        trail.current.pop();
      }

      // Manual DOM styling for position
      if (cursorCircleRef.current) {
        const size = isHovering ? 44 : 32;
        cursorCircleRef.current.style.transform = `translate3d(${e.clientX - size/2}px, ${e.clientY - size/2}px, 0)`;
      }

      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, .group, [role="button"]');
      if (!!isInteractive !== isHovering) {
        setIsHovering(!!isInteractive);
      }
    };

    const idleCheck = setInterval(() => {
      if (Date.now() - lastMoveTime.current > 2000) {
        setIsIdle(true);
      }
    }, 100);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(idleCheck);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const intensity = audioIntensityRef.current || 0;

      if (!isIdle) {
        const speed = intensity > 0.4 ? 6 : 2;
        const count = Math.min(Math.floor(intensity * 8) + 1, 4);
        const shapes = ['circle', 'square', 'star', 'pentagon', 'irregular'];

        if (particles.current.length < 150) {
          for (let i = 0; i < count; i++) {
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = Math.random() * 4 + 2 + (intensity * 12);
            
            let irregularPoints = [];
            if (shape === 'irregular') {
              const pointsCount = 4 + Math.floor(Math.random() * 3);
              for(let j=0; j<pointsCount; j++) {
                irregularPoints.push({
                  x: (Math.random() - 0.5) * size * 2,
                  y: (Math.random() - 0.5) * size * 2
                });
              }
            }

            particles.current.push({
              x: mousePos.current.x,
              y: mousePos.current.y,
              vx: (Math.random() - 0.5) * speed * 0.5, // Reduced speed
              vy: (Math.random() - 0.5) * speed * 0.5, // Reduced speed
              life: 1.0,
              size,
              shape,
              irregularPoints
            });
          }
        }
      }

      // Manual DOM styling for scale beat
      if (cursorCircleRef.current) {
        const scale = isIdle ? 0 : (1 + intensity * 1.8);
        const opacity = isIdle ? 0 : 0.8;
        cursorCircleRef.current.style.opacity = String(opacity);
        const innerCircle = cursorCircleRef.current.querySelector('.cursor-inner') as HTMLElement;
        if (innerCircle) {
           innerCircle.style.transform = `scale(${scale})`;
        }
      }

      // Update and draw particles
      ctx.fillStyle = '#ffffff';
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01; // Slower decay

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life * (isIdle ? 0.3 : 1) * 0.8;
        
        ctx.beginPath();
        const s = p.size * p.life;
        
        if (p.shape === 'circle') {
          ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        } else if (p.shape === 'square') {
          ctx.rect(p.x - s, p.y - s, s * 2, s * 2);
        } else if (p.shape === 'star') {
          let spikes = 5;
          let outerRadius = s;
          let innerRadius = s / 2;
          let rot = Math.PI / 2 * 3;
          let cx = p.x;
          let cy = p.y;
          let step = Math.PI / spikes;
          ctx.moveTo(p.x, p.y - outerRadius);
          for (let k = 0; k < spikes; k++) {
            cx = p.x + Math.cos(rot) * outerRadius;
            cy = p.y + Math.sin(rot) * outerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
            cx = p.x + Math.cos(rot) * innerRadius;
            cy = p.y + Math.sin(rot) * innerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
          }
          ctx.closePath();
        } else if (p.shape === 'pentagon') {
          const sides = 5;
          const step = (Math.PI * 2) / sides;
          const startAngle = -Math.PI / 2;
          for (let k = 0; k < sides; k++) {
            const px = p.x + Math.cos(startAngle + step * k) * s;
            const py = p.y + Math.sin(startAngle + step * k) * s;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else if (p.shape === 'irregular') {
          p.irregularPoints.forEach((pt: any, idx: number) => {
            const ix = p.x + pt.x * p.life;
            const iy = p.y + pt.y * p.life;
            if (idx === 0) ctx.moveTo(ix, iy);
            else ctx.lineTo(ix, iy);
          });
          ctx.closePath();
        }
        ctx.fill();
      }

      // Draw Mouse Trail
      if (trail.current.length > 2) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + intensity * 0.3})`;
        ctx.lineWidth = 1 + intensity * 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(trail.current[0].x, trail.current[0].y);
        for(let i=1; i < trail.current.length; i++) {
          ctx.lineTo(trail.current[i].x, trail.current[i].y);
        }
        ctx.stroke();
      }

      requestAnimationFrame(render);
    };

    const animReq = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animReq);
    };
  }, [isIdle]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[100] mix-blend-difference"
      />
      <div
        ref={cursorCircleRef}
        className="fixed top-0 left-0 border border-white rounded-full pointer-events-none z-[101] mix-blend-difference flex items-center justify-center overflow-hidden transition-[width,height,background-color,border-width] duration-300 ease-out"
        style={{
          width: isHovering ? 44 : 32,
          height: isHovering ? 44 : 32,
          borderWidth: isHovering ? 22 : 1,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)",
          willChange: 'transform, opacity'
        }}
      >
        <div 
          className="cursor-inner w-full h-full flex items-center justify-center" 
          style={{ willChange: 'transform' }}
        >
          {!isHovering && (
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80" />
          )}
        </div>
      </div>
    </>
  );
};

const VideoCover = ({ src, hasInteracted }: { src: string; hasInteracted: boolean }) => {
  const [inView, setInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { rootMargin: '100px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView && hasInteracted && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [inView, hasInteracted]);

  return (
    <div ref={ref} className="absolute inset-0 z-0 w-full h-full bg-[#0a0a0a] transition-colors duration-500 flex items-center justify-center">
      {!isLoaded && <Disc className="w-8 h-8 text-white/5 animate-spin-slow" />}
      {inView && hasInteracted && (
        <video 
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 pointer-events-none ${
            isLoaded ? 'opacity-40 group-hover:opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

const AudioVisualizer = ({ intensityRef }: { intensityRef: React.RefObject<number> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const speakers = [
      { x: 0.15, y: 0.5, size: 100 },
      { x: 0.85, y: 0.5, size: 100 },
    ];

    const draw = () => {
      // Smoother motion blur effect
      ctx.fillStyle = 'rgba(8, 8, 8, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const intensity = intensityRef.current || 0;
      const time = Date.now() / 1000;

      // Dynamic scaling of the coordinate system based on pulse
      const globalScale = 1 + intensity * 0.05;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(globalScale, globalScale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Camera shake on high intensity
      if (intensity > 0.7) {
        const shake = (intensity - 0.7) * 20;
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }

      // Shifting color theme
      const hue = 210 + Math.sin(time * 0.3) * 30; // Blue to Indigo range
      const glowOpacity = 0.04 + intensity * 0.1;

      // Central glowing orb
      const orbGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 400 * (1 + intensity)
      );
      orbGradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${glowOpacity})`);
      orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orbGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Central Rhythm Line
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 100%, 100%, ${0.1 + intensity * 0.3})`;
      ctx.lineWidth = 1 + intensity * 2;
      for(let x=0; x<canvas.width; x+=10) {
        const distFromCenter = Math.abs(x - canvas.width/2);
        const falloff = Math.exp(-distFromCenter / 300);
        const wave = Math.sin(x * 0.02 - time * 10) * (intensity * 60 * falloff);
        if(x===0) ctx.moveTo(x, canvas.height/2 + wave);
        else ctx.lineTo(x, canvas.height/2 + wave);
      }
      ctx.stroke();

      speakers.forEach((s, idx) => {
        const cx = s.x * canvas.width;
        const cy = s.y * canvas.height;
        const baseRadius = s.size;
        // Pulse logic: more aggressive on intensities (simulating beat detection)
        const pulse = 1 + Math.pow(intensity, 2) * 0.8;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.1 * (idx % 2 === 0 ? 1 : -1));

        // Speaker box with glowing edges (thinner lines)
        ctx.shadowBlur = 5 * intensity;
        ctx.shadowColor = `hsla(${hue}, 100%, 100%, 0.5)`;
        ctx.strokeStyle = `hsla(${hue}, 100%, 100%, ${0.2 + intensity * 0.3})`;
        ctx.lineWidth = 1 + intensity * 1.5;
        ctx.strokeRect(-baseRadius * 1.2, -baseRadius * 1.5, baseRadius * 2.4, baseRadius * 3);
        ctx.shadowBlur = 0;

        // Reactive drivers
        for (let i = 0; i < 3; i++) {
           const r = baseRadius * (0.4 + i * 0.3) * pulse;
           ctx.beginPath();
           ctx.arc(0, 0, r, 0, Math.PI * 2);
           ctx.stroke();
           
           if (intensity > 0.5) {
             ctx.save();
             ctx.rotate(time * 3 + i);
             ctx.beginPath();
             ctx.moveTo(r, 0);
             ctx.lineTo(r + 20 * intensity, 0);
             ctx.stroke();
             ctx.restore();
           }
        }
        ctx.restore();
      });

      // Digital Glitch Effect
      if (canvas.width > 0 && canvas.height > 0 && (intensity > 0.6 || Math.random() > 0.97)) {
        const glitchLayers = intensity > 0.8 ? 4 : 2;
        ctx.save();
        for(let j=0; j < glitchLayers; j++) {
          const sliceH = Math.random() * 100 + 10;
          const sliceY = Math.random() * (canvas.height - sliceH);
          if (sliceH <= 0 || sliceY < 0) continue;
          
          const hOffset = (Math.random() - 0.5) * 120 * intensity;
          
          ctx.save();
          ctx.translate(hOffset, 0);
          ctx.globalAlpha = 0.3 + Math.random() * 0.5;
          
          // RGB Split / Color Malfunction
          if (Math.random() > 0.4) {
             const colors = ['hue-rotate(90deg)', 'hue-rotate(180deg)', 'hue-rotate(270deg)', 'invert(100%)', 'brightness(2)'];
             ctx.filter = colors[Math.floor(Math.random() * colors.length)];
          }

          ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, 0, sliceY, canvas.width, sliceH);
          ctx.restore();

          // Blocky digital artifacts
          if (Math.random() > 0.7) {
            ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${0.15 * intensity})`;
            ctx.fillRect(Math.random() * canvas.width, sliceY, Math.random() * 200, sliceH * 0.2);
          }
        }
        ctx.restore();

        // Horizontal flickering scanlines
        for(let i=0; i<3; i++) {
          if (Math.random() > 0.6) {
            const scanY = Math.random() * canvas.height;
            ctx.fillStyle = `hsla(${hue}, 100%, 100%, ${0.2 * intensity})`;
            ctx.fillRect(0, scanY, canvas.width, 1);
          }
        }
      }

      ctx.restore();
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />;
};

const LyricsSection = ({ track, intensityRef }: { track: any; intensityRef: React.RefObject<number> }) => {
  return (
    <section className="relative w-full py-40 overflow-hidden bg-[#080808] border-y border-white/5 flex flex-col items-center justify-center min-h-[60vh]">
      <AudioVisualizer intensityRef={intensityRef} />
      
      <div className="relative z-10 max-w-4xl w-full px-6 text-center space-y-12">
        <motion.div
           key={track.title}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1 }}
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-2 block">Now Playing</span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight">{track.title}</h2>
        </motion.div>

        <div className="space-y-6">
          {track.lyrics ? (
            track.lyrics.map((line: string, i: number) => (
              <motion.p
                key={`${track.title}-${i}`}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                viewport={{ margin: "-10%" }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="text-lg md:text-2xl font-light text-white/30 tracking-wider hover:text-white transition-colors cursor-default"
              >
                {line}
              </motion.p>
            ))
          ) : (
            <p className="text-white/20 italic">Lyrics loading...</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
        <Disc className="w-12 h-12 animate-spin-slow text-white" />
      </div>
    </section>
  );
};

export default function App() {
  const [volume, setVolume] = useState(0.1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [bounce, setBounce] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioIntensity, setAudioIntensity] = useState(0);
  const audioIntensityRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [currentVideo, setCurrentVideo] = useState({
    title: "温差",
    type: "【星尘原创曲】 / 重型盯鞋",
    desc: "在极度的喧嚣中寻找宁静，于温差之间感受情绪的撕裂与弥合。",
    videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/28553447526-1-192.mp4",
    lyrics: [
      "擦干眼泪吧 我们一起出发吧",
      "拥抱着遗憾 逃向外太空",
      "牵着我",
      "与你一起似乎能无视引力",
      "依存在彼此间",
      "能否暂停时间",
      "不需要害怕",
      "闭上眼",
      "用双手触摸的虚幻",
      "漂浮在陌生的维度",
      "感受着彼此间温差",
      "我一直在寻找 你化作星光之后的信号",
      "带上我 凝固在时间之外吧",
      "Now will you hold me tight",
      "Now kiss me one last time"
    ]
  });
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
  }, [volume, currentVideo]);

  useEffect(() => {
    const initAudio = () => {
      if (!videoRef.current || audioContextRef.current) return;

      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(videoRef.current);

      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Focus on low frequencies (bass/kicks) for the "beat"
        let sum = 0;
        const bassCount = 10; // First 10 bins are low freq
        for (let i = 0; i < bassCount; i++) {
          sum += dataArray[i];
        }
        const intensity = sum / (bassCount * 255);
        audioIntensityRef.current = intensity;
        
        // Update state less frequently for general UI, but use Ref for high-performance canvas
        if (Math.random() > 0.8) {
          setAudioIntensity(intensity);
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    };

    const handleStart = () => {
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(console.error);
        }
        return;
      }
      initAudio();
    };

    const handleFirstInteraction = () => {
      setHasInteracted(true);
      if (videoRef.current) {
        // Essential for iOS: play must be triggered directly in event
        videoRef.current.muted = false;
        videoRef.current.volume = volume;
        videoRef.current.play().catch((err) => {
          console.log("Play failed on interaction, trying muted:", err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(console.error);
          }
        });
        setIsPlaying(true);
      }
      
      handleStart();
      
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [volume]);

  useEffect(() => {
    const attemptPlay = async () => {
      if (!videoRef.current) return;
      
      try {
        // If we haven't interacted yet, we MUST stay muted for autoplay to work
        if (!hasInteracted) {
          videoRef.current.muted = true;
          await videoRef.current.play();
          setIsPlaying(true);
        } else {
          // If interacted, try to play unmuted
          videoRef.current.muted = false;
          videoRef.current.volume = volume;
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log("Autoplay attempt failed:", error);
        // Fallback to muted if unmuted failed
        if (videoRef.current && !videoRef.current.muted) {
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
            setIsPlaying(true);
          } catch (e) {
            setIsPlaying(false);
          }
        }
      }
    };
    
    // Tiny delay to ensure DOM is ready
    const timer = setTimeout(attemptPlay, 100);
    return () => clearTimeout(timer);
  }, [currentVideo, hasInteracted, volume]);

  const handleVideoClick = () => {
    setHasInteracted(true);
    if (videoRef.current) {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
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

  const discography = [
    {
      id: 1,
      title: "温差",
      type: "【星尘原创曲】 / 重型盯鞋",
      desc: "在极度的喧嚣中寻找宁静，于温差之间感受情绪的撕裂与弥合。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/28553447526-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/4d9W/5%25E6%259C%258811%25E6%2597%25A5.mp4",
      lyrics: [
        "擦干眼泪吧 我们一起出发吧",
        "拥抱着遗憾 逃向外太空",
        "牵着我",
        "与你一起似乎能无视引力",
        "依存在彼此间",
        "能否暂停时间",
        "不需要害怕",
        "闭上眼",
        "用双手触摸的虚幻",
        "漂浮在陌生的维度",
        "感受着彼此间温差",
        "我一直在寻找 你化作星光之后的信号",
        "带上我 凝固在时间之外吧",
        "Now will you hold me tight",
        "Now kiss me one last time"
      ]
    },
    {
      id: 2,
      title: "if_深呼吸",
      type: "【星尘原创曲】 / 盯鞋核 / 重型盯鞋",
      desc: "如果在深渊中无法停下坠落，不如尝试最后一次深呼吸。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/35816540671-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/1Zi1/5%25E6%259C%258811%25E6%2597%25A5%288%29.mp4",
      lyrics: [
        "松开手的一瞬间",
        "你渐行渐远 害怕着改变",
        "若忘记自我的话",
        "无论多少次",
        "我都会为你歌唱",
        "无数次地回忆着",
        "每一个无法 入睡的夜晚",
        "忘不掉伤痕的话",
        "就该吞下吗",
        "他们说这就是长大",
        "失去指针的钟仍会转动却不自知",
        "I DON’T BELONG HERE",
        "我交出我的声音 生命",
        "所有热爱遗憾",
        "每个承诺虚幻脆弱期待",
        "只想告诉你",
        "难过的话",
        "只需要深呼吸",
        "带着微笑",
        "哭出来吧",
        "Stand by my side",
        "WHEREVER YOU ARE",
        "I’LL ALWAYS BE BY YOUR SIDE",
        "EVERY TIME YOU CRY",
        "I’LL ALWAYS BE BY YOUR SIDE",
        "JUST BREATHE IN BREATHE OUT",
        "I’LL ALWAYS BE BY YOUR SIDE",
        "REMAIN AS YOU ARE",
        "I’LL ALWAYS BE BY YOUR SIDE"
      ]
    },
    {
      id: 3,
      title: "你会来我的葬礼吗",
      type: "【星尘原创曲】 / 金属核 / 盯鞋",
      desc: "金属核与盯鞋的交织融合，于激烈的节奏中质问内心的归属。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/30601838745-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/TVhj/5%25E6%259C%258811%25E6%2597%25A5%282%29.mp4",
      lyrics: [
        "长眠后的世界",
        "我从未感到如此温暖",
        "此刻我只剩下一个愿望",
        "再一次 用手心包裹着我",
        "绽放 溃烂",
        "悄悄闭上眼",
        "指尖传来温柔的触感",
        "与你的声音",
        "融为一体",
        "有什么 仍藏在你的倒影下",
        "是幻觉",
        "也许是死亡讲的冷笑话",
        "欢笑吧",
        "欢笑吧",
        "我的一切",
        "（我的一切）",
        "在我眼前",
        "（慢动作中）",
        "逐渐毁灭",
        "或是错觉",
        "没有悲伤与害怕",
        "留下再见与晚安",
        "享受这迷人致命温柔幻象",
        "刺入我心脏",
        "只是错觉我期望",
        "感谢药物和噩梦交织的癫狂",
        "Just a phantom",
        "Loathed and feared",
        "sit back and",
        "Watch me dance",
        "God",
        "Watch me shatter into dust",
        "Fill me up with your white lies",
        "Wake up",
        "泥土的芳香",
        "在宁静中灌入我的鼻腔",
        "你曾告诉我每个故事",
        "因有结局",
        "才让一切变得有意义",
        "可是我",
        "仍害怕某天被你所遗忘",
        "答应我",
        "答应我",
        "（或是错觉）",
        "没有悲伤与害怕",
        "留下再见与晚安",
        "享受这迷人致命温柔幻象",
        "刺入我心脏",
        "只是错觉我期望",
        "感谢药物和噩梦交织的癫狂",
        "Just a phantom",
        "Loathed and feared",
        "sit back and",
        "Watch me bleed",
        "God",
        "I never felt so alive",
        "But I just can't evade",
        "You have become my shades",
        "As ghost reflects the shape of you",
        "Shattered mind",
        "Out of sight"
      ]
    },
    {
      id: 4,
      title: "PANIC ATTACK",
      type: "【星尘原创】",
      desc: "强烈的情绪如同恐慌发作，冲击着崩坏的现实边界。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/1276391741-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/NKUP/5%25E6%259C%258811%25E6%2597%25A5%283%29.mp4",
      lyrics: [
        "睁开眼 重复的一天",
        "挣扎着重启 任由泪水滑落",
        "努力说出无所谓的话",
        "那不是我的声音",
        "Every words you said had turned me upside down",
        "(I DON'T BELONG HERE)",
        "I don't wanna be a shell of your existence",
        "Voices in my head keep taking my mind",
        "I can't get it out I can't get it out of",
        "Maybe I'm already drowning inside",
        "Everything I see is turning into pieces",
        "I just want to feel okay guess I never will",
        "Look into my eyes can you feel my pain",
        "I can't stand this anymore",
        "(I DON'T BELONG HERE)",
        "(闭嘴）",
        "(I DON'T BELONG HERE)",
        "（闭嘴）",
        "(I DON'T BELONG HERE)",
        "Everything I see is turning into pieces",
        "I just want to feel okay guess I never will",
        "I don't wanna be a shell of your existence",
        "Voices in my head keep taking my mind",
        "I can't get it out I can't get it out of",
        "Maybe I'm already drowning inside",
        "Everything I see is turning into pieces",
        "I just want to feel okay guess I never will",
        "Look into my eyes can you feel my pain",
        "I can't stand this anymore",
        "(欢迎光临，请问有什么可以帮到你？）",
        "（不知道）",
        "*PANIC ATTACK*",
        "（不用了谢谢）"
      ]
    },
    {
      id: 5,
      title: "-- --- - ....",
      type: "【星尘原创曲】",
      desc: "M-O-T-H，如飞蛾扑火般去向未知的迷茫。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/27052740232-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/0n4A/5%25E6%259C%258811%25E6%2597%25A5%285%29.mp4",
      lyrics: [
        "Floating high",
        "Like a moth into the flame",
        "I whispered",
        "I drowned myself in doubt",
        "肆意起舞在雨中癫狂",
        "将寒冷灌进我的心脏",
        "强忍着自己不去害怕",
        "可是这一切这世界是如此疯狂",
        "我感受不到太阳的热量",
        "包裹着我在温暖中窒息",
        "泪水映出季节的幻灭",
        "你我视线交错的终点",
        "是全新的世界",
        "所有痛苦挣扎与遗憾",
        "此刻都成为我的躯壳",
        "来与我共舞吧",
        "Floating high",
        "Like a moth into the flame",
        "Like a moth into the flame",
        "泪水映出季节的幻灭",
        "你我视线交错的终点",
        "是全新的世界",
        "所有痛苦挣扎与遗憾",
        "此刻都成为我的躯壳",
        "邀请我共舞吧",
        "Floating high",
        "Like a moth into the flame",
        "Like a moth into the flame"
      ]
    },
    {
      id: 6,
      title: "...只是幻觉",
      type: "feat.星尘infinity / 盯鞋 / 金属核",
      desc: "重重迷雾与声墙之中，究竟什么是真实，什么只是幻觉。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/30471291973-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/9Ac0/5%25E6%259C%258811%25E6%2597%25A5%284%29.mp4",
      lyrics: [
        "作词: 伤口SchazkeLF_p",
        "作曲: 伤口SchazkeLF_p",
        "编曲: 伤口SchazkeLF_p",
        "与你的声音融为一体",
        "有什么仍藏在你的倒影下",
        "绽放",
        "分不清",
        "游离于梦境",
        "被遗忘",
        "或是错觉",
        "听不清",
        "遥远的哭泣",
        "闭上眼",
        "是谁的终点",
        "...wake up",
        "温暖的手心包裹我",
        "指尖传来熟悉的触感",
        "终于听清你的声音",
        "谢谢你一直保护我",
        "成为我倒影中的幽灵",
        "我不会再让你担心",
        "此刻起我的每个瞬间",
        "都成为你的永远",
        "我会带着你生命的重量",
        "继续活下去",
        "与你的声音融为一体",
        "有什么仍藏在你的倒影下"
      ]
    },
    {
      id: 7,
      title: "深呼吸",
      type: "【星尘原创】",
      desc: "深呼吸，在一切坠落之前找回自我片刻的宁静。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/1353293988-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/5pHc/5%25E6%259C%258811%25E6%2597%25A5%286%29.mp4",
      lyrics: [
        "松开手的一瞬间",
        "你渐行渐远",
        "害怕着改变",
        "若忘记自我的话",
        "无论多少次",
        "我都会为你歌唱",
        "无数次地回忆着",
        "每一个无法入睡的夜晚",
        "忘不掉伤痕的话",
        "就该吞下吗",
        "他们说这就是长大",
        "失去指针的钟仍会转动却不自知",
        "（I don't belong here)",
        "我交出我的",
        "声音 生命",
        "所有热爱 遗憾",
        "每个承诺 虚幻",
        "脆弱期待",
        "只想告诉你",
        "难过的话",
        "只需要深呼吸",
        "带着微笑",
        "哭出来吧",
        "（Stand by my side）",
        "重复相同的童话",
        "用谎言编写",
        "将自我丢下",
        "其实我早已发现",
        "内心的幽灵",
        "已经厌倦那样的话",
        "（接下来的一分钟）",
        "（丢掉你的所有借口）",
        "（Just close your eyes)",
        "And STAY WITH ME",
        "Wherever you are",
        "I'll always be by your side",
        "Everytime you cry",
        "I'll always be by your side",
        "Just breathe in breathe out",
        "I'll always be by your side",
        "Remain as you are",
        "I'll always be by your side"
      ]
    },
    {
      id: 8,
      title: "空想话剧",
      type: "【赤羽原创曲】",
      desc: "一出未命名的空想话剧，在荒诞的舞台上默然谢幕。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/324480500-1-208.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/KeqS/5%25E6%259C%258811%25E6%2597%25A5%287%29.mp4",
      lyrics: [
        "四季更改 迷墙 仍在",
        "点燃仇恨 控制的时代",
        "造物主将 记忆 掩盖",
        "信徒撕开灰色面具",
        "却早已落入空想话剧",
        "光环消去",
        "虚假的正义将憧憬都粉碎",
        "请告诉我",
        "在黑夜中",
        "那毁灭的声音 响彻天际",
        "燃烧过后 失去定义",
        "被泪水打湿的心灵",
        "终会再次绽放 穿透幻象",
        "怒火化作 黑色乐章",
        "凝结而成 这毁灭的力量",
        "四季更改 围城 迭代",
        "流放之外 空想的时代",
        "演员离去 笑声继续",
        "资本将那肮脏王冠从尸体上扯下",
        "昔日的盾却化作文化的杀手",
        "娱乐至死 垃圾至上",
        "是病变的轨迹 褪色的心",
        "背向而行 愚昧至今",
        "带上我超载的身体",
        "将这幻象点燃 渗出的光",
        "穿过黑暗 化作方向",
        "舞台落下 嘲笑回响",
        "四季变迁万物回归混乱",
        "人性消去在利益中循环",
        "小时候那颗憧憬的心如今消失殆尽",
        "能否听清",
        "那毁灭的声音 响彻天际",
        "燃烧过后 失去定义",
        "被泪水打湿的心灵",
        "终会再次绽放 穿透幻象",
        "怒火化作 黑色乐章",
        "凝结而成 这毁灭的力量"
      ]
    },
    {
      id: 9,
      title: "淹没于靛蓝",
      type: "【诗岸原创曲】",
      desc: "任由身躯与意识一起，被这深不见底的靛蓝海水彻底淹没。",
      videoUrl: "https://uv52w2dqsyqwbfke.public.blob.vercel-storage.com/25939019125-1-192.mp4",
      cover: "https://videos.tuchuangyun.top/autoupload/en/H-VgkTBe2zwM0UYoCV-zjY0_ynLCSh1voT__6wvSSSY/20260511/aN8w/5%25E6%259C%258811%25E6%2597%25A5%281%29.mp4",
      lyrics: [
        "时间",
        "空间",
        "漫步在无人的星球",
        "随波逐流的原地踏步",
        "无聊至极的自我厌恶",
        "你找到了吗",
        "关于自己的答案",
        "想说的话",
        "总是在为时已晚之后落下",
        "用力挣扎仍无法掩盖害怕",
        "告诉我",
        "想要知道人类心间的温差",
        "融化",
        "抱着我",
        "淹没在这毁灭的声压",
        "见证吧",
        "如此耀眼的死亡"
      ]
    }
  ];

  const handleDoubleClick = (track: any) => {
    setCurrentVideo({
      title: track.title,
      type: track.type,
      desc: track.desc,
      videoUrl: track.videoUrl,
      lyrics: track.lyrics
    });
    setIsLocked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0d8d0] font-sans relative flex flex-col overflow-x-hidden cursor-none">
      <CustomCursor audioIntensityRef={audioIntensityRef} />
      
      {/* Interaction Hint Overlay */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.8, ease: "easeOut" } }}
            onClick={() => {
              // This acts as the primary user gesture for mobile
              setHasInteracted(true);
            }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer bg-black/40 backdrop-blur-[4px] pointer-events-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
              <Play className="w-64 h-64 text-white/10 fill-white/5" strokeWidth={0.2} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="mt-16 text-white/30 text-[12px] uppercase tracking-[2em] font-light text-center"
            >
              Touch to Begin
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="absolute inset-0 z-0 pointer-events-auto cursor-pointer flex items-center justify-center" onClick={handleVideoClick}>
        <video 
          ref={videoRef}
          src={currentVideo.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          preload="auto"
          className="w-full h-full object-cover"
        />
        
        {/* Mobile Play Button Fallback */}
        {!isPlaying && hasInteracted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-30 p-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
          >
            <Play className="w-12 h-12 text-white fill-white" />
          </motion.div>
        )}
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
              className="cursor-pointer relative overflow-hidden bg-zinc-900 group aspect-square md:aspect-[4/3] flex items-center justify-center transition-all duration-500"
              onDoubleClick={() => handleDoubleClick(item)}
            >
              <VideoCover src={item.cover} hasInteracted={hasInteracted} />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end pointer-events-none z-10 text-left">
                <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide drop-shadow-md">{item.title}</h3>
                <p className="text-[10px] uppercase tracking-[0.1em] opacity-80 mt-1 text-white drop-shadow-md">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lyrics Interface Section */}
      <LyricsSection track={currentVideo} intensityRef={audioIntensityRef} />

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

