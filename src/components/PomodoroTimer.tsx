import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'

interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  sessionCount: number;
}

const PomodoroTimer: React.FC = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isActive: false,
    isBreak: false,
    sessionCount: 0
  });
  
  const intervalRef = useRef<number | null>(null);

  // Timer constants
  const WORK_TIME = 25 * 60; // 25 minutes in seconds
  const BREAK_TIME = 5 * 60; // 5 minutes in seconds

  useEffect(() => {
    if (timer.isActive) {
      intervalRef.current = setInterval(() => {
        setTimer(prevTimer => {
          const totalSeconds = prevTimer.minutes * 60 + prevTimer.seconds;
          
          if (totalSeconds <= 1) {
            // Timer finished
            playNotification();
            
            if (prevTimer.isBreak) {
              // Break finished, start work session
              return {
                ...prevTimer,
                minutes: 25,
                seconds: 0,
                isActive: false,
                isBreak: false
              };
            } else {
              // Work session finished, start break
              const newSessionCount = prevTimer.sessionCount + 1;
              const isLongBreak = newSessionCount % 4 === 0;
              const breakMinutes = isLongBreak ? 15 : 5;
              
              return {
                ...prevTimer,
                minutes: breakMinutes,
                seconds: 0,
                isActive: false,
                isBreak: true,
                sessionCount: newSessionCount
              };
            }
          } else {
            // Continue countdown
            const newTotalSeconds = totalSeconds - 1;
            return {
              ...prevTimer,
              minutes: Math.floor(newTotalSeconds / 60),
              seconds: newTotalSeconds % 60
            };
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive]);

  const playNotification = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported');
    }
  };

  const startTimer = () => {
    setTimer(prev => ({ ...prev, isActive: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isActive: false }));
  };

  const resetTimer = () => {
    setTimer({
      minutes: 25,
      seconds: 0,
      isActive: false,
      isBreak: false,
      sessionCount: 0
    });
  };

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 bg-transparent border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            ‚Ü?Back to Notes
          </Button>
          <Button
            onClick={() => window.close()}
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            √ó
          </Button>
        </CardHeader>
      </Card>

      {/* Main Timer Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center p-8">
          <CardContent className="space-y-8">
            {/* Tomato Icon */}
            <div className="text-6xl">
              üçÖ
            </div>

            {/* Timer Display */}
            <div className="text-white text-8xl font-light tracking-wider">
              {formatTime(timer.minutes, timer.seconds)}
            </div>

            {/* Session Info */}
            <div className="flex flex-col items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-lg px-4 py-2">
                {timer.isBreak ? (
                  timer.sessionCount % 4 === 0 ? 'Long Break' : 'Break Time'
                ) : (
                  'Focus Time'
                )}
              </Badge>
              {timer.sessionCount > 0 && (
                <Badge variant="outline" className="border-white/40 text-white/80">
                  Session {timer.sessionCount}
                </Badge>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6">
              {!timer.isActive ? (
                <Button
                  onClick={startTimer}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full font-medium backdrop-blur-sm border border-white/20"
                  size="lg"
                >
                  ‚ñ?Start
                </Button>
              ) : (
                <Button
                  onClick={pauseTimer}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full font-medium backdrop-blur-sm border border-white/20"
                  size="lg"
                >
                  ‚è?Pause
                </Button>
              )}
              
              <Button
                onClick={resetTimer}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-medium backdrop-blur-sm border-white/20 hover:border-white/30"
                size="lg"
              >
                üîÑ Reset
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-white/80 text-sm">
                <span>Progress</span>
                <Badge variant="outline" className="border-white/40 text-white/80">
                  {timer.isBreak ? 'Break' : 'Work'} - 
                  {Math.round(((timer.isBreak ? BREAK_TIME : WORK_TIME) - (timer.minutes * 60 + timer.seconds)) / (timer.isBreak ? BREAK_TIME : WORK_TIME) * 100)}%
                </Badge>
              </div>
              <Progress 
                value={Math.round(((timer.isBreak ? BREAK_TIME : WORK_TIME) - (timer.minutes * 60 + timer.seconds)) / (timer.isBreak ? BREAK_TIME : WORK_TIME) * 100)}
                className="h-3 bg-white/20"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card className="rounded-none border-x-0 border-b-0 bg-transparent border-white/20">
        <CardContent className="text-center text-white/60 text-sm py-6">
          <p>25 min work ‚Ä?5 min break ‚Ä?15 min long break every 4 sessions</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroTimer;
