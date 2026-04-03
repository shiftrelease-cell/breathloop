import { useState, useRef, useCallback } from "react";

const PATTERNS = {
  box:  { label:"Box 4-4-4-4", phases:["Inhale","Hold","Exhale","Hold"], counts:[4,4,4,4], tip:"Box breathing — your BreathLoop™ signature. Equal counts, steady focus." },
  calm: { label:"4-7-8 Calm",  phases:["Inhale","Hold","Exhale"],        counts:[4,7,8],   tip:"4-7-8: long exhale calms your nervous system. Great after a tough patient interaction." },
  quick:{ label:"Quick Reset", phases:["Inhale","Hold","Exhale","Hold"], counts:[2,1,4,1], tip:"Quick reset — 8 seconds. Perfect for a fast breather between patients." }
};
const CIRC=540.35;
const MSGS=["You gave yourself a reset. Your body thanks you.","Two sessions. You're building a healthy habit.","Three! Consistency is everything, Nurse.","Four sessions. You're a BreathLoop™ pro.","Five! 🌟 Your nervous system is grateful."];
const C={
  gl:"#DBEEFF",
  gm:"#4BA3C7",
  gd:"#2176AE",
  gk:"#14547A",
  gb:"#EBF5FB",
  tx:"#0D2B3E",
  ts:"#4A7A96",
  tf:"#8AAFC2"
};

export default function App() {
  const [pat,setPat]=useState("box");
  const [running,setRunning]=useState(false);
  const [pi,setPi]=useState(0);
  const [count,setCount]=useState(null);
  const [arc,setArc]=useState(CIRC);
  const [scale,setScale]=useState(1);
  const [sess,setSess]=useState(0);
  const [done,setDone]=useState(false);
  const [snd,setSnd]=useState(false);
  const [tip,setTip]=useState(PATTERNS.box.tip);
  const runRef=useRef(false),sndRef=useRef(false),acRef=useRef(null),tmr=useRef(null);
  const ping=useCallback(()=>{try{if(!acRef.current)acRef.current=new(window.AudioContext||window.webkitAudioContext)();const o=acRef.current.createOscillator(),g=acRef.current.createGain();o.connect(g);g.connect(acRef.current.destination);o.type="sine";o.frequency.value=440;g.gain.setValueAtTime(.07,acRef.current.currentTime);g.gain.exponentialRampToValueAtTime(.001,acRef.current.currentTime+.35);o.start();o.stop(acRef.current.currentTime+.35);}catch(e){}},[]);
  const stop=useCallback((ok)=>{runRef.current=false;setRunning(false);clearTimeout(tmr.current);setPi(0);setCount(null);setArc(CIRC);setScale(1);if(ok){setSess(s=>Math.min(s+1,5));setDone(true);}},[]);
  const phase=useCallback((pKey,pIdx)=>{
    if(!runRef.current)return;
    const p=PATTERNS[pKey];
    if(pIdx>=p.counts.length){stop(true);return;}
    const ph=p.phases[pIdx],cnt=p.counts[pIdx],tot=p.counts.reduce((a,b)=>a+b,0),bef=p.counts.slice(0,pIdx).reduce((a,b)=>a+b,0);
    setPi(pIdx);setScale(ph==="Inhale"?1.1:ph==="Exhale"?.92:1);
    let s=cnt;
    const tick=()=>{if(!runRef.current)return;setCount(s);setArc(CIRC*(1-(bef+(cnt-s+1))/tot));if(sndRef.current)ping();s--;if(s<0)phase(pKey,pIdx+1);else tmr.current=setTimeout(tick,1000);};
    tick();
  },[stop,ping]);
  const start=useCallback(()=>{runRef.current=true;sndRef.current=snd;setRunning(true);setDone(false);setPi(0);phase(pat,0);},[pat,phase,snd]);
  const selPat=(k)=>{if(running)return;setPat(k);setTip(PATTERNS[k].tip);};
  const again=()=>{setDone(false);setCount(null);setArc(CIRC);setScale(1);};
  const p=PATTERNS[pat];
  const curPhase=running?p.phases[pi]:"Ready";

  return(
    <div style={{minHeight:"100vh",background:"#F0F8FF",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",fontFamily:"Georgia,serif"}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
          <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:C.tf,fontWeight:500,fontFamily:"sans-serif"}}>ShiftRelease™</div>
          <div style={{fontSize:28,color:C.tx,fontWeight:400,margin:".2rem 0 .1rem"}}>BreathLoop™</div>
          <div style={{fontSize:12,color:C.ts,fontFamily:"sans-serif"}}>Your 16-second focus reset</div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:"1.25rem"}}>
          <div style={{display:"flex",gap:6}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<sess?C.gd:C.gb,border:`1.5px solid ${C.gm}`,transition:"background .4s"}}/>)}</div>
          <div style={{fontSize:12,color:C.ts,fontFamily:"sans-serif"}}>Sessions today: <strong style={{color:C.gk}}>{sess}</strong></div>
        </div>
        <div style={{background:"#fff",borderRadius:24,boxShadow:"0 4px 32px rgba(14,43,62,.08)",padding:"1.75rem 1.5rem 1.5rem"}}>
          {!done?<>
            <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:"1.5rem",flexWrap:"wrap"}}>
              {Object.entries(PATTERNS).map(([k,v])=><button key={k} onClick={()=>selPat(k)} style={{padding:"6px 13px",fontSize:11,fontWeight:500,fontFamily:"sans-serif",borderRadius:999,border:pat===k?"none":"1.5px solid #C8E0EF",background:pat===k?C.gd:"transparent",color:pat===k?"#fff":C.ts,cursor:running?"not-allowed":"pointer",opacity:running&&pat!==k?.5:1,transition:"all .2s"}}>{v.label}</button>)}
            </div>
            <div style={{position:"relative",width:200,height:200,margin:"0 auto 1.5rem",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg style={{position:"absolute",top:0,left:0,width:200,height:200}} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke={C.gl} strokeWidth="2"/>
                <circle cx="100" cy="100" r="90" fill="none" stroke={C.gm} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={arc} transform="rotate(-90 100 100)" style={{transition:"stroke-dashoffset .85s linear"}}/>
              </svg>
              <div style={{width:140,height:140,borderRadius:"50%",background:C.gb,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transform:`scale(${scale})`,transition:`transform ${count||1}s ease-in-out`,zIndex:2}}>
                <div style={{fontSize:13,fontWeight:500,color:C.gk,fontFamily:"sans-serif",letterSpacing:".03em",marginBottom:2}}>{curPhase}</div>
                <div style={{fontSize:46,color:C.tx,lineHeight:1,fontWeight:400}}>{count??"—"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:"1.5rem"}}>
              {p.counts.map((_,i)=><div key={i} style={{height:4,flex:1,maxWidth:60,borderRadius:2,background:i<pi?C.gm:i===pi&&running?C.gd:C.gl,transition:"background .3s"}}/>)}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:"1rem"}}>
              <button onClick={()=>{setSnd(s=>!s);sndRef.current=!snd;}} style={{width:42,height:42,borderRadius:"50%",border:`1.5px solid ${snd?C.gm:"#C8E0EF"}`,background:"transparent",color:snd?C.gk:C.ts,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{snd?"🔕":"🔔"}</button>
              <button onClick={running?()=>stop(false):start} style={{padding:"12px 44px",fontSize:15,fontWeight:500,fontFamily:"sans-serif",background:running?"transparent":C.gd,color:running?C.ts:"#fff",border:running?"1.5px solid #C8E0EF":"none",borderRadius:999,cursor:"pointer",transition:"all .2s"}}>{running?"Stop":"Start"}</button>
            </div>
            <div style={{textAlign:"center",fontSize:12,color:C.ts,fontFamily:"sans-serif",lineHeight:1.6,padding:"0 .5rem"}}>{tip}</div>
          </>:
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:".75rem",padding:".75rem 0 .25rem"}}>
            <div style={{width:70,height:70,borderRadius:"50%",background:C.gb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>💙</div>
            <div style={{fontSize:24,color:C.tx,fontWeight:400}}>{sess>=5?"Five sessions! 🌟":"Well done."}</div>
            <div style={{fontSize:13,color:C.ts,fontFamily:"sans-serif",lineHeight:1.65,maxWidth:260}}>{MSGS[Math.min(sess-1,MSGS.length-1)]}</div>
            <button onClick={again} style={{marginTop:".5rem",padding:"11px 32px",fontSize:14,fontWeight:500,fontFamily:"sans-serif",background:C.gd,color:"#fff",border:"none",borderRadius:999,cursor:"pointer"}}>Breathe again</button>
          </div>}
        </div>
        <div style={{textAlign:"center",marginTop:"1rem",fontSize:11,color:C.tf,fontFamily:"sans-serif"}}>ShiftRelease™ · BreathLoop™ · Made for nurses, by a nurse.</div>
      </div>
    </div>
  );
}
