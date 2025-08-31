import React, { useMemo, useState } from "react";

// Default export so it can be previewed directly in the canvas or dropped into a Vite app as App.tsx/App.jsx
export default function App() {
  type Format = "bin" | "hex" | "dec";
  const [format, setFormat] = useState<Format>("bin");
  const [bitsPerChar, setBitsPerChar] = useState<7 | 8>(8);
  const [autoChunk, setAutoChunk] = useState(true);
  const [input, setInput] = useState(
    // "Was ist 2 + 2?"
    "01010111 01100001 01110011 00100000 01101001 01110011 01110100 00100000 00110010 00100000 00101011 00100000 00110010 00111111"
  );

  const { decodedText, rows, invalidTokens } = useMemo(
    () => decodeInput(input, { format, bitsPerChar, autoChunk }),
    [input, format, bitsPerChar, autoChunk]
  );

  const placeholders: Record<Format, string> = {
    bin: "01010111 01100001 01110011 …",
    hex: "57 61 73 20 69 73 74 20 32 20 2b 20 32 3f",
    dec: "87 97 115 32 105 115 116 32 50 32 43 32 50 63",
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">ASCII Decoder: Binär • Hex • Dezimal</h1>
          <p className="text-sm text-gray-600 mt-2">
            Füge Werte als <b>Bits</b>, <b>Hex</b> oder <b>Dezimal</b> ein. Wir dekodieren live zu Text.
          </p>
        </header>

        <div className="grid gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Eingabeformat:</span>
            <Segmented
              options={[
                { key: "bin", label: "Binär" },
                { key: "hex", label: "Hex" },
                { key: "dec", label: "Dezimal" },
              ]}
              value={format}
              onChange={(v) => setFormat(v as Format)}
            />

            <div className="inline-flex items-center gap-2 ml-auto">
              <span className="text-sm">ASCII‑Breite:</span>
              <Segmented
                options={[
                  { key: 7, label: "7‑Bit" },
                  { key: 8, label: "8‑Bit" },
                ]}
                value={bitsPerChar}
                onChange={(v) => setBitsPerChar(v as 7 | 8)}
              />
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Eingabe</span>
            <textarea
              className="mt-2 w-full h-40 rounded-2xl border border-gray-300 p-4 focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-sm font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholders[format]}
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={autoChunk}
                onChange={(e) => setAutoChunk(e.target.checked)}
              />
              <span className="text-sm">Automatisch gruppieren (kontinuierliche Eingabe)</span>
            </label>
            <p className="text-xs text-gray-500">
              Binär: {bitsPerChar} Bits pro Zeichen • Hex: 2 Ziffern/Byte • Dezimal: 0–255 (leerzeichen-/kommagetrennt)
            </p>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-xl font-medium mb-2">Dekodierter Text</h2>
          <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
            <p className="whitespace-pre-wrap break-words text-lg">{decodedText || <span className="text-gray-400">—</span>}</p>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2">Übersicht</h3>
          <div className="overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Token</th>
                  <th className="text-left p-3 font-semibold">Bits</th>
                  <th className="text-left p-3 font-semibold">Dezimal</th>
                  <th className="text-left p-3 font-semibold">Zeichen</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={5}><span className="text-gray-400">Keine Daten</span></td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="p-3 tabular-nums">{i + 1}</td>
                      <td className={`p-3 font-mono ${r.valid ? "" : "text-red-600"}`}>{r.token}</td>
                      <td className={`p-3 font-mono ${r.valid ? "" : "text-red-600"}`}>{r.valid ? r.bits : "—"}</td>
                      <td className="p-3 tabular-nums">{r.valid ? r.dec : "—"}</td>
                      <td className="p-3 font-mono">{r.valid ? printable(r.char) : "⟂"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {invalidTokens.length > 0 && (
            <p className="mt-2 text-sm text-red-600">
              {invalidTokens.length} ungültige(r) Token. Prüfe Format, Gruppierung oder Wertebereich.
            </p>
          )}
        </section>

        <section className="text-sm text-gray-600">
          <details className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer select-none font-medium">Hinweise & Beispiele</summary>
            <ul className="list-disc ml-5 mt-3 space-y-1">
              <li>Binär erwartet {bitsPerChar}-Bit‑Gruppen. Beispiel: <code className="font-mono">01000001</code> → <code className="font-mono">A</code></li>
              <li>Hex erwartet Byte‑Paare: <code className="font-mono">41 42 43</code> → <code className="font-mono">ABC</code></li>
              <li>Dezimal erwartet Zahlen 0–255, getrennt durch Leerzeichen/Komma: <code className="font-mono">65 66 67</code></li>
              <li>Option „Automatisch gruppieren“ zerlegt kontinuierliche Eingaben (z. B. <code className="font-mono">414243</code>) entsprechend.</li>
              <li>Bei 7‑Bit ASCII sind nur Werte 0–127 gültig.</li>
            </ul>
          </details>
        </section>
      </div>
    </div>
  );
}

// ——— Helpers —————————————————————————————————————————————————————

type Row = { token: string; bits: string; dec: number; char: string; valid: boolean };

type DecodeOpts = {
  format: "bin" | "hex" | "dec";
  bitsPerChar: 7 | 8;
  autoChunk: boolean;
};

function decodeInput(raw: string, opts: DecodeOpts) {
  const { format, bitsPerChar, autoChunk } = opts;
  const rows: Row[] = [];
  const invalidTokens: string[] = [];
  let decodedText = "";

  if (format === "bin") {
    const cleaned = raw.replace(/[^01\s]/g, (m) => (/\s/.test(m) ? m : ""));
    let tokens = cleaned.trim().split(/\s+/).filter(Boolean);

    if (autoChunk && tokens.length === 1) {
      const only = tokens[0];
      const chunked: string[] = [];
      for (let i = 0; i < only.length; i += bitsPerChar) chunked.push(only.slice(i, i + bitsPerChar));
      tokens = chunked.filter((t) => t.length === bitsPerChar);
    }

    const re = bitsPerChar === 7 ? /^[01]{7}$/ : /^[01]{8}$/;
    for (const token of tokens) {
      if (!re.test(token)) {
        rows.push({ token, bits: "", dec: NaN, char: "", valid: false });
        invalidTokens.push(token);
        continue;
      }
      const dec = parseInt(token, 2);
      if (bitsPerChar === 7 && dec > 127) {
        rows.push({ token, bits: token, dec, char: "", valid: false });
        invalidTokens.push(token);
        continue;
      }
      const ch = String.fromCharCode(dec);
      rows.push({ token, bits: token, dec, char: ch, valid: true });
      decodedText += ch;
    }
  }

  if (format === "hex") {
    const cleaned = raw.replace(/[^0-9a-fA-F\s]/g, (m) => (/\s/.test(m) ? m : ""));
    let tokens = cleaned.trim().split(/\s+/).filter(Boolean);

    // If single long hex string like "414243", chunk into pairs
    if (autoChunk && tokens.length === 1) {
      const only = tokens[0];
      const chunked: string[] = [];
      for (let i = 0; i < only.length; i += 2) chunked.push(only.slice(i, i + 2));
      tokens = chunked.filter((t) => t.length === 2);
    }

    for (const token of tokens) {
      if (!/^[0-9a-fA-F]{2}$/.test(token)) {
        rows.push({ token, bits: "", dec: NaN, char: "", valid: false });
        invalidTokens.push(token);
        continue;
      }
      const dec = parseInt(token, 16);
      if (bitsPerChar === 7 && dec > 127) {
        rows.push({ token, bits: toBits(dec, 8), dec, char: "", valid: false });
        invalidTokens.push(token);
        continue;
      }
      const ch = String.fromCharCode(dec);
      rows.push({ token, bits: toBits(dec, 8), dec, char: ch, valid: true });
      decodedText += ch;
    }
  }

  if (format === "dec") {
    // Accept numbers separated by whitespace or commas/semicolons
    const cleaned = raw.replace(/[^0-9,;\s]/g, (m) => (/\s/.test(m) ? m : ""));
    let tokens = cleaned
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    for (const token of tokens) {
      if (!/^\d{1,3}$/.test(token)) {
        rows.push({ token, bits: "", dec: NaN, char: "", valid: false });
        invalidTokens.push(token);
        continue;
      }
      const dec = Number(token);
      const max = bitsPerChar === 7 ? 127 : 255;
      if (dec < 0 || dec > max) {
        rows.push({ token, bits: "", dec, char: "", valid: false });
        invalidTokens.push(token);
        continue;
      }
      const ch = String.fromCharCode(dec);
      rows.push({ token, bits: toBits(dec, 8), dec, char: ch, valid: true });
      decodedText += ch;
    }
  }

  return { decodedText, rows, invalidTokens } as const;
}

function toBits(n: number, width: number) {
  const b = n.toString(2);
  return b.padStart(width, "0");
}

function printable(ch: string) {
  if (ch === "\n") return "\\n";
  if (ch === "\r") return "\\r";
  if (ch === "\t") return "\\t";
  if (ch === " ") return "␠"; // visible space symbol
  const code = ch.charCodeAt(0);
  if (code < 32) return `CTRL(${code})`;
  return ch;
}

// ——— Small UI helper ————————————————————————————————————————————

type SegmentedOption = { key: string | number; label: string };
function Segmented({ options, value, onChange }: { options: SegmentedOption[]; value: string | number; onChange: (v: string | number) => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm">
      {options.map((opt) => (
        <button
          key={String(opt.key)}
          className={`px-3 py-1 text-sm ${String(value) === String(opt.key) ? "bg-white" : "bg-gray-100"}`}
          onClick={() => onChange(opt.key)}
          aria-pressed={String(value) === String(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
