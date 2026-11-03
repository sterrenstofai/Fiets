// De stem van het toestel (Web Speech) en nagemaakte geluidjes (Web Audio). Overgenomen van De Ruimte.
// Geluid start alleen na een tik van de gebruiker (iOS).
let stemmen = [];
function laad() { if ("speechSynthesis" in window) stemmen = speechSynthesis.getVoices().filter((v) => (v.lang || "").toLowerCase().replace("_", "-").startsWith("nl")); }
if ("speechSynthesis" in window) { laad(); speechSynthesis.addEventListener?.("voiceschanged", laad); }
export function zeg(tekst, { kind = false } = {}) {
  if (!("speechSynthesis" in window)) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(tekst);
  u.lang = "nl-NL"; u.rate = kind ? 0.8 : 0.95; u.pitch = kind ? 1.1 : 1;
  const s = stemmen.find((v) => v.localService && v.lang.toLowerCase().startsWith("nl-nl")) || stemmen.find((v) => v.localService) || stemmen[0];
  if (s) u.voice = s;
  speechSynthesis.speak(u);
  return true;
}
export function stil() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }
let ac = null;
function ctx() { ac ||= new (window.AudioContext || window.webkitAudioContext)(); ac.resume?.(); return ac; }
// Een fietsbel (nagemaakt): twee keer "tring", een metalen klank met boventonen.
export function bel() {
  try {
    const a = ctx(), t0 = a.currentTime;
    for (const start of [0, 0.32]) for (const [f, v] of [[2850, 0.16], [4120, 0.08], [6400, 0.04]]) {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(0, t0 + start); g.gain.linearRampToValueAtTime(v, t0 + start + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + 0.9);
      o.connect(g).connect(a.destination); o.start(t0 + start); o.stop(t0 + start + 1);
    }
  } catch {}
}
// Ratelen van de ketting en het vrijloopje (nagemaakt): korte tikjes.
export function ratel(n = 14) {
  try {
    const a = ctx(), t0 = a.currentTime;
    for (let i = 0; i < n; i++) {
      const b = a.createBuffer(1, 600, a.sampleRate), d = b.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.exp(-k / 60);
      const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
      f.type = "highpass"; f.frequency.value = 2500; g.gain.value = 0.25; s.buffer = b; s.connect(f).connect(g).connect(a.destination); s.start(t0 + i * 0.055);
    }
  } catch {}
}
export function klik() {
  try { const a = ctx(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 1400; g.gain.setValueAtTime(0.05, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.05); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.06); } catch {}
}
