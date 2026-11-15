let context;
let enabled = false;
let musicTimer;
let note = 0;

export async function setAudio(value) {
    enabled = value;
    clearInterval(musicTimer);
    if (!value) { if (context) await context.suspend(); return; }
    try {
        context ||= new (window.AudioContext || window.webkitAudioContext)();
        await context.resume();
        // Sequência sintetizada original, sem samples de jogos ou gravações externas.
        musicTimer = setInterval(() => {
            const melody = [130.81, 196, 261.63, 164.81, 146.83, 220, 293.66, 196];
            tone(melody[note++ % melody.length], 0.3, 0.018);
        }, 450);
    } catch { enabled = false; }
}

function tone(frequency, duration, volume) {
    if (!enabled || !context || context.state !== 'running') return;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

export function attackSound(type) {
    const frequencies = { Electric: 700, Fire: 100, Water: 340, Ghost: 140, Ice: 1000, Dragon: 240, Steel: 850 };
    tone(frequencies[type] || 200, 0.25, 0.08);
}

export function victorySound() {
    [261.63, 329.63, 392, 523.25].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.4, 0.06), index * 130));
}
