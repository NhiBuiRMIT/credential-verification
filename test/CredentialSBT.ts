import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("CredentialSBT", function () {
  const SAMPLE_IPFS_HASH = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

  async function deployFixture() {
    const [owner, issuer, graduate, verifier] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("CredentialSBT");
    const credentialSBT = await factory.deploy();
    await credentialSBT.waitForDeployment();
    return { credentialSBT, owner, issuer, graduate, verifier };
  }

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      const { credentialSBT } = await deployFixture();
      expect(await credentialSBT.name()).to.equal("CredentialSBT");
      expect(await credentialSBT.symbol()).to.equal("CSBT");
    });
  });

  describe("Issuer Management", function () {
    it("Owner can authorize an issuer", async function () {
      const { credentialSBT, issuer } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      expect(await credentialSBT.isAuthorizedIssuer(issuer.address)).to.equal(true);
    });

    it("Owner can revoke an issuer", async function () {
      const { credentialSBT, issuer } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.revokeIssuer(issuer.address);
      expect(await credentialSBT.isAuthorizedIssuer(issuer.address)).to.equal(false);
    });

    it("Non-owner cannot authorize an issuer", async function () {
      const { credentialSBT, issuer, verifier } = await deployFixture();
      await expect(
        credentialSBT.connect(verifier).authorizeIssuer(issuer.address)
      ).to.be.revert(ethers);
    });
  });

  describe("Issue Credential", function () {
    it("Authorized issuer can issue a credential", async function () {
      const { credentialSBT, issuer, graduate } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.connect(issuer).issueCredential(graduate.address, SAMPLE_IPFS_HASH);
      const tokens = await credentialSBT.getHolderTokens(graduate.address);
      expect(tokens.length).to.equal(1);
    });

    it("Unauthorized address cannot issue a credential", async function () {
      const { credentialSBT, graduate, verifier } = await deployFixture();
      await expect(
        credentialSBT.connect(verifier).issueCredential(graduate.address, SAMPLE_IPFS_HASH)
      ).to.be.revertedWith("Not an authorized issuer");
    });

    it("Cannot issue with empty IPFS hash", async function () {
      const { credentialSBT, issuer, graduate } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await expect(
        credentialSBT.connect(issuer).issueCredential(graduate.address, "")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
  });

  describe("Verify Credential", function () {
    it("Valid credential returns correct data", async function () {
      const { credentialSBT, issuer, graduate } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.connect(issuer).issueCredential(graduate.address, SAMPLE_IPFS_HASH);
      const [valid, ipfsHash, holder] = await credentialSBT.verifyCredential(0);
      expect(valid).to.equal(true);
      expect(ipfsHash).to.equal(SAMPLE_IPFS_HASH);
      expect(holder).to.equal(graduate.address);
    });

    it("Verifying non-existent token should revert", async function () {
      const { credentialSBT } = await deployFixture();
      await expect(credentialSBT.verifyCredential(999)).to.be.revert(ethers);
    });
  });

  describe("Revoke Credential", function () {
    it("Issuer can revoke and credential becomes invalid", async function () {
      const { credentialSBT, issuer, graduate } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.connect(issuer).issueCredential(graduate.address, SAMPLE_IPFS_HASH);
      await credentialSBT.connect(issuer).revokeCredential(0);
      const [valid] = await credentialSBT.verifyCredential(0);
      expect(valid).to.equal(false);
    });

    it("Cannot revoke an already revoked credential", async function () {
      const { credentialSBT, issuer, graduate } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.connect(issuer).issueCredential(graduate.address, SAMPLE_IPFS_HASH);
      await credentialSBT.connect(issuer).revokeCredential(0);
      await expect(
        credentialSBT.connect(issuer).revokeCredential(0)
      ).to.be.revertedWith("Already revoked");
    });

    it("Unauthorized address cannot revoke", async function () {
      const { credentialSBT, issuer, graduate, verifier } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.connect(issuer).issueCredential(graduate.address, SAMPLE_IPFS_HASH);
      await expect(
        credentialSBT.connect(verifier).revokeCredential(0)
      ).to.be.revertedWith("Not an authorized issuer");
    });
  });

  describe("Soulbound — Non-transferable", function () {
    it("transferFrom should revert", async function () {
      const { credentialSBT, issuer, graduate, verifier } = await deployFixture();
      await credentialSBT.authorizeIssuer(issuer.address);
      await credentialSBT.connect(issuer).issueCredential(graduate.address, SAMPLE_IPFS_HASH);
      await expect(
        credentialSBT.connect(graduate).transferFrom(graduate.address, verifier.address, 0)
      ).to.be.revertedWith("SBT: tokens are non-transferable");
    });
  });
});