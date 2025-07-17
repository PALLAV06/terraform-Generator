import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";
import servicesData from "./services.json";

const PROVIDER_MAP = {
  azure: "azurerm",
  aws: "aws",
  oci: "oci",
};

function App() {
  const [provider, setProvider] = useState("azure");
  const [service, setService] = useState("");
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [customService, setCustomService] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [terraform, setTerraform] = useState("");
  const [terragrunt, setTerragrunt] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [error, setError] = useState("");

  // Use static services list for instant dropdown
  useEffect(() => {
    setServices(servicesData[provider] || []);
    setService("");
    setServiceSearch("");
    setCustomService("");
  }, [provider]);

  const filteredServices = services.filter(s =>
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const parseScripts = (raw) => {
    const tfMatch = raw.match(/```(?:hcl|terraform)?([\s\S]*?)```/i);
    const tgMatch = raw.match(/Terragrunt configuration file:[\s\S]*?```hcl([\s\S]*?)```/i);
    let terraform = tfMatch ? tfMatch[1].trim() : "";
    let terragrunt = tgMatch ? tgMatch[1].trim() : "";
    if (!terragrunt) {
      const allBlocks = [...raw.matchAll(/```(?:hcl|terraform)?([\s\S]*?)```/gi)];
      if (allBlocks.length > 1) {
        terragrunt = allBlocks[1][1].trim();
      }
    }
    return { terraform, terragrunt };
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setShowOutput(false);
    setTerraform("");
    setTerragrunt("");
    setError("");
    let selectedService = customService.trim() ? customService.trim() : service;
    try {
      const response = await fetch("/api/GenerateScript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, service: selectedService, customPrompt }),
      });
      const data = await response.json();
      setResult(data.result || data.error || "No result");
      if (data.result) {
        const { terraform, terragrunt } = parseScripts(data.result);
        setTerraform(terraform);
        setTerragrunt(terragrunt);
        setShowOutput(true);
      } else {
        setError(data.error || "No result returned from backend.");
      }
    } catch (err) {
      setError("Failed to generate scripts. Please try again.");
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
              value={serviceSearch}
              onChange={e => {
                setServiceSearch(e.target.value);
                setService("");
                setCustomService("");
              }}
              placeholder="Search or type to filter services..."
              style={{ marginBottom: 8 }}
            />
            <select
              value={service}
              onChange={e => {
                setService(e.target.value);
                setCustomService("");
              }}
              required={!customService}
              disabled={filteredServices.length === 0}
              style={{ marginBottom: 8 }}
            >
              <option value="">{filteredServices.length === 0 ? "No services found" : "Select a service"}</option>
              {filteredServices.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                value={customService}
                onChange={e => {
                  setCustomService(e.target.value);
                  setService("");
                }}
                placeholder="Or enter a custom service name..."
                style={{ width: "100%" }}
              />
            </div>
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
          <button type="submit" disabled={loading || (!service && !customService)} className="app-btn">
            {loading ? <span className="loader"></span> : "Generate"}
          </button>
        </form>
        {error && <div className="error-msg">{error}</div>}
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
              {terraform || "No Terraform script found."}
            </SyntaxHighlighter>
          </div>
          <div className="output-card">
            <div className="output-header">
              <span role="img" aria-label="terragrunt">🟩</span>
              <span>Terragrunt Script</span>
              <button className="copy-btn" onClick={() => handleCopy(terragrunt)}>Copy</button>
              <button className="download-btn" onClick={() => handleDownload(terragrunt, "terragrunt.hcl")}>Download</button>
            </div>
            <SyntaxHighlighter language="hcl" style={vscDarkPlus} className="code-block">
              {terragrunt || "No Terragrunt script found."}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 