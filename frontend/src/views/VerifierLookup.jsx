import { useState, useEffect } from "react";

export default function VerifierLookup({ readContract }) {
  const [tokenId, setTokenId] = useState("");
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState(null);

  // Support ?view=verify&tokenId=X deep links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "verify" && params.get("tokenId")) {
      setTokenId(params.get("tokenId"));
    }
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!tokenId.trim()) { setError("Enter a token ID."); return; }
    setError(null);
    setResult(null);
    setMeta(null);
    setLoading(true);
    try {
      const { valid, ipfsHash, holder } = await readContract.verifyCredential(Number(tokenId));
      setResult({ valid, ipfsHash, holder });

      // Fetch IPFS metadata
      setMetaLoading(true);
      try {
        const res = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
        const data = await res.json();
        setMeta(data);
      } catch {
        setMeta({ error: "Metadata could not be fetched from IPFS." });
      } finally {
        setMetaLoading(false);
      }
    } catch (err) {
      if (err.message.includes("Token does not exist")) {
        setError("No credential found for this token ID.");
      } else {
        setError(err.reason || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if tokenId pre-populated from URL
  useEffect(() => {
    if (tokenId && readContract) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readContract]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-badge verifier-badge">VERIFIER</div>
        <h2>Verify a Credential</h2>
        <p className="view-sub">No account required — verification is public and on-chain</p>
      </div>

      <div className="card">
        <form onSubmit={handleVerify} className="form inline-form">
          <div className="field flex-field">
            <label>Token ID</label>
            <input
              type="number"
              placeholder="Enter token ID (e.g. 0)"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
              disabled={loading}
              min="0"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !readContract}>
            {loading ? <span className="spinner" /> : "Verify"}
          </button>
        </form>

        {!readContract && (
          <p className="hint">Connect your wallet above to enable verification — or use a read-only RPC by connecting MetaMask.</p>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className={`result-card ${result.valid ? "result-valid" : "result-revoked"}`}>
          <div className="result-banner">
            {result.valid
              ? <><span className="result-icon">✓</span> Credential is VALID</>
              : <><span className="result-icon">✗</span> Credential is REVOKED</>
            }
          </div>

          <div className="result-details">
            <div className="detail-row">
              <span className="detail-label">Token ID</span>
              <span className="detail-val mono">#{tokenId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Holder</span>
              <a
                href={`https://sepolia.etherscan.io/address/${result.holder}`}
                target="_blank"
                rel="noreferrer"
                className="detail-val mono link"
              >
                {result.holder}
              </a>
            </div>
            <div className="detail-row">
              <span className="detail-label">IPFS Hash</span>
              <a
                href={`https://ipfs.io/ipfs/${result.ipfsHash}`}
                target="_blank"
                rel="noreferrer"
                className="detail-val mono link small"
              >
                {result.ipfsHash}
              </a>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className={`detail-val status-text ${result.valid ? "valid" : "revoked"}`}>
                {result.valid ? "Active" : "Revoked — this credential has been invalidated"}
              </span>
            </div>
          </div>

          {/* IPFS Metadata */}
          <div className="meta-section">
            <div className="meta-title">Credential Metadata</div>
            {metaLoading && <div className="meta-loading"><span className="spinner small" /> Fetching from IPFS...</div>}
            {meta && !meta.error && (
              <table className="meta-table">
                <tbody>
                  {Object.entries(meta).map(([k, v]) => (
                    <tr key={k}>
                      <td className="meta-key">{k}</td>
                      <td className="meta-val">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {meta?.error && <p className="meta-error">{meta.error}</p>}
          </div>

          <div className="result-footer">
            <a
              href={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${tokenId}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline small"
            >
              View on Etherscan ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
