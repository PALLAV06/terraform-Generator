import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";

function App() {
  const [provider, setProvider] = useState("azure");
  const [service, setService] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [terraform, setTerraform] = useState("");
  const [terragrunt, setTerragrunt] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const parseScripts = (raw) => {
    // Try to split the output into Terraform and Terragrunt blocks
    const tfMatch = raw.match(/```(?:hcl|terraform)?([\s\S]*?)```/i);
    const tgMatch = raw.match(/Terragrunt configuration file:[\s\S]*?```hcl([\s\S]*?)```/i);
    return {
      terraform: tfMatch ? tfMatch[1].trim() : raw,
      terragrunt: tgMatch ? tgMatch[1].trim() : "",
    };
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setShowOutput(false);
    setTerraform("");
    setTerragrunt("");
    const response = await fetch("/api/GenerateScript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, service, customPrompt }),
    });
    const data = await response.json();
    setResult(data.result || data.error || "No result");
    if (data.result) {
      const { terraform, terragrunt } = parseScripts(data.result);
      setTerraform(terraform);
      setTerragrunt(terragrunt);
      setShowOutput(true);
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="app-bg">
      <div className="app-card fade-in">
        <header className="app-header">
          <span role="img" aria-label="cloud" className="app-logo">☁️</span>
          <h1>Terraform & Terragrunt Generator</h1>
        </header>
        <form onSubmit={handleGenerate} className="app-form">
          <label>
            Cloud Provider:
            <select value={provider} onChange={e => setProvider(e.target.value)}>
              <option value="azure">Azure</option>
              <option value="aws">AWS</option>
              <option value="oci">OCI</option>
            </select>
          </label>
          <label>
            Service Name:
            <input
              type="text"
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="e.g., virtual machine, s3 bucket"
              required
            />
          </label>
          <label>
            Custom Prompt (optional):
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Describe how you want the scripts to be generated..."
              rows={3}
            />
          </label>
          <button type="submit" disabled={loading} className="app-btn">
            {loading ? <span className="loader"></span> : "Generate"}
          </button>
        </form>
      </div>
      {showOutput && (
        <div className="output-section slide-in">
          <h2>Generated Scripts</h2>
          <div className="output-card">
            <div className="output-header">
              <span role="img" aria-label="terraform">🟦</span>
              <span>Terraform Script</span>
              <button className="copy-btn" onClick={() => handleCopy(terraform)}>Copy</button>
              <button className="download-btn" onClick={() => handleDownload(terraform, "main.tf")}>Download</button>
            </div>
            <SyntaxHighlighter language="hcl" style={vscDarkPlus} className="code-block">
              {terraform}
            </SyntaxHighlighter>
          </div>
          {terragrunt && (
            <div className="output-card">
              <div className="output-header">
                <span role="img" aria-label="terragrunt">🟩</span>
                <span>Terragrunt Script</span>
                <button className="copy-btn" onClick={() => handleCopy(terragrunt)}>Copy</button>
                <button className="download-btn" onClick={() => handleDownload(terragrunt, "terragrunt.hcl")}>Download</button>
              </div>
              <SyntaxHighlighter language="hcl" style={vscDarkPlus} className="code-block">
                {terragrunt}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 