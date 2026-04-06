"use client";

import { useState } from "react";
import Link from "next/link";

export default function LinkPSNPage() {
  const [npssoToken, setNpssoToken] = useState("");

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-text-secondary hover:text-foreground transition">← Back</Link>
        <h2 className="text-2xl font-bold">Link PlayStation</h2>
      </div>

      <div className="card-glass p-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20 mb-6">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-text-secondary">
            PSN uses an unofficial API. Your NPSSO token is used only to fetch your data and is never stored on our servers.
          </p>
        </div>

        <h3 className="font-semibold mb-3">How to get your NPSSO token</h3>
        <ol className="text-sm text-text-secondary space-y-2 mb-6 list-decimal list-inside">
          <li>Sign in to <a href="https://store.playstation.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">store.playstation.com</a> in your browser</li>
          <li>
            Visit{" "}
            <a href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
              ca.account.sony.com/api/v1/ssocookie
            </a>
          </li>
          <li>Copy the <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-xs">npsso</code> value from the JSON response</li>
        </ol>

        <input
          type="text"
          value={npssoToken}
          onChange={(e) => setNpssoToken(e.target.value)}
          placeholder="Paste your NPSSO token here"
          className="w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-foreground text-sm mb-4"
        />

        <button disabled className="btn-primary w-full py-3.5 opacity-50 cursor-not-allowed">
          Import Coming Soon
        </button>

        <p className="text-xs text-text-muted mt-3 text-center">
          PSN import is under development. Steam import is available now.
        </p>
      </div>
    </div>
  );
}
