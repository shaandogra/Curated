import React, { useState, useEffect, useRef } from 'react';

const INITIAL_TRACKS = [
  {
    id: 'kick',
    name: 'KICK',
    colorClass: 'kick-label',
    padClass: 'kick-pad',
    mute: false,
    selectedSound: '/sounds/kick-heavy.wav',
    options: [
      { value: '/sounds/kick-classic.wav', label: 'CLASSIC KICK' },
      { value: '/sounds/kick-808.wav', label: '808 KICK' },
      { value: '/sounds/kick-heavy.wav', label: 'HEAVY KICK' },
      { value: '/sounds/kick-softy.wav', label: 'SOFTY KICK' }
    ],
    pads: Array(8).fill(false)
  },
  {
    id: 'snare',
    name: 'SNARE',
    colorClass: 'snare-label',
    padClass: 'snare-pad',
    mute: false,
    selectedSound: '/sounds/snare-vinyl02.wav',
    options: [
      { value: '/sounds/snare-acoustic01.wav', label: 'ACOUSTIC SNARE' },
      { value: '/sounds/snare-808.wav', label: '808 SNARE' },
      { value: '/sounds/snare-vinyl02.wav', label: 'VINYL SNARE' }
    ],
    pads: Array(8).fill(false)
  },
  {
    id: 'hihat',
    name: 'HI-HAT',
    colorClass: 'hihat-label',
    padClass: 'hihat-pad',
    mute: false,
    selectedSound: '/sounds/hihat-acoustic01.wav',
    options: [
      { value: '/sounds/hihat-acoustic01.wav', label: 'ACOUSTIC HIHAT' },
      { value: '/sounds/hihat-808.wav', label: '808 HIHAT' }
    ],
    pads: Array(8).fill(false)
  },
  {
    id: 'clap',
    name: 'CLAP',
    colorClass: 'clap-label',
    padClass: 'clap-pad',
    mute: false,
    selectedSound: '/sounds/clap.wav',
    options: [
      { value: '/sounds/clap.wav', label: 'CLASSIC CLAP' }
    ],
    pads: Array(8).fill(false)
  },
  {
    id: 'tom',
    name: 'TOM',
    colorClass: 'tom-label',
    padClass: 'tom-pad',
    mute: false,
    selectedSound: '/sounds/tom.wav',
    options: [
      { value: '/sounds/tom.wav', label: 'CLASSIC TOM' }
    ],
    pads: Array(8).fill(false)
  },
  {
    id: 'crash',
    name: 'CRASH',
    colorClass: 'crash-label',
    padClass: 'crash-pad',
    mute: false,
    selectedSound: '/sounds/crash.wav',
    options: [
      { value: '/sounds/crash.wav', label: 'CLASSIC CRASH' }
    ],
    pads: Array(8).fill(false)
  }
];

function App() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [bpm, setBpm] = useState(150);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const audioRefs = useRef({});
  const tracksRef = useRef(tracks);
  const stepRef = useRef(0);

  // Keep tracks updated in ref so the timer callback always references latest values without resetting interval
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  // Audio playing effect loop
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(-1);
      return;
    }

    const intervalTime = (60 / bpm) * 1000;
    
    const tick = () => {
      const step = stepRef.current % 8;
      setCurrentStep(step);

      tracksRef.current.forEach((track) => {
        if (track.pads[step] && !track.mute) {
          const audio = audioRefs.current[track.id];
          if (audio) {
            audio.currentTime = 0;
            audio.play().catch((err) => console.log('Audio playback blocked/interrupted:', err));
          }
        }
      });

      stepRef.current++;
    };

    // Trigger first beat immediately
    tick();

    const timerId = setInterval(tick, intervalTime);
    return () => clearInterval(timerId);
  }, [isPlaying, bpm]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (trackId) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, mute: !track.mute } : track
      )
    );
  };

  const handleSoundChange = (trackId, selectedSound) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, selectedSound } : track
      )
    );
  };

  const togglePad = (trackId, padIndex) => {
    setTracks(
      tracks.map((track) => {
        if (track.id === trackId) {
          const newPads = [...track.pads];
          newPads[padIndex] = !newPads[padIndex];
          return { ...track, pads: newPads };
        }
        return track;
      })
    );
  };

  return (
    <div className="machine">
      <header className="machine-header">
        <div className="logo">
          CURATED BEATMAKER <span>MODEL-1</span>
        </div>
        <div className="header-lines">
          <div className="line red"></div>
          <div className="line blue"></div>
          <div className="line yellow"></div>
          <div className="line purple"></div>
          <div className="line cyan"></div>
          <div className="line pink"></div>
        </div>
      </header>

      <div className="sequencer">
        {tracks.map((track) => (
          <div className="track" key={track.id}>
            <div className="control">
              <div className={`track-label ${track.colorClass}`}>{track.name}</div>
              <div className="controls-row">
                <button
                  className={`mute-btn ${track.mute ? 'activemute' : ''}`}
                  onClick={() => toggleMute(track.id)}
                >
                  {track.mute ? 'MUTED' : 'MUTE'}
                </button>
                <div className="select-wrapper">
                  <select
                    name={`${track.id}-select`}
                    id={`${track.id}-select`}
                    value={track.selectedSound}
                    onChange={(e) => handleSoundChange(track.id, e.target.value)}
                  >
                    {track.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`${track.id} pads`}>
              {track.pads.map((isActive, padIdx) => (
                <div
                  key={padIdx}
                  className={`pad ${track.padClass} ${isActive ? 'active' : ''} ${
                    currentStep === padIdx ? 'playing' : ''
                  }`}
                  onClick={() => togglePad(track.id, padIdx)}
                ></div>
              ))}
            </div>
          </div>
        ))}

        <div className="transport-section">
          <div className="play-stopButton">
            <button className="play" onClick={togglePlay}>
              {isPlaying ? '■ STOP' : '▶ PLAY'}
            </button>
          </div>

          <div className="tempo">
            <div className="tempo-display">
              <span className="label">BPM</span>
              <span className="tempo-nr">{bpm}</span>
            </div>
            <input
              type="range"
              className="tempo-slider"
              max="300"
              min="10"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Hidden Audio elements for playing preloaded sounds */}
      {tracks.map((track) => (
        <audio
          key={track.id}
          ref={(el) => {
            if (el) audioRefs.current[track.id] = el;
          }}
          src={track.selectedSound}
          preload="auto"
        />
      ))}
    </div>
  );
}

export default App;
