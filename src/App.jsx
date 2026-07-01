import { useState, useRef, useCallback, useEffect } from "react";

const C = {
  bg: "#F6F2E7",
  card: "#FFFFFF",
  ringTrack: "#E3E9DA",
  ringActive: "#8CA97F",
  btn: "#5F7A55",
  btnDark: "#4C6444",
  circleFill: "#F1F0E6",
  tx: "#25321F",
  ts: "#6C7C60",
  tf: "#9FAE93",
  chipBorder: "#D3DFC7",
};

const PATTERNS = {
  box: {
    label: "Box 4 4 4 4",
    tip: "Box breathing. Your BreathLoop™ signature. Equal counts, steady focus.",
    reps: 1,
    steps: [
      { label: "Inhale", secs: 4, scale: 1.1 },
      { label: "Hold", secs: 4, scale: 1.1 },
      { label: "Exhale", secs: 4, scale: 0.92 },
      { label: "Hold", secs: 4, scale: 0.92 },
    ],
  },
  calm: {
    label: "4 7 8 Calm",
    tip: "A long exhale calms your nervous system. Great after a tough patient interaction.",
    reps: 1,
    steps: [
      { label: "Inhale", secs: 4, scale: 1.1 },
      { label: "Hold", secs: 7, scale: 1.1 },
      { label: "Exhale", secs: 8, scale: 0.92 },
    ],
  },
  sigh: {
    label: "The Double Sigh",
    tip: "Two quick breaths in through your nose, then one long breath out. Four rounds for a fast reset when you need it most.",
    reps: 4,
    steps: [
      { label: "Inhale", secs: 1, ticks: 1, scale: 1.12 },
      { label: "Again", secs: 0.5, ticks: 0, silent: true, scale: 1.22 },
      { label: "Exhale", secs: 6.5, ticks: 6, scale: 0.86 },
    ],
  },
};

const EDU = {
  box: {
    title: "Why Box Breathing Works",
    body: "Box breathing is used by first responders, pilots, and Navy SEALs to stay steady and focused under pressure. Four counts in, four counts hold, four counts out, four counts hold. Steady counting gives your mind something simple to hold onto when everything else feels like too much.",
  },
  calm: {
    title: "Why 4 7 8 Works",
    body: "The 4 7 8 pattern uses a longer exhale than inhale. A longer exhale helps signal to your body that it is safe to slow down. Many people use this one before a hard conversation, or before walking back onto the floor after a heavy moment.",
  },
  sigh: {
    title: "Why The Double Sigh Works",
    body: "The Double Sigh, also known as the physiological sigh, comes from real breathing research out of Stanford. Two quick inhales followed by one long exhale is one of the fastest ways your body naturally knows how to calm down in the moment.",
  },
};

const MSGS = [
  "You gave yourself a reset. Your body thanks you.",
  "Two sessions. You are building a healthy habit.",
  "Three. Consistency is everything, Nurse.",
  "Four sessions. You are a BreathLoop™ pro.",
  "Five. Your nervous system is grateful.",
];

export default function App() {
  const [pat, setPat] = useState("sigh");
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("Ready");
  const [count, setCount] = useState(null);
  const [scale, setScale] = useState(1);
  const [rep, setRep] = useState(0);
  const [sess, setSess] = useState(0);
  const [done, setDone] = useState(false);
  const [doneIdx, setDoneIdx] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const touchX = useRef(null);
  const [ripples, setRipples] = useState([]);
  const runRef = useRef(false);
  const tmrRef = useRef(null);
  const ridRef = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("breathloop_sessions_today");
      if (saved) setSess(Number(saved) || 0);
    } catch (e) {}
  }, []);

  const ripple = useCallback(() => {
    const id = ridRef.current++;
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 1100);
  }, []);

  const clearAll = () => {
    clearTimeout(tmrRef.current);
    setCount(null);
    setScale(1);
    setRep(0);
  };

  const stop = useCallback((ok) => {
    runRef.current = false;
    setRunning(false);
    clearAll();
    setLabel("Ready");
    if (ok) {
      setSess((s) => {
        const next = Math.min(s + 1, 5);
        try {
          localStorage.setItem("breathloop_sessions_today", String(next));
        } catch (e) {}
        return next;
      });
      setDone(true);
    }
  }, []);

  const runSequence = useCallback(
    (patKey) => {
      const p = PATTERNS[patKey];
      const seq = [];
      for (let r = 0; r < p.reps; r++) p.steps.forEach((s) => seq.push({ ...s, repIdx: r }));
      let i = 0;

      const nextStep = () => {
        if (!runRef.current) return;
        if (i >= seq.length) {
          stop(true);
          return;
        }
        const step = seq[i];
        setLabel(step.label);
        setScale(step.scale);
        setRep(step.repIdx + 1);
        i++;

        if (step.silent) {
          setCount(null);
          ripple();
          tmrRef.current = setTimeout(nextStep, step.secs * 1000);
          return;
        }

        const ticks = step.ticks || Math.round(step.secs);
        const interval = (step.secs * 1000) / ticks;
        let t = ticks;
        const tick = () => {
          if (!runRef.current) return;
          setCount(t);
          ripple();
          t--;
          if (t < 0) nextStep();
          else tmrRef.current = setTimeout(tick, interval);
        };
        tick();
      };
      nextStep();
    },
    [stop, ripple]
  );

  const start = useCallback(() => {
    runRef.current = true;
    setRunning(true);
    setDone(false);
    runSequence(pat);
  }, [pat, runSequence]);

  const selPat = (k) => {
    if (running) return;
    setPat(k);
  };
  const again = () => {
    setDone(false);
    setDoneIdx(0);
    setNote("");
    setSaved(false);
    clearAll();
    setLabel("Ready");
  };
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40) setDoneIdx((d) => Math.min(d + 1, 2));
    if (dx > 40) setDoneIdx((d) => Math.max(d - 1, 0));
    touchX.current = null;
  };
  const saveNote = () => {
    try {
      const key = "breathloop_notes";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ pattern: pat, text: note, date: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {}
    setSaved(true);
  };
  const p = PATTERNS[pat];
  const showReps = running && p.reps > 1;

  useEffect(() => () => clearTimeout(tmrRef.current), []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "Georgia,serif",
      }}
    >
      <style>{`
        @keyframes rippleGrow {
          0% { transform: scale(0.3); opacity: .45; }
          100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: C.tf, fontWeight: 500, fontFamily: "sans-serif" }}>
            ShiftRelease™
          </div>
          <div style={{ fontSize: 28, color: C.tx, fontWeight: 400, margin: ".2rem 0 .1rem" }}>BreathLoop™</div>
          <div style={{ fontSize: 12, color: C.ts, fontFamily: "sans-serif" }}>Close the shift. Come home whole.</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < sess ? C.btn : C.circleFill, border: `1.5px solid ${C.ringActive}`, transition: "background .4s" }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.ts, fontFamily: "sans-serif" }}>
            Sessions today: <strong style={{ color: C.tx }}>{sess}</strong>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 24, boxShadow: "0 4px 32px rgba(37,50,31,.08)", padding: "1.75rem 1.5rem 1.5rem" }}>
          {!done ? (
            <>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {Object.entries(PATTERNS).map(([k, v]) => (
                  <button key={k} onClick={() => selPat(k)} style={{ padding: "6px 13px", fontSize: 11, fontWeight: 500, fontFamily: "sans-serif", borderRadius: 999, border: pat === k ? "none" : `1.5px solid ${C.chipBorder}`, background: pat === k ? C.btn : "transparent", color: pat === k ? "#fff" : C.ts, cursor: running ? "not-allowed" : "pointer", opacity: running && pat !== k ? 0.5 : 1, transition: "all .2s" }}>
                    {v.label}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", width: 250, height: 250, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ripples.map((id) => (
                  <div key={id} style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: `2px solid ${C.ringActive}`, animation: "rippleGrow 1.1s ease-out forwards" }} />
                ))}
                <div style={{ position: "absolute", top: 0, left: 0, width: 250, height: 250, borderRadius: "50%", border: `2px solid ${C.ringTrack}` }} />
                <button onClick={running ? () => stop(false) : start} style={{ width: 180, height: 180, borderRadius: "50%", background: C.circleFill, border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`, transition: "transform .6s ease-in-out", zIndex: 2, cursor: "pointer", padding: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.tx, fontFamily: "sans-serif", letterSpacing: ".03em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 58, color: C.tx, lineHeight: 1, fontWeight: 400 }}>{count === null ? (running ? "•" : "○") : count}</div>
                  {showReps && <div style={{ fontSize: 12, color: C.ts, fontFamily: "sans-serif", marginTop: 6 }}>Round {rep} of {p.reps}</div>}
                  {!running && count === null && <div style={{ fontSize: 15, color: C.btn, fontFamily: "sans-serif", fontWeight: 600, marginTop: 6 }}>Tap to start</div>}
                  {running && <div style={{ fontSize: 13, color: C.ts, fontFamily: "sans-serif", fontWeight: 600, marginTop: 6 }}>Tap to stop</div>}
                </button>
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: C.ts, fontFamily: "sans-serif", lineHeight: 1.6, padding: "0 .5rem" }}>{p.tip}</div>
            </>
          ) : (
            <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: ".75rem", padding: ".5rem 0 .25rem", minHeight: 260 }}>
              {doneIdx === 0 && (
                <>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.circleFill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🌿</div>
                  <div style={{ fontSize: 24, color: C.tx, fontWeight: 400 }}>{sess >= 5 ? "Five sessions." : "Well done."}</div>
                  <div style={{ fontSize: 13, color: C.ts, fontFamily: "sans-serif", lineHeight: 1.65, maxWidth: 260 }}>{MSGS[Math.min(sess - 1, MSGS.length - 1)]}</div>
                  <div style={{ fontSize: 11, color: C.tf, fontFamily: "sans-serif", marginTop: 4 }}>Swipe to learn why this works</div>
                </>
              )}
              {doneIdx === 1 && (
                <>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.circleFill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📘</div>
                  <div style={{ fontSize: 18, color: C.tx, fontWeight: 600, fontFamily: "sans-serif" }}>{EDU[pat].title}</div>
                  <div style={{ fontSize: 13, color: C.ts, fontFamily: "sans-serif", lineHeight: 1.7, maxWidth: 270 }}>{EDU[pat].body}</div>
                </>
              )}
              {doneIdx === 2 && (
                <>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.circleFill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✏️</div>
                  <div style={{ fontSize: 18, color: C.tx, fontWeight: 600, fontFamily: "sans-serif" }}>How are you feeling</div>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A quick note about this shift, just for you." style={{ width: "100%", maxWidth: 270, minHeight: 70, borderRadius: 12, border: `1.5px solid ${C.chipBorder}`, padding: 10, fontFamily: "sans-serif", fontSize: 13, color: C.tx, resize: "none", outline: "none" }} />
                  <button onClick={saveNote} style={{ padding: "8px 24px", fontSize: 13, fontWeight: 600, fontFamily: "sans-serif", background: saved ? C.chipBorder : C.btn, color: saved ? C.ts : "#fff", border: "none", borderRadius: 999, cursor: "pointer" }}>
                    {saved ? "Saved" : "Save note"}
                  </button>
                </>
              )}

              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === doneIdx ? C.btn : C.chipBorder }} />
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                {doneIdx > 0 && <button onClick={() => setDoneIdx((d) => d - 1)} style={{ background: "transparent", border: "none", color: C.ts, fontSize: 13, fontFamily: "sans-serif", cursor: "pointer" }}>Back</button>}
                {doneIdx < 2 && <button onClick={() => setDoneIdx((d) => d + 1)} style={{ background: "transparent", border: "none", color: C.btn, fontSize: 13, fontFamily: "sans-serif", fontWeight: 600, cursor: "pointer" }}>Next</button>}
              </div>

              <button onClick={again} style={{ marginTop: ".5rem", padding: "11px 32px", fontSize: 14, fontWeight: 500, fontFamily: "sans-serif", background: C.btn, color: "#fff", border: "none", borderRadius: 999, cursor: "pointer" }}>
                Breathe again
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <a href="https://shiftrelease.myshopify.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "10px 26px", fontSize: 13, fontWeight: 600, fontFamily: "sans-serif", color: C.btn, border: `1.5px solid ${C.chipBorder}`, borderRadius: 999, textDecoration: "none", background: C.card }}>
            Shop BreathLoop
          </a>
        </div>
        <div style={{ textAlign: "center", marginTop: ".75rem", fontSize: 11, color: C.tf, fontFamily: "sans-serif" }}>
          ShiftRelease™ · BreathLoop™ · Made for nurses, by a nurse.
        </div>
      </div>
    </div>
  );
}
