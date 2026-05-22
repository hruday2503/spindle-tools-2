import { useState, useRef, useEffect, useCallback } from "react";
import SpindleLogo from "../components/SpindleLogo.jsx";
import PerspectiveLines from "../components/PerspectiveLines.jsx";
import { API, REQUIRED_COLUMNS, PAGE_BG } from "../constants/index.js";


function StepBadge({ n, label, active, done }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, opacity:active||done?1:0.32, transition:"opacity 0.3s" }}>
      <div style={{
        width:30, height:30, borderRadius:"50%", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        background: done ? "linear-gradient(135deg,#22c55e,#16a34a)"
                  : active ? "linear-gradient(135deg,#f97316,#ea580c)"
                  : "rgba(255,255,255,0.07)",
        border: done||active ? "none" : "1px solid rgba(255,255,255,0.12)",
        boxShadow: active ? "0 0 16px rgba(249,115,22,0.5)" : done ? "0 0 12px rgba(34,197,94,0.4)" : "none",
        transition:"all 0.35s", fontSize:12, fontWeight:700,
        fontFamily:"'Space Grotesk',sans-serif", color:"#fff",
      }}>
        {done ? "✓" : n}
      </div>
      <span style={{
        fontSize:11, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif",
        letterSpacing:"0.1em", textTransform:"uppercase",
        color: active?"#f97316": done?"#86efac":"#8070a0",
      }}>{label}</span>
    </div>
  );
}

function StepLine({ done }) {
  return <div style={{ width:36, height:1, background:done?"rgba(34,197,94,0.5)":"rgba(255,255,255,0.1)", transition:"background 0.5s", flexShrink:0 }}/>;
}

function JsonViewer({ json, maxH=380 }) {
  const text = typeof json==="string" ? json : JSON.stringify(json, null, 2);
  return (
    <div style={{
      background:"rgba(4,1,12,0.96)", borderRadius:10, padding:"16px",
      fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:12, lineHeight:1.85,
      border:"1px solid rgba(167,139,250,0.1)", maxHeight:maxH, overflowY:"auto",
      boxShadow:"inset 0 2px 16px rgba(0,0,0,0.6)",
    }}>
      {text.split("\n").map((l,i) => {
        let c = "#d4c5e8";
        if (/^\s*"[^"]+"\s*:/.test(l)) c = "#c084fc";
        if (/:\s*"[^"]*"/.test(l))     c = "#86efac";
        if (/:\s*-?[\d.]+/.test(l) && !/[{}[\],]/.test(l.replace(/:\s*-?[\d.]+/,""))) c = "#f97316";
        if (/:\s*(true|false|null)/.test(l)) c = "#38bdf8";
        return <div key={i} style={{ color:c, whiteSpace:"pre" }}>{l}</div>;
      })}
    </div>
  );
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(typeof value==="string" ? value : JSON.stringify(value,null,2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={handle} style={{
      display:"flex", alignItems:"center", gap:6,
      background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
      border:`1px solid ${copied?"rgba(34,197,94,0.4)":"rgba(255,255,255,0.12)"}`,
      borderRadius:7, padding:"6px 14px", cursor:"pointer",
      color: copied?"#86efac":"#c4b5d4", fontSize:12,
      fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, transition:"all 0.25s",
    }}>
      {copied
        ? <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3 3 7-7" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      }
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Spinner() {
  return <div style={{ width:15, height:15, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", animation:"toolSpin 0.7s linear infinite", flexShrink:0 }}/>;
}

function BackendStatus() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    const check = () =>
      fetch(`${API}/`, { signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? setStatus("online") : setStatus("offline"))
        .catch(() => setStatus("offline"));
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, []);
  const color=status==="online"?"#22c55e":status==="offline"?"#ef4444":"#f59e0b";
  const label=status==="online"?"":status==="offline"?"":"Checking…";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.04)", border:`1px solid ${color}33`, borderRadius:20, padding:"4px 12px" }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:color, animation:status==="online"?"toolBlink 2.5s ease-in-out infinite":"none" }}/>
      <span style={{ fontSize:10, fontWeight:700, color, letterSpacing:"0.1em" }}>{label}</span>
    </div>
  );
}

// ─── Panel wrapper ────────────────────────────────────────────────────
const cardStyle = (extra={}) => ({
  background:"rgba(35,14,55,0.72)", borderRadius:18, padding:"28px 30px",
  border:"1px solid rgba(167,139,250,0.13)", backdropFilter:"blur(14px)",
  marginBottom:20, boxShadow:"0 8px 48px rgba(0,0,0,0.35)",
  ...extra,
});

function SectionLabel({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
      <div style={{ width:3, height:20, background:"linear-gradient(180deg,#f97316,#a78bfa)", borderRadius:2 }}/>
      <span style={{ fontSize:15, fontWeight:700, color:"#f0e6ff", fontFamily:"'Space Grotesk',sans-serif" }}>{children}</span>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const dropRef   = useRef(null);
  const fileInput = useRef(null);
  const jsonInput = useRef(null);

  const [step,       setStep]       = useState(0);
  const [file,       setFile]       = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [inputJson,  setInputJson]  = useState(null);
  const [error,      setError]      = useState(null);
  const [converting, setConverting] = useState(false);
  const [j2eFile,    setJ2eFile]    = useState(null);
  const [j2eLoading, setJ2eLoading] = useState(false);
  const [j2eError,   setJ2eError]   = useState(null);
  const [mounted,    setMounted]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("excel"); // "excel" | "json"

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx","xls"].includes(ext)) { setError("Please upload an Excel file (.xlsx or .xls)."); return; }
    setFile(f); setInputJson(null); setError(null); setStep(0);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ── Excel → JSON ───────────────────────────────────────────────────────────
  const OFFLINE_MSG = `Backend not reachable. Start it first:\n\n  cd spindle-tools/backend\n  python3 -m pip install -r requirements.txt\n  python3 -m uvicorn main:app --reload --port 8000`;

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true); setError(null); setInputJson(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      let res;
      try { res = await fetch(`${API}/excel-to-json/`, { method:"POST", body:fd }); }
      catch { throw new Error(OFFLINE_MSG); }
      let data;
      try { data = await res.json(); }
      catch { throw new Error(`Server error (HTTP ${res.status}) — check backend logs.`); }
      if (data.error) throw new Error(data.error);
      setInputJson(data); setStep(1);
    } catch(err) { setError(err.message || "Conversion failed."); }
    finally { setConverting(false); }
  };

  // ── JSON → Excel ───────────────────────────────────────────────────────────
  const handleJ2e = async () => {
    if (!j2eFile) return;
    setJ2eLoading(true); setJ2eError(null);
    try {
      const fd = new FormData();
      fd.append("file", j2eFile);
      let res;
      try { res = await fetch(`${API}/json-to-excel/`, { method:"POST", body:fd }); }
      catch { throw new Error(OFFLINE_MSG); }
      if (!res.ok) { const t = await res.text().catch(()=>""); throw new Error(`Server error (HTTP ${res.status})${t?": "+t:""}`); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "vrp_output.xlsx"; a.click();
      URL.revokeObjectURL(url);
    } catch(err) { setJ2eError(err.message || "Conversion failed."); }
    finally { setJ2eLoading(false); }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(inputJson,null,2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "vrp_input.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setFile(null); setInputJson(null); setError(null); setStep(0); };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", ...PAGE_BG, fontFamily:"'Space Grotesk','Exo 2',sans-serif", color:"#e2d9f3", position:"relative", overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Exo+2:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <PerspectiveLines/>

      {/* Ambient glow */}
      <div style={{ position:"fixed", top:"12%", right:"6%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", bottom:"18%", left:"4%", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,250,0.1) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

      {/* ── Navbar ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:200,
        background:"rgba(29, 6, 33, 0.95)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(167,139,250,0.13)",
        padding:"0 32px", height:62,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 1px 32px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <SpindleLogo height={30}/>
          <div style={{ width:1, height:22, background:"rgba(249,115,22,0.4)" }}/>
          <div>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.16em", color:"#f97316", textTransform:"uppercase" }}>Tools</div>
            <div style={{ fontSize:10, color:"#5a4870", letterSpacing:"0.1em", marginTop:1 }}></div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <BackendStatus/>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        maxWidth:820, margin:"0 auto", padding:"52px 32px 0",
        position:"relative", zIndex:1, textAlign:"center",
        opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(20px)",
        transition:"opacity 0.6s ease, transform 0.6s ease",
      }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:18, background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:20, padding:"5px 16px" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa", animation:"toolBlink 2.5s ease-in-out infinite" }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:"0.14em" }}>SPINDLE QUANTUM · CONVERTER TOOL</span>
        </div>

        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(28px,4.5vw,44px)", fontWeight:700, color:"#f0e6ff", margin:"0 0 14px", lineHeight:1.1, letterSpacing:"-0.01em" }}>
          Excel <span style={{ color:"#f97316" }}>↔</span> Solver JSON
        </h1>
        <p style={{ fontSize:14, color:"#7060a0", lineHeight:1.8, fontFamily:"'Exo 2',sans-serif", maxWidth:520, margin:"0 auto 40px", fontWeight:300 }}>
          Upload your logistics Excel workbook using the VRP template, validate it, and receive solver-ready JSON — or convert output JSON back to an Excel report.
        </p>

        {/* Tab switcher */}
        <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:4, marginBottom:32 }}>
          {[["excel"," Excel → JSON"],["json"," JSON → Excel"]].map(([id,label]) => (
            <button key={id} onClick={()=>setActiveTab(id)} style={{
              padding:"9px 24px", borderRadius:9, border:"none",
              background: activeTab===id ? "linear-gradient(135deg,#f97316,#ea580c)" : "transparent",
              color: activeTab===id ? "#fff" : "#8070a0",
              fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
              letterSpacing:"0.04em", cursor:"pointer", transition:"all 0.2s",
              boxShadow: activeTab===id ? "0 0 16px rgba(249,115,22,0.4)" : "none",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth:820, margin:"0 auto", padding:"0 32px 80px", position:"relative", zIndex:1 }}>

        {/* ═══ Excel → JSON ═══ */}
        {activeTab==="excel" && (<>

          {/* Download Template — centred above Step 1 */}
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <button
              onClick={() => window.open(`${API}/download-template/`, "_blank")}
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.28)",
                borderRadius:9, padding:"10px 22px", cursor:"pointer",
                color:"#c4b5d4", fontSize:13, fontFamily:"'Space Grotesk',sans-serif",
                fontWeight:600, letterSpacing:"0.04em", transition:"all 0.25s",
                boxShadow:"0 0 0 0 rgba(167,139,250,0)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(167,139,250,0.2)"; e.currentTarget.style.color="#f0e6ff"; e.currentTarget.style.boxShadow="0 0 20px rgba(167,139,250,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(167,139,250,0.1)"; e.currentTarget.style.color="#c4b5d4"; e.currentTarget.style.boxShadow="0 0 0 0 rgba(167,139,250,0)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 3v9m0 0L6 9m3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 14h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Download Template
            </button>
          </div>

          {/* Panel 1: Upload */}
          <div style={cardStyle({ border:`1px solid ${error?"rgba(239,68,68,0.35)":dragging?"rgba(249,115,22,0.55)":"rgba(167,139,250,0.13)"}`, boxShadow:dragging?"0 0 48px rgba(249,115,22,0.14)":"0 8px 48px rgba(0,0,0,0.35)" })}>
            <SectionLabel>Upload Excel File (upload excel according to the given template)</SectionLabel>

            {/* Drop zone */}
            <div ref={dropRef}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={onDrop}
              onClick={()=>fileInput.current?.click()}
              style={{
                border:`2px dashed ${dragging?"rgba(249,115,22,0.7)":file?"rgba(34,197,94,0.45)":"rgba(167,139,250,0.22)"}`,
                borderRadius:12, padding:"40px 24px", textAlign:"center", cursor:"pointer",
                background:dragging?"rgba(249,115,22,0.05)":file?"rgba(34,197,94,0.03)":"rgba(255,255,255,0.015)",
                transition:"all 0.25s",
              }}
              onMouseEnter={e=>{if(!file&&!dragging)e.currentTarget.style.borderColor="rgba(167,139,250,0.45)";}}
              onMouseLeave={e=>{if(!file&&!dragging)e.currentTarget.style.borderColor="rgba(167,139,250,0.22)";}}>
              <input ref={fileInput} type="file" accept=".xlsx,.xls" style={{ display:"none" }} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
              {file ? (
                <div>
                  <div style={{ fontSize:36, marginBottom:10 }}>📊</div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#86efac", marginBottom:4 }}>{file.name}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{(file.size/1024).toFixed(1)} KB · Click to replace</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:38, marginBottom:12, opacity:0.4 }}>📂</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#c4b5d4", marginBottom:6 }}>{dragging?"Drop to upload":"Drag & drop your Excel file"}</div>
                  <div style={{ fontSize:11, color:"#5a4870" }}>.xlsx · .xls — or click to browse</div>
                </div>
              )}
            </div>

            {/* Required columns */}
            <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(167,139,250,0.04)", borderRadius:8, border:"1px solid rgba(167,139,250,0.09)" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#6050a0", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Required columns</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {REQUIRED_COLUMNS.map(col => (
                  <span key={col} style={{ fontSize:10, background:"rgba(167,139,250,0.09)", border:"1px solid rgba(167,139,250,0.14)", borderRadius:4, padding:"2px 7px", color:"#8060a0", fontFamily:"'JetBrains Mono',monospace" }}>{col}</span>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop:14, padding:"14px 18px", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, fontSize:13, color:"#fca5a5" }}>
                <div style={{ fontWeight:700, marginBottom:6 }}>⚠ Error</div>
                <pre style={{ margin:0, whiteSpace:"pre-wrap", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#fca5a5", background:"rgba(0,0,0,0.25)", padding:"10px 12px", borderRadius:6, border:"1px solid rgba(239,68,68,0.2)" }}>{error}</pre>
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop:20, display:"flex", gap:10, flexWrap:"wrap" }}>
              <button onClick={handleConvert} disabled={!file||converting} style={{
                display:"flex", alignItems:"center", gap:8,
                background:file&&!converting?"linear-gradient(135deg,#f97316,#ea580c)":"rgba(255,255,255,0.05)",
                border:"none", borderRadius:9, padding:"11px 26px",
                color:file&&!converting?"#fff":"#3a2a50",
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em",
                cursor:file&&!converting?"pointer":"not-allowed",
                boxShadow:file?"0 0 20px rgba(249,115,22,0.35)":"none", transition:"all 0.25s",
              }}
                onMouseEnter={e=>{if(file&&!converting){e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow="0 0 32px rgba(249,115,22,0.55)";}}}
                onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=file?"0 0 20px rgba(249,115,22,0.35)":"none";}}>
                {converting
                  ? <><Spinner/> Validating & Converting…</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Validate & Convert Excel</>
                }
              </button>
              {file && !converting && (
                <button onClick={reset} style={{ background:"none", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"10px 16px", cursor:"pointer", color:"#5a4870", fontSize:12, fontFamily:"'Space Grotesk',sans-serif", transition:"color 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#c4b5d4"}
                  onMouseLeave={e=>e.currentTarget.style.color="#5a4870"}>Reset</button>
              )}
            </div>
          </div>

          {/* Panel 2: Result */}
          {step>=1 && inputJson && (
            <div style={cardStyle({ border:"1px solid rgba(34,197,94,0.22)", animation:"toolSlideUp 0.4s ease forwards" })}>

              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, padding:"13px 18px", borderRadius:10, background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ fontSize:20 }}>✅</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#86efac", marginBottom:2 }}>Validation passed — solver JSON ready</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>
                    {inputJson.plan?.jobs?.length ?? 0} jobs · {inputJson.fleet?.vehicles?.length ?? 0} vehicles
                  </div>
                </div>
              </div>

              <SectionLabel>JSON (solver format)</SectionLabel>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
                {[
                  { label:"Total Jobs",               val: inputJson.plan?.jobs?.length ?? 0,                                                                           color:"#c084fc" },
                { label:"Total Vehicles",                  val: inputJson.fleet?.vehicles?.length ?? 0,                                                                      color:"#f97316" },
                { label:"Pickup Jobs",               val: (inputJson.plan?.jobs??[]).filter(j => Array.isArray(j.pickups) && j.pickups.length > 0 && (!Array.isArray(j.deliveries) || j.deliveries.length === 0)).length, color:"#38bdf8" },
                { label:"Delivery Jobs",             val: (inputJson.plan?.jobs??[]).filter(j => Array.isArray(j.deliveries) && j.deliveries.length > 0 && (!Array.isArray(j.pickups) || j.pickups.length === 0)).length, color:"#86efac" },
                { label:"Pickup-Delivery Jobs",      val: (inputJson.plan?.jobs??[]).filter(j => Array.isArray(j.pickups) && j.pickups.length > 0 && Array.isArray(j.deliveries) && j.deliveries.length > 0).length,      color:"#fbbf24" },
                 ].map(({ label, val, color }) => (
                <div key={label} style={{
                  background:"rgba(255,255,255,0.04)", borderRadius:10,
                  padding:"14px 10px", border:"1px solid rgba(255,255,255,0.07)",
                  textAlign:"center", transition:"border 0.2s, background 0.2s",
                 }}
                  onMouseEnter={e => { e.currentTarget.style.border=`1px solid ${color}44`; e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.border="1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
                >
                    <div style={{ fontSize:9, color:"#5a4870", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6, lineHeight:1.4 }}>{label}</div>
                    <div style={{ fontSize:26, fontWeight:700, color, fontFamily:"'Exo 2',sans-serif", lineHeight:1 }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <CopyBtn value={inputJson}/>
              </div>
              <JsonViewer json={inputJson} maxH={420}/>

              <div style={{ marginTop:14 }}>
                <button onClick={downloadJson} style={{
                  display:"flex", alignItems:"center", gap:6,
                  background:"linear-gradient(135deg,#f97316,#ea580c)",
                  border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer",
                  color:"#fff", fontSize:12, fontFamily:"'Space Grotesk',sans-serif",
                  fontWeight:700, letterSpacing:"0.06em",
                  boxShadow:"0 0 14px rgba(249,115,22,0.4)", transition:"all 0.2s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="0 0 24px rgba(249,115,22,0.65)"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="0 0 14px rgba(249,115,22,0.4)"}>
                  <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><path d="M9 3v9m0 0L6 9m3 3 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 14h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  Download vrp_input.json
                </button>
              </div>
            </div>
          )}
        </>)}

        {/* ═══ JSON → Excel ═══ */}
        {activeTab==="json" && (
          <div style={cardStyle({ border:"1px solid rgba(167,139,250,0.18)" })}>
            <SectionLabel>Upload Output JSON</SectionLabel>
            <p style={{ fontSize:13, color:"#7060a0", fontFamily:"'Exo 2',sans-serif", margin:"0 0 20px", lineHeight:1.7 }}>
              Upload the output JSON here to generate an Excel report with <strong style={{ fontWeight:600, color:"#c4b5d4" }}>Stops</strong>, <strong style={{ fontWeight:600, color:"#c4b5d4" }}>Trip Summary</strong>, and <strong style={{ fontWeight:600, color:"#c4b5d4" }}>Unassigned jobs</strong>.
            </p>

            <div onClick={()=>jsonInput.current?.click()} style={{
              border:`2px dashed ${j2eFile?"rgba(34,197,94,0.45)":"rgba(167,139,250,0.22)"}`,
              borderRadius:12, padding:"40px 24px", textAlign:"center", cursor:"pointer",
              background:j2eFile?"rgba(34,197,94,0.03)":"rgba(255,255,255,0.015)",
              transition:"all 0.25s", marginBottom:16,
            }}
              onMouseEnter={e=>{if(!j2eFile)e.currentTarget.style.borderColor="rgba(167,139,250,0.45)";}}
              onMouseLeave={e=>{if(!j2eFile)e.currentTarget.style.borderColor="rgba(167,139,250,0.22)";}}>
              <input ref={jsonInput} type="file" accept=".json" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]){setJ2eFile(e.target.files[0]);setJ2eError(null);}}}/>
              {j2eFile ? (
                <div>
                  <div style={{ fontSize:36, marginBottom:10 }}>📄</div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#86efac", marginBottom:4 }}>{j2eFile.name}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{(j2eFile.size/1024).toFixed(1)} KB · Click to replace</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:36, marginBottom:12, opacity:0.4 }}>📄</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#c4b5d4", marginBottom:6 }}>Upload solver output JSON</div>
                  <div style={{ fontSize:11, color:"#5a4870" }}>Click to browse · .json</div>
                </div>
              )}
            </div>

            {j2eError && (
              <div style={{ marginBottom:14, padding:"14px 18px", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, fontSize:13, color:"#fca5a5" }}>
                <div style={{ fontWeight:700, marginBottom:6 }}>⚠ Error</div>
                <pre style={{ margin:0, whiteSpace:"pre-wrap", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#fca5a5", background:"rgba(0,0,0,0.25)", padding:"10px 12px", borderRadius:6 }}>{j2eError}</pre>
              </div>
            )}

            <button onClick={handleJ2e} disabled={!j2eFile||j2eLoading} style={{
              display:"flex", alignItems:"center", gap:8,
              background:j2eFile&&!j2eLoading?"linear-gradient(135deg,#a78bfa,#7c3aed)":"rgba(255,255,255,0.05)",
              border:"none", borderRadius:9, padding:"11px 28px",
              color:j2eFile&&!j2eLoading?"#fff":"#3a2a50",
              fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em",
              cursor:j2eFile&&!j2eLoading?"pointer":"not-allowed",
              boxShadow:j2eFile?"0 0 20px rgba(124,58,237,0.4)":"none", transition:"all 0.25s",
            }}
              onMouseEnter={e=>{if(j2eFile&&!j2eLoading){e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow="0 0 32px rgba(124,58,237,0.6)";}}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=j2eFile?"0 0 20px rgba(124,58,237,0.4)":"none";}}>
              {j2eLoading
                ? <><Spinner/> Converting to Excel…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Convert JSON → Excel Report</>
              }
            </button>
            <p style={{ fontSize:11, color:"#4a3a60", marginTop:10, fontFamily:"'Exo 2',sans-serif" }}>

            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid rgba(167,139,250,0.1)", background:"rgba(18, 3, 14, 0.9)", padding:"28px 32px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:820, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <SpindleLogo height={20}/>
            <span style={{ fontSize:11, color:"#3d2e52", fontFamily:"'Exo 2',sans-serif" }}>
              tools.spindlequantum.com · © 2026 Spindle™ Quantum Pvt. Ltd
            </span>
          </div>
          <div style={{ display:"flex", gap:20 }}>
            {[
              ["Docs",        "#"],
              ["API Pricing", "https://developers.spindlequantum.com/pricing"],
              ["Contact",     "https://spindlequantum.com/contact-us"],
              ["Main Site",   "https://spindlequantum.com"],
            ].map(([l,h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:11, color:"#4a3a60", textDecoration:"none", fontFamily:"'Space Grotesk',sans-serif", transition:"color 0.2s" }}
                onMouseEnter={e=>e.target.style.color="#c4b5d4"}
                onMouseLeave={e=>e.target.style.color="#4a3a60"}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes toolSpin    { to{transform:rotate(360deg)} }
        @keyframes toolBlink   { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes toolSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
