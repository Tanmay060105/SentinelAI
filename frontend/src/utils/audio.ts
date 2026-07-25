// Pre-load a futuristic UI alert sound from Mixkit
const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
alertAudio.volume = 1.0;

export const playAlertSound = () => {
  try {
    // Reset to start so it can play rapidly in succession
    alertAudio.currentTime = 0;
    const playPromise = alertAudio.play();
    
    // Handle browser autoplay policies gracefully
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("Browser blocked audio playback (requires user interaction first):", err);
      });
    }
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};
