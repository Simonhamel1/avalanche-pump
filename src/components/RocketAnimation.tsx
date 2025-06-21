import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Rocket, Star, Sparkles } from 'lucide-react';

interface RocketAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  tokenName: string;
  tokenSymbol: string;
}

const RocketAnimation: React.FC<RocketAnimationProps> = ({
  isVisible,
  onComplete,
  tokenName,
  tokenSymbol
}) => {
  const [animationPhase, setAnimationPhase] = useState<'countdown' | 'launch' | 'success'>('countdown');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('countdown');
      setCountdown(3);
      
      // Countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setAnimationPhase('launch');
            
            // Launch phase
            setTimeout(() => {
              setAnimationPhase('success');
              
              // Close after celebration
              setTimeout(() => {
                onComplete();
              }, 3000);
            }, 2000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 to-black border-avalanche-red border-2 text-white overflow-hidden">
        <div className="relative h-96 flex flex-col items-center justify-center">
          {/* Background stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                className={`absolute text-yellow-300 animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: `${Math.random() * 8 + 8}px`
                }}
              />
            ))}
          </div>

          {animationPhase === 'countdown' && (
            <div className="text-center">
              <h2 className="text-3xl font-black text-avalanche-red mb-8">
                🚀 LAUNCHING {tokenSymbol}
              </h2>
              <div className="text-8xl font-black text-white mb-4 animate-pulse">
                {countdown}
              </div>
              <p className="text-xl text-gray-300">Get ready for liftoff!</p>
            </div>
          )}

          {animationPhase === 'launch' && (
            <div className="text-center relative">
              <div className="rocket-container animate-rocket-launch">
                <Rocket className="w-24 h-24 text-avalanche-red transform rotate-45" />
                <div className="rocket-fire">
                  <div className="fire-particle"></div>
                  <div className="fire-particle"></div>
                  <div className="fire-particle"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mt-8 animate-bounce">
                {tokenName} IS LAUNCHING! 🚀
              </h2>
            </div>
          )}

          {animationPhase === 'success' && (
            <div className="text-center">
              <div className="success-celebration">
                <Sparkles className="w-32 h-32 text-yellow-400 animate-spin mx-auto mb-4" />
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-avalanche-red to-yellow-400 mb-4">
                  🎉 SUCCESS! 🎉
                </h1>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {tokenName} ({tokenSymbol})
                </h2>
                <p className="text-lg text-green-400 font-bold">
                  ✅ Token created successfully!
                </p>
                <p className="text-sm text-gray-300 mt-4">
                  Your token is now live on Avalanche! 🌟
                </p>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes rocket-launch {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-100px) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: translateY(-300px) scale(1.3);
              opacity: 0;
            }
          }

          .animate-rocket-launch {
            animation: rocket-launch 2s ease-out forwards;
          }

          .rocket-container {
            position: relative;
          }

          .rocket-fire {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
          }

          .fire-particle {
            width: 4px;
            height: 20px;
            background: linear-gradient(to bottom, #ff6b35, #f7931e, #ffd700);
            position: absolute;
            border-radius: 2px;
            animation: fire-flicker 0.3s infinite alternate;
          }

          .fire-particle:nth-child(1) {
            left: -8px;
            animation-delay: 0s;
          }

          .fire-particle:nth-child(2) {
            left: 0px;
            height: 25px;
            animation-delay: 0.1s;
          }

          .fire-particle:nth-child(3) {
            left: 8px;
            animation-delay: 0.2s;
          }

          @keyframes fire-flicker {
            0% {
              transform: scaleY(1) scaleX(1);
              opacity: 1;
            }
            100% {
              transform: scaleY(1.2) scaleX(0.8);
              opacity: 0.8;
            }
          }

          .success-celebration {
            animation: celebration-bounce 0.6s ease-out;
          }

          @keyframes celebration-bounce {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default RocketAnimation;
