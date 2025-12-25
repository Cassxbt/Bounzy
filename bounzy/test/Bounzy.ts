import { expect } from "chai";
import hre from "hardhat";

/**
 * Bounzy Smart Contract Test Suite
 * 
 * Tests contract structure, ABI correctness, and basic functionality.
 * Full FHE encryption/decryption is tested on Sepolia testnet via frontend.
 */

describe("Bounzy Contract", function () {
    let bounzy: any;
    let owner: any;
    let whistleblower: any;

    before(async function () {
        const publicClient = await hre.viem.getPublicClient();
        const [ownerWallet, whistleblowerWallet] = await hre.viem.getWalletClients();

        owner = ownerWallet;
        whistleblower = whistleblowerWallet;

        // Deploy contract
        bounzy = await hre.viem.deployContract("Bounzy");
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(bounzy.address).to.exist;
            expect(bounzy.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        });

        it("Should initialize counters to zero", async function () {
            const campaignCount = await bounzy.read.campaignCounter();
            const evidenceCount = await bounzy.read.evidenceCounter();

            expect(campaignCount.toString()).to.equal("0");
            expect(evidenceCount.toString()).to.equal("0");
        });
    });

    describe("View Functions", function () {
        it("Should return empty active campaigns initially", async function () {
            const activeCampaigns = await bounzy.read.getActiveCampaigns();
            expect(activeCampaigns.length).to.equal(0);
        });

        it("Should return empty evidence for random address", async function () {
            const randomAddress = "0x0000000000000000000000000000000000000001";
            const evidenceIds = await bounzy.read.getSubmitterEvidenceIds([randomAddress]);
            expect(evidenceIds.length).to.equal(0);
        });

        it("Should return empty campaign evidence for invalid ID", async function () {
            const evidenceIds = await bounzy.read.getCampaignEvidenceIds([999]);
            expect(evidenceIds.length).to.equal(0);
        });
    });

    describe("ABI Structure - Campaign Functions", function () {
        it("Should have createCampaign function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "createCampaign"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have fundCampaign function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "fundCampaign"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have deactivateCampaign function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "deactivateCampaign"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have withdrawCampaignFunds function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "withdrawCampaignFunds"
            );
            expect(hasFunc).to.be.true;
        });
    });

    describe("ABI Structure - Evidence Functions", function () {
        it("Should have submitEvidence function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "submitEvidence"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have requestSeverityDecryption function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "requestSeverityDecryption"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have validateEvidence function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "validateEvidence"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have declineEvidence function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "declineEvidence"
            );
            expect(hasFunc).to.be.true;
        });
    });

    describe("ABI Structure - Claim Functions", function () {
        it("Should have requestBountyDecryption function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "requestBountyDecryption"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have claimBounty function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "claimBounty"
            );
            expect(hasFunc).to.be.true;
        });
    });

    describe("ABI Structure - Getter Functions", function () {
        it("Should have getCampaign function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "getCampaign"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have getEvidence function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "getEvidence"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have getEvidenceSeverityHandle function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "getEvidenceSeverityHandle"
            );
            expect(hasFunc).to.be.true;
        });

        it("Should have getEvidenceBountyHandle function", async function () {
            const hasFunc = bounzy.abi.some((item: any) =>
                item.type === "function" && item.name === "getEvidenceBountyHandle"
            );
            expect(hasFunc).to.be.true;
        });
    });

    describe("Events", function () {
        it("Should have CampaignCreated event", async function () {
            const hasEvent = bounzy.abi.some((item: any) =>
                item.type === "event" && item.name === "CampaignCreated"
            );
            expect(hasEvent).to.be.true;
        });

        it("Should have EvidenceSubmitted event", async function () {
            const hasEvent = bounzy.abi.some((item: any) =>
                item.type === "event" && item.name === "EvidenceSubmitted"
            );
            expect(hasEvent).to.be.true;
        });

        it("Should have EvidenceValidated event", async function () {
            const hasEvent = bounzy.abi.some((item: any) =>
                item.type === "event" && item.name === "EvidenceValidated"
            );
            expect(hasEvent).to.be.true;
        });

        it("Should have EvidenceDeclined event", async function () {
            const hasEvent = bounzy.abi.some((item: any) =>
                item.type === "event" && item.name === "EvidenceDeclined"
            );
            expect(hasEvent).to.be.true;
        });

        it("Should have BountyClaimed event", async function () {
            const hasEvent = bounzy.abi.some((item: any) =>
                item.type === "event" && item.name === "BountyClaimed"
            );
            expect(hasEvent).to.be.true;
        });
    });

    describe("Custom Errors", function () {
        it("Should have NotCampaignOwner error", async function () {
            const hasError = bounzy.abi.some((item: any) =>
                item.type === "error" && item.name === "NotCampaignOwner"
            );
            expect(hasError).to.be.true;
        });

        it("Should have CampaignNotActive error", async function () {
            const hasError = bounzy.abi.some((item: any) =>
                item.type === "error" && item.name === "CampaignNotActive"
            );
            expect(hasError).to.be.true;
        });

        it("Should have InvalidCampaignId error", async function () {
            const hasError = bounzy.abi.some((item: any) =>
                item.type === "error" && item.name === "InvalidCampaignId"
            );
            expect(hasError).to.be.true;
        });

        it("Should have InsufficientBountyPool error", async function () {
            const hasError = bounzy.abi.some((item: any) =>
                item.type === "error" && item.name === "InsufficientBountyPool"
            );
            expect(hasError).to.be.true;
        });
    });

    describe("ETH Handling", function () {
        it("Should accept direct ETH transfers via receive()", async function () {
            const publicClient = await hre.viem.getPublicClient();
            const initialBalance = await publicClient.getBalance({
                address: bounzy.address
            });

            await owner.sendTransaction({
                to: bounzy.address,
                value: 1000000000000000n // 0.001 ETH
            });

            const newBalance = await publicClient.getBalance({
                address: bounzy.address
            });
            expect(newBalance > initialBalance).to.be.true;
        });
    });
});
