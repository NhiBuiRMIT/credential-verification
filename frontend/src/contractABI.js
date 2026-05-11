export const CONTRACT_ABI = [
  // Events
  "event CredentialIssued(uint256 indexed tokenId, address indexed recipient, string ipfsHash)",
  "event CredentialRevoked(uint256 indexed tokenId, address indexed revokedBy)",
  "event IssuerAuthorized(address indexed issuer)",
  "event IssuerRevoked(address indexed issuer)",

  // Owner functions
  "function authorizeIssuer(address issuer) external",
  "function revokeIssuer(address issuer) external",

  // Issuer functions
  "function issueCredential(address recipient, string memory ipfsHash) external returns (uint256)",
  "function revokeCredential(uint256 tokenId) external",

  // View functions
  "function verifyCredential(uint256 tokenId) external view returns (bool valid, string memory ipfsHash, address holder)",
  "function getHolderTokens(address holder) external view returns (uint256[] memory)",
  "function isAuthorizedIssuer(address issuer) external view returns (bool)",
  "function isRevoked(uint256 tokenId) external view returns (bool)",
  "function owner() external view returns (address)",
];

// Paste your deployed contract address here (or set via .env)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
