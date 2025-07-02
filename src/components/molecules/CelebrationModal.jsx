import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const CelebrationModal = ({ isOpen, onClose, data }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const getCelebrationIcon = (type) => {
    switch (type) {
      case 'milestone':
        return 'Target';
      case 'goal':
        return 'Trophy';
      default:
        return 'Star';
    }
  };

  const getCelebrationColor = (type) => {
    switch (type) {
      case 'milestone':
        return 'text-primary';
      case 'goal':
        return 'text-yellow-400';
      default:
        return 'text-accent';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444']}
            />
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 200 
              }}
              className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-600/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>

              {/* Celebration content */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 celebration-bounce ${getCelebrationColor(data.type)}`}
                >
                  <ApperIcon 
                    name={getCelebrationIcon(data.type)} 
                    size={40} 
                    className="text-white"
                  />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-4 celebration-text"
                >
                  Congratulations! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300 mb-6 text-lg"
                >
                  {data.message}
                </motion.p>

                {data.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-700/50 rounded-lg p-4 mb-6"
                  >
                    <p className="text-white font-medium">"{data.title}"</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={onClose}
                    variant="primary"
                    size="lg"
                    className="min-w-32 celebration-pulse"
                  >
                    Awesome! 🚀
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CelebrationModal;