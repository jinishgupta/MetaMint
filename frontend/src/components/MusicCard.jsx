import React, { useRef, useState } from 'react';
import audio from '../assets/example.mp3';
import sample2 from '../assets/sample2.jpg';

function MusicCard() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      audioEl.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (t) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="
        w-[300px] h-[400px] flex flex-col items-center
        rounded-2xl border-2 border-[rgba(0,255,130,0.2)]
        bg-[rgba(22,23,27,0.8)] shadow-md
        transition-all duration-300
        hover:border-green-400 hover:shadow-[0_0_16px_2px_rgba(0,255,130,0.5)]
        hover:-translate-y-2
        group
      "
    >
      <div className="w-full h-[320px] flex items-center justify-center overflow-hidden rounded-t-2xl p-2">
        <img
          src={sample2}
          alt="Collection"
          className="w-full h-[330px] object-contain rounded-t-2xl"
        />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 p-2 w-full">
        <div className="text-xl font-semibold mb-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Nice Music</div>
        <div className="text-base font-bold mb-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">0.001 ETH</div>
        {/* Custom Audio Player */}
        <div className="w-full flex items-center gap-3 mt-2">
          <button
            onClick={togglePlay}
            className="bg-gradient-to-r from-secondary to-primary text-black font-bold px-4 py-1 rounded-md transition-all"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-blue-500"
          />
          <span className="text-gray-200 font-semibold w-12 text-right">{formatTime(currentTime)}</span>
        </div>
        <audio
          ref={audioRef}
          src={audio}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default MusicCard;