// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CredentialSBT is ERC721, Ownable {

    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _credentialHashes;
    mapping(uint256 => bool) private _revoked;
    mapping(address => uint256[]) private _holderTokens;
    mapping(address => bool) private _authorizedIssuers;

    event CredentialIssued(uint256 indexed tokenId, address indexed recipient, string ipfsHash);
    event CredentialRevoked(uint256 indexed tokenId, address indexed revokedBy);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() ERC721("CredentialSBT", "CSBT") Ownable(msg.sender) {}

    modifier onlyIssuer() {
        require(
            _authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Not an authorized issuer"
        );
        _;
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        _authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) external onlyOwner {
        _authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return _authorizedIssuers[issuer];
    }

    function issueCredential(address recipient, string memory ipfsHash) external onlyIssuer returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(recipient, tokenId);
        _credentialHashes[tokenId] = ipfsHash;
        _holderTokens[recipient].push(tokenId);

        emit CredentialIssued(tokenId, recipient, ipfsHash);
        return tokenId;
    }

    function revokeCredential(uint256 tokenId) external onlyIssuer {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!_revoked[tokenId], "Already revoked");
        _revoked[tokenId] = true;
        emit CredentialRevoked(tokenId, msg.sender);
    }

    function verifyCredential(uint256 tokenId) external view returns (bool valid, string memory ipfsHash, address holder) {
        address tokenOwner = _ownerOf(tokenId);
        require(tokenOwner != address(0), "Token does not exist");
        valid = !_revoked[tokenId];
        ipfsHash = _credentialHashes[tokenId];
        holder = tokenOwner;
    }

    function getHolderTokens(address holder) external view returns (uint256[] memory) {
        return _holderTokens[holder];
    }

    function isRevoked(uint256 tokenId) external view returns (bool) {
        return _revoked[tokenId];
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("SBT: tokens are non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("SBT: tokens are non-transferable");
    }
}
