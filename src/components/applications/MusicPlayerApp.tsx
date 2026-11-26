import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface MusicTrack {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  notes: number[];
  bassNotes: number[];
  bpm: number;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'green',
    name: 'GREEN',
    subtitle: 'Pixel Records. Stereo audio.',
    color: '#15803d',
    notes: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 440.0, 349.23],
    bassNotes: [130.81, 130.81, 164.81, 174.61],
    bpm: 120,
  },
  {
    id: 'purple',
    name: 'PURPLE',
    subtitle: 'Synthwave Dreams. 8-Bit Lo-Fi.',
    color: '#7e22ce',
    notes: [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 329.63, 392.0],
    bassNotes: [146.83, 146.83, 174.61, 164.81],
    bpm: 110,
  },
  {
    id: 'silver',
    name: 'SILVER',
    subtitle: 'Ambient Stars. Celestial Chiptune.',
    color: '#64748b',
    notes: [349.23, 440.0, 523.25, 659.25, 523.25, 440.0, 392.0, 493.88],
    bassNotes: [174.61, 174.61, 196.0, 164.81],
    bpm: 105,
  },
  {
    id: 'blue',
    name: 'BLUE',
    subtitle: 'Deep Blue Wave. Retro Electro.',
    color: '#1d4ed8',
    notes: [196.0, 246.94, 293.66, 392.0, 329.63, 293.66, 246.94, 220.0],
    bassNotes: [98.0, 98.0, 130.81, 110.0],
    bpm: 125,
  },
  {
    id: 'red',
    name: 'RED',
    subtitle: 'Arcade Rush. Fast 8-Bit Beats.',
    color: '#b91c1c',
    notes: [329.63, 392.0, 493.88, 659.25, 493.88, 392.0, 440.0, 523.25],
    bassNotes: [164.81, 164.81, 196.0, 220.0],
    bpm: 135,
  },
  {
    id: 'gold',
    name: 'GOLD',
    subtitle: 'Golden Sunset. Mellow Melodies.',
    color: '#b45309',
    notes: [233.08, 293.66, 349.23, 466.16, 349.23, 293.66, 261.63, 329.63],
    bassNotes: [116.54, 116.54, 146.83, 130.81],
    bpm: 115,
  },
];

export const MusicPlayerApp: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stepRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Initialize or get Web Audio context safely
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Play a single 8-bit synthesizer tone
  const playNote = useCallback((freq: number, bassFreq: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.22;

    // Melody lead (square/chiptune wave)
    const leadOsc = ctx.createOscillator();
    const leadGain = ctx.createGain();
    leadOsc.type = 'square';
    leadOsc.frequency.setValueAtTime(freq, now);

    leadGain.gain.setValueAtTime(0.06, now);
    leadGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Warm bass tone (triangle wave)
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq, now);

    bassGain.gain.setValueAtTime(0.08, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);

    // Connect to speakers
    leadOsc.connect(leadGain);
    leadGain.connect(ctx.destination);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);

    leadOsc.start(now);
    leadOsc.stop(now + duration);
    bassOsc.start(now);
    bassOsc.stop(now + duration * 1.5);
  }, [getAudioContext]);

  // Handle timer step for music playback
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = Math.round((60 / selectedTrack.bpm / 2) * 1000);
      intervalRef.current = window.setInterval(() => {
        const step = stepRef.current;
        const note = selectedTrack.notes[step % selectedTrack.notes.length];
        const bassNote = selectedTrack.bassNotes[Math.floor(step / 2) % selectedTrack.bassNotes.length];
        playNote(note, bassNote);
        stepRef.current = (step + 1) % 64;
      }, stepDuration);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, selectedTrack, playNote]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSelectDisc = (track: MusicTrack) => {
    setSelectedTrack(track);
    stepRef.current = 0;
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div
      data-testid="music-player-app"
      className="flex flex-col items-center justify-between w-full h-full bg-[#f4eee2] text-slate-900 select-none p-4 sm:p-6 overflow-hidden"
    >
      {/* 1. Large Spinning Vinyl / CD Record */}
      <div className="relative my-2 sm:my-3 flex items-center justify-center">
        {/* Vinyl Base with groove rings */}
        <div
          data-testid="vinyl-cd-record"
          className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#111317] border-[3px] border-[#22262e] relative flex items-center justify-center shadow-2xl shadow-black/60 transition-transform duration-300 ${
            isPlaying ? 'animate-[spin_3.5s_linear_infinite]' : ''
          }`}
        >
          {/* Subtle concentric grooves */}
          <div className="absolute inset-2.5 rounded-full border border-white/5" />
          <div className="absolute inset-5 rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
          <div className="absolute inset-11 rounded-full border border-white/5" />
          <div className="absolute inset-14 rounded-full border border-white/5" />

          {/* Light reflection sheen */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none" />

          {/* Center Label */}
          <div
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-black/60 flex flex-col items-center justify-center relative shadow-inner text-center"
            style={{ backgroundColor: selectedTrack.color }}
          >
            {/* Center Spindle Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#f4eee2] border-2 border-black/80 shadow-inner z-10" />
            <span className="text-[7px] font-mono font-bold text-white tracking-widest mt-1 opacity-90 drop-shadow-xs">
              PIXEL
            </span>
          </div>
        </div>
      </div>

      {/* 2. Track Title & Details */}
      <div className="flex flex-col items-center text-center my-1.5 sm:my-2">
        <h2 className="font-mono font-black text-xl sm:text-2xl tracking-widest text-black drop-shadow-xs">
          {selectedTrack.name}
        </h2>
        <p className="font-mono text-xs sm:text-[13px] text-slate-700 mt-0.5 tracking-wide">
          {selectedTrack.subtitle}
        </p>
      </div>

      {/* 3. Retro 3D Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
        className="px-8 py-1.5 sm:px-10 sm:py-2 bg-white border-2 border-black font-mono font-bold text-sm sm:text-base text-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer hover:bg-slate-50 focus:outline-none"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* 4. DISCS Selection Section */}
      <div className="flex flex-col items-center w-full mt-3 sm:mt-4">
        <span className="font-mono text-[11px] font-bold text-slate-600 tracking-widest uppercase mb-1.5">
          DISCS
        </span>

        {/* Row of 6 Mini Vinyl Records */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
          {MUSIC_TRACKS.map((track) => {
            const isSelected = selectedTrack.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectDisc(track)}
                title={track.name}
                aria-label={`Select ${track.name} Disc`}
                className={`group p-0.5 rounded transition-transform cursor-pointer focus:outline-none ${
                  isSelected ? 'border-2 border-black -translate-y-0.5' : 'hover:scale-110'
                }`}
              >
                {/* Mini Vinyl Record */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#111317] border border-black/80 flex items-center justify-center relative shadow-md ${
                    isPlaying && isSelected ? 'animate-[spin_3.5s_linear_infinite]' : ''
                  }`}
                >
                  {/* Mini Grooves */}
                  <div className="absolute inset-1 rounded-full border border-white/10" />
                  {/* Mini Center Label */}
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/40"
                    style={{ backgroundColor: track.color }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
