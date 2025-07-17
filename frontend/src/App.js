import React, { useState } from "react";

function App() {
  const [provider, setProvider] = useState("azure");
  const [service, setService] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    const response = await fetch("/api/GenerateScript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, service, customPrompt }),
    });
    const data = await response.json();
    setResult(data.result || data.error || "No result");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 32 }}>
      <h1>Terraform & Terragrunt Generator</h1>
      <form onSubmit={handleGenerate}>
        <label>
          Cloud Provider:
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="azure">Azure</option>
            <option value="aws">AWS</option>
            <option value="oci">OCI</option>
          </select>
        </label>
        <br /><br />
        <label>
          Service Name:
          <input
            type="text"
            value={service}
            onChange={e => setService(e.target.value)}
            placeholder="e.g., virtual machine, s3 bucket"
            required
            style={{ width: "100%" }}
          />
        </label>
        <br /><br />
        <label>
          Custom Prompt (optional):
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="Describe how you want the scripts to be generated..."
            rows={4}
            style={{ width: "100%" }}
          />
        </label>
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      <br />
      {result && (
        <div>
          <h2>Generated Scripts</h2>
          <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 8 }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App; 