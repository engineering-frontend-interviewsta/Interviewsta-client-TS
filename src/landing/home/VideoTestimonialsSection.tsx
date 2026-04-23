import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Play } from 'lucide-react';

interface VideoTestimonial {
  id: string;
  name: string;
  college: string;
  videoUrl: string;
}

const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  { id: 'vt-1', name: 'Anish Ranjan Senapati', college: 'IIT Gandhinagar',      videoUrl: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/testimonials/feedback1.mp4' },
  { id: 'vt-2', name: 'Priyanshu Panigrahi',   college: 'ITER, SOA University', videoUrl: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/testimonials/feedback2.mp4' },
  { id: 'vt-3', name: 'Debi Prasad Sahoo',     college: 'NIT Rourkela',         videoUrl: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/testimonials/feedback3.mp4' },
  { id: 'vt-4', name: 'Sahil Saharan',         college: 'IIT Roorkee',          videoUrl: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/testimonials/feedback4.mp4' },
  { id: 'vt-5', name: 'Kalyani Nema',          college: 'IIT Roorkee',          videoUrl: 'https://pub-c5b19f324eec4efc958351cfdbfd6ed3.r2.dev/testimonials/feedback5.mp4' },
];

// ─── Autoplay card (muted, loops, plays when in viewport) ────────────────────
const VideoCard: React.FC<{
  item: VideoTestimonial;
  index: number;
  onOpen: () => void;
}> = ({ item, index, onOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = wrapRef.current;
    if (!v) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (entry.isIntersecting) {
          vid.muted = true;
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      onClick={onOpen}
      className="flex-shrink-0 w-52 flex flex-col group snap-start cursor-pointer"
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group-hover:shadow-xl transition-shadow duration-300"
        style={{ aspectRatio: '9/16' }}
      >
        <video
          ref={videoRef}
          src={item.videoUrl}
          className="w-full h-full object-cover"
          playsInline
          loop
          muted
          preload="auto"
        />

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
            <Play className="h-6 w-6 text-white ml-1" />
          </div>
        </div>

        {/* Bottom gradient + info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <div className="flex gap-0.5 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-white font-bold text-sm leading-tight">{item.name}</p>
          <p className="text-white/70 text-xs mt-0.5">{item.college}</p>
        </div>

        {/* Hover ring */}
        <div className="absolute inset-0 rounded-2xl ring-2 ring-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

// ─── Full-screen modal player ─────────────────────────────────────────────────
const VideoModal: React.FC<{
  item: VideoTestimonial;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});

    // Close on Escape
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col items-center"
          style={{ maxHeight: '90vh' }}
        >
          {/* Video — portrait, max height 85vh */}
          <div
            className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
            style={{ aspectRatio: '9/16', maxHeight: '85vh', width: 'auto' }}
          >
            <video
              ref={videoRef}
              src={item.videoUrl}
              className="h-full w-full object-cover"
              playsInline
              controls
              autoPlay
            />
          </div>

          {/* Name + college below */}
          <div className="mt-4 text-center">
            <p className="text-white font-bold text-base">{item.name}</p>
            <p className="text-white/60 text-sm mt-0.5">{item.college}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────
const VideoTestimonialsSection: React.FC = () => {
  const [modalItem, setModalItem] = useState<VideoTestimonial | null>(null);

  return (
    <section className="bg-[var(--color-surface-alt)] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Student Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3">
            Hear It From Them
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl">
            Real students. Real results. In their own words.
          </p>
        </motion.div>

        {/* Cards row */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {VIDEO_TESTIMONIALS.map((item, index) => (
            <VideoCard
              key={item.id}
              item={item}
              index={index}
              onOpen={() => setModalItem(item)}
            />
          ))}
        </div>

      </div>

      {/* Modal */}
      {modalItem && (
        <VideoModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </section>
  );
};

export default VideoTestimonialsSection;
