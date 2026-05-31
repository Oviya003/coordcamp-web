import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-cc-offwhite flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <img 
          src="/logo.png" 
          alt="CoordCamp Logo" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 drop-shadow-lg"
        />
        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-cc-maroon tracking-tight mb-3">
          CoordCamp
        </h1>
        <p className="text-cc-gold font-sans font-semibold text-sm md:text-base tracking-wider uppercase">
          Campus Events, Attendance & Credits Simplified
        </p>
      </motion.div>
    </div>
  );
}
