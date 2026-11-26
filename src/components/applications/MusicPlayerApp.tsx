import React, { useState, useEffect, useRef, useCallback } from 'react';

export type MusicGenre = 'chiptune' | 'synthwave' | 'ambient' | 'funk' | 'arcade' | 'jazz';

export interface MusicTrack {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  genre: MusicGenre;
  bpm: number;
  melodyNotes: number[];
  bassNotes: number[];
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'green',
    name: 'GREEN',
    subtitle: 'Pixel Records. Stereo audio.',
    color: '#15803d',
    genre: 'chiptune',
    bpm: 128,
    melodyNotes: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 440.0, 392.0, 349.23, 392.0, 440.0, 523.25, 587.33, 523.25, 392.0, 329.63],
    bassNotes: [130.81, 130.81, 164.81, 174.61, 196.0, 174.61, 164.81, 130.81],
  },
  {
    id: 'purple',
    name: 'PURPLE',
    subtitle: 'Dreamy Lo-Fi Synthwave. Mellow Pads.',
    color: '#7e22ce',
    genre: 'synthwave',
    bpm: 84,
    melodyNotes: [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 392.0, 329.63, 293.66, 349.23, 440.0, 392.0, 349.23, 329.63, 293.66, 261.63],
    bassNotes: [73.42, 73.42, 87.31, 87.31, 98.0, 98.0, 82.41, 73.42],
  },
  {
    id: 'silver',
    name: 'SILVER',
    subtitle: 'Celestial Space Ambient. Crystal Bells.',
    color: '#64748b',
    genre: 'ambient',
    bpm: 96,
    melodyNotes: [349.23, 440.0, 523.25, 659.25, 698.46, 659.25, 523.25, 440.0, 392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 440.0, 349.23],
    bassNotes: [87.31, 87.31, 110.0, 110.0, 98.0, 98.0, 87.31, 87.31],
  },
  {
    id: 'blue',
    name: 'BLUE',
    subtitle: 'Funky Electro Disco Groove. Slap Bass.',
    color: '#1d4ed8',
    genre: 'funk',
    bpm: 118,
    melodyNotes: [196.0, 246.94, 293.66, 392.0, 329.63, 293.66, 392.0, 440.0, 392.0, 329.63, 293.66, 246.94, 220.0, 246.94, 293.66, 196.0],
    bassNotes: [98.0, 196.0, 98.0, 146.83, 110.0, 220.0, 110.0, 98.0],
  },
  {
    id: 'red',
    name: 'RED',
    subtitle: 'Arcade Rush & Beats. Fast 8-Bit Action.',
    color: '#b91c1c',
    genre: 'arcade',
    bpm: 148,
    melodyNotes: [329.63, 392.0, 493.88, 659.25, 622.25, 587.33, 523.25, 493.88, 440.0, 493.88, 523.25, 587.33, 659.25, 587.33, 493.88, 392.0],
    bassNotes: [82.41, 164.81, 82.41, 196.0, 110.0, 220.0, 98.0, 82.41],
  },
  {
    id: 'gold',
    name: 'GOLD',
    subtitle: 'Golden Sunset Jazz. Smooth Chords.',
    color: '#b45309',
    genre: 'jazz',
    bpm: 90,
    melodyNotes: [233.08, 293.66, 349.23, 466.16, 440.0, 349.23, 293.66, 261.63, 293.66, 349.23, 440.0, 466.16, 523.25, 466.16, 349.23, 293.66],
    bassNotes: [116.54, 116.54, 146.83, 130.81, 110.0, 146.83, 116.54, 116.54],
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Synthesize sound based on genre
  const playGenreNote = useCallback(
    (freq: number, bassFreq: number, genre: MusicGenre) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (genre) {
        case 'chiptune': {
          // Classic 8-bit square wave with staccato attack
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);

          // Punchy square sub-bass
          const bass = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bass.type = 'triangle';
          bass.frequency.setValueAtTime(bassFreq, now);
          bassGain.gain.setValueAtTime(0.08, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          bass.connect(bassGain);
          bassGain.connect(ctx.destination);
          bass.start(now);
          bass.stop(now + 0.24);
          break;
        }

        case 'synthwave': {
          // Warm filtered sawtooth wave with slow decay
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);

          // Deep sub-bass drone
          const sub = ctx.createOscillator();
          const subGain = ctx.createGain();
          sub.type = 'sine';
          sub.frequency.setValueAtTime(bassFreq, now);
          subGain.gain.setValueAtTime(0.1, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          sub.connect(subGain);
          subGain.connect(ctx.destination);
          sub.start(now);
          sub.stop(now + 0.5);
          break;
        }

        case 'ambient': {
          // Pure sine wave with celestial bell decay
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);

          // Harmonic shimmer (+1 octave)
          const harm = ctx.createOscillator();
          const harmGain = ctx.createGain();
          harm.type = 'sine';
          harm.frequency.setValueAtTime(freq * 2, now);
          harmGain.gain.setValueAtTime(0.02, now);
          harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          harm.connect(harmGain);
          harmGain.connect(ctx.destination);
          harm.start(now);
          harm.stop(now + 0.4);
          break;
        }

        case 'funk': {
          // Syncopated slap bass and punchy lead
          const lead = ctx.createOscillator();
          const leadGain = ctx.createGain();
          lead.type = 'triangle';
          lead.frequency.setValueAtTime(freq, now);
          leadGain.gain.setValueAtTime(0.09, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          lead.connect(leadGain);
          leadGain.connect(ctx.destination);
          lead.start(now);
          lead.stop(now + 0.16);

          // Funky square bass
          const bass = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bass.type = 'square';
          bass.frequency.setValueAtTime(bassFreq, now);
          bassGain.gain.setValueAtTime(0.07, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          bass.connect(bassGain);
          bassGain.connect(ctx.destination);
          bass.start(now);
          bass.stop(now + 0.2);
          break;
        }

        case 'arcade': {
          // Fast aggressive saw lead
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);

          // Punchy arcade kick/pulse
          const kick = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kick.type = 'triangle';
          kick.frequency.setValueAtTime(140, now);
          kick.frequency.exponentialRampToValueAtTime(40, now + 0.1);
          kickGain.gain.setValueAtTime(0.12, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          kick.connect(kickGain);
          kickGain.connect(ctx.destination);
          kick.start(now);
          kick.stop(now + 0.1);
          break;
        }

        case 'jazz': {
          // Warm jazz guitar / electric piano tone
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, now);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);

          // Soft upright bass
          const bass = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bass.type = 'sine';
          bass.frequency.setValueAtTime(bassFreq, now);
          bassGain.gain.setValueAtTime(0.09, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          bass.connect(bassGain);
          bassGain.connect(ctx.destination);
          bass.start(now);
          bass.stop(now + 0.38);
          break;
        }
      }
    },
    [getAudioContext]
  );

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = Math.round((60 / selectedTrack.bpm / 2) * 1000);
      intervalRef.current = window.setInterval(() => {
        const step = stepRef.current;
        const note = selectedTrack.melodyNotes[step % selectedTrack.melodyNotes.length];
        const bassNote =
          selectedTrack.bassNotes[Math.floor(step / 2) % selectedTrack.bassNotes.length];
        playGenreNote(note, bassNote, selectedTrack.genre);
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
  }, [isPlaying, selectedTrack, playGenreNote]);

  // Cleanup on unmount
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

  // Switching disc resets play/pause state to 'Play' as requested
  const handleSelectDisc = (track: MusicTrack) => {
    setSelectedTrack(track);
    stepRef.current = 0;
    // Reset play/pause state so button changes to Play and waits for user interaction
    setIsPlaying(false);
  };

  return (
    <div
      data-testid="music-player-app"
      className="flex flex-col items-center justify-between w-full h-full bg-[#f4eee2] text-slate-900 select-none p-4 sm:p-5 overflow-hidden"
    >
      {/* 1. Large Spinning Vinyl / CD Record */}
      <div className="relative my-1 sm:my-2 flex items-center justify-center">
        {/* Vinyl Base with groove rings */}
        <div
          data-testid="vinyl-cd-record"
          className={`w-40 h-40 sm:w-46 sm:h-46 rounded-full bg-[#111317] border-[3px] border-[#22262e] relative flex items-center justify-center shadow-2xl shadow-black/60 transition-transform duration-300 ${
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
            className="w-15 h-15 sm:w-17 sm:h-17 rounded-full border border-black/60 flex flex-col items-center justify-center relative shadow-inner text-center"
            style={{ backgroundColor: selectedTrack.color }}
          >
            {/* Center Spindle Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#f4eee2] border-2 border-black/80 shadow-inner z-10" />
            <span className="text-[7px] font-mono font-bold text-white tracking-widest mt-0.5 opacity-90 drop-shadow-xs">
              PIXEL
            </span>
          </div>
        </div>
      </div>

      {/* 2. Track Title & Details */}
      <div className="flex flex-col items-center text-center my-1">
        <h2 className="font-mono font-black text-xl sm:text-2xl tracking-widest text-black drop-shadow-xs">
          {selectedTrack.name}
        </h2>
        <p className="font-mono text-xs sm:text-[13px] text-slate-700 mt-0.5 tracking-wide max-w-[280px]">
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
      <div className="flex flex-col items-center w-full mt-2 sm:mt-3">
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
