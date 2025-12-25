// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "encrypted-types/EncryptedTypes.sol";

/// @title Bounzy - Privacy-Preserving Whistleblower Platform
/// @notice Multi-campaign bounty system using FHE for encrypted evidence
contract Bounzy is ZamaEthereumConfig {
    
    // ============ Enums ============
    
    enum EvidenceStatus {
        PENDING,
        VALIDATED,
        DECLINED,
        CLAIMED
    }

    // ============ Structs ============
    
    struct Campaign {
        address owner;              // Compliance officer
        string name;                // Company name
        euint8 minSeverity;         // Minimum severity threshold (encrypted)
        uint256 bountyPool;         // ETH in pool
        uint256 expiryDate;
        uint32 evidenceCount;
        bool active;
    }

    struct Evidence {
        uint32 campaignId;
        address submitter;          // Anonymous wallet
        euint256 evidenceHash;      // File hash (encrypted)
        euint8 severity;            // Severity 1-10 (encrypted)
        euint64 bountyAmount;       // Set by validator (encrypted)
        euint256 encryptedDescription; // Description preview (encrypted, 32 bytes)
        EvidenceStatus status;
        uint256 timestamp;
        bool severityDecryptable;
        bool bountyDecryptable;
        bool descriptionDecryptable;
        string declinedReason;      // Stored permanently when declined
    }

    // ============ State Variables ============
    
    uint32 public campaignCounter;
    uint32 public evidenceCounter;

    mapping(uint32 => Campaign) public campaigns;
    mapping(uint32 => Evidence) public evidences;
    mapping(address => uint32[]) public submitterEvidence;
    mapping(uint32 => uint32[]) public campaignEvidence;

    // ============ Events ============
    
    event CampaignCreated(
        uint32 indexed campaignId,
        address indexed owner,
        string name,
        uint256 bountyPool,
        uint256 expiryDate
    );

    event EvidenceSubmitted(
        uint32 indexed evidenceId,
        uint32 indexed campaignId,
        address indexed submitter,
        uint256 timestamp
    );

    event SeverityDecryptionRequested(uint32 indexed evidenceId);
    event DescriptionDecryptionRequested(uint32 indexed evidenceId);
    
    event EvidenceValidated(
        uint32 indexed evidenceId,
        uint32 indexed campaignId
    );

    event EvidenceDeclined(
        uint32 indexed evidenceId,
        uint32 indexed campaignId,
        string reason
    );

    event BountyDecryptionRequested(uint32 indexed evidenceId);

    event BountyClaimed(
        uint32 indexed evidenceId,
        address indexed submitter,
        uint256 amount
    );

    event CampaignFunded(uint32 indexed campaignId, uint256 amount);

    // ============ Errors ============
    
    error NotCampaignOwner();
    error CampaignNotActive();
    error CampaignExpired();
    error InvalidCampaignId();
    error InvalidEvidenceId();
    error EvidenceNotPending();
    error EvidenceNotValidated();
    error NotEvidenceSubmitter();
    error AlreadyClaimed();
    error InsufficientBountyPool();
    error InvalidDecryptionProof();
    error SeverityBelowThreshold();

    // ============ Modifiers ============
    
    modifier onlyCampaignOwner(uint32 campaignId) {
        if (campaigns[campaignId].owner != msg.sender) revert NotCampaignOwner();
        _;
    }

    modifier validCampaign(uint32 campaignId) {
        if (campaignId == 0 || campaignId > campaignCounter) revert InvalidCampaignId();
        if (!campaigns[campaignId].active) revert CampaignNotActive();
        if (block.timestamp > campaigns[campaignId].expiryDate) revert CampaignExpired();
        _;
    }

    modifier validEvidence(uint32 evidenceId) {
        if (evidenceId == 0 || evidenceId > evidenceCounter) revert InvalidEvidenceId();
        _;
    }

    // ============ Campaign Functions ============

    /// @notice Create a new whistleblower campaign
    /// @param minSeverityInput Encrypted minimum severity threshold
    /// @param inputProof Zero-knowledge proof for the encrypted input
    /// @param name Campaign/company name
    /// @param durationDays Duration in days
    function createCampaign(
        externalEuint8 minSeverityInput,
        bytes calldata inputProof,
        string calldata name,
        uint256 durationDays
    ) external payable returns (uint32 campaignId) {
        require(msg.value > 0, "Must fund bounty pool");
        require(durationDays > 0, "Duration must be positive");

        euint8 minSeverity = FHE.fromExternal(minSeverityInput, inputProof);

        campaignCounter++;
        campaignId = campaignCounter;

        campaigns[campaignId] = Campaign({
            owner: msg.sender,
            name: name,
            minSeverity: minSeverity,
            bountyPool: msg.value,
            expiryDate: block.timestamp + (durationDays * 1 days),
            evidenceCount: 0,
            active: true
        });

        // Allow contract to use the encrypted value
        FHE.allowThis(minSeverity);
        FHE.allow(minSeverity, msg.sender);

        emit CampaignCreated(
            campaignId,
            msg.sender,
            name,
            msg.value,
            campaigns[campaignId].expiryDate
        );
    }

    /// @notice Fund an existing campaign
    function fundCampaign(uint32 campaignId) 
        external 
        payable 
        validCampaign(campaignId) 
    {
        campaigns[campaignId].bountyPool += msg.value;
        emit CampaignFunded(campaignId, msg.value);
    }

    // ============ Evidence Functions ============

    /// @notice Submit encrypted evidence anonymously
    /// @param campaignId Target campaign
    /// @param evidenceHashInput Encrypted hash of evidence file
    /// @param severityInput Encrypted severity rating (1-10)
    /// @param descriptionInput Encrypted description preview (32 bytes)
    /// @param inputProof Zero-knowledge proof for inputs
    function submitEvidence(
        uint32 campaignId,
        externalEuint256 evidenceHashInput,
        externalEuint8 severityInput,
        externalEuint256 descriptionInput,
        bytes calldata inputProof
    ) external validCampaign(campaignId) returns (uint32 evidenceId) {
        
        euint256 evidenceHash = FHE.fromExternal(evidenceHashInput, inputProof);
        euint8 severity = FHE.fromExternal(severityInput, inputProof);
        euint256 encryptedDescription = FHE.fromExternal(descriptionInput, inputProof);

        evidenceCounter++;
        evidenceId = evidenceCounter;

        evidences[evidenceId] = Evidence({
            campaignId: campaignId,
            submitter: msg.sender,
            evidenceHash: evidenceHash,
            severity: severity,
            bountyAmount: FHE.asEuint64(0),
            encryptedDescription: encryptedDescription,
            status: EvidenceStatus.PENDING,
            timestamp: block.timestamp,
            severityDecryptable: false,
            bountyDecryptable: false,
            descriptionDecryptable: false,
            declinedReason: ""
        });

        submitterEvidence[msg.sender].push(evidenceId);
        campaignEvidence[campaignId].push(evidenceId);
        campaigns[campaignId].evidenceCount++;

        // Grant permissions
        FHE.allowThis(evidenceHash);
        FHE.allowThis(severity);
        FHE.allowThis(encryptedDescription);
        FHE.allow(evidenceHash, campaigns[campaignId].owner);
        FHE.allow(severity, campaigns[campaignId].owner);
        FHE.allow(encryptedDescription, campaigns[campaignId].owner);
        FHE.allow(evidenceHash, msg.sender);
        FHE.allow(severity, msg.sender);
        FHE.allow(encryptedDescription, msg.sender);

        emit EvidenceSubmitted(evidenceId, campaignId, msg.sender, block.timestamp);
    }

    // ============ Validation Functions ============

    /// @notice Request severity decryption for review (Compliance Officer)
    function requestSeverityDecryption(uint32 evidenceId)
        external
        validEvidence(evidenceId)
        onlyCampaignOwner(evidences[evidenceId].campaignId)
    {
        Evidence storage evidence = evidences[evidenceId];
        require(evidence.status == EvidenceStatus.PENDING, "Not pending");
        
        FHE.makePubliclyDecryptable(evidence.severity);
        evidence.severityDecryptable = true;
        
        emit SeverityDecryptionRequested(evidenceId);
    }

    /// @notice Request description decryption for review (Compliance Officer)
    function requestDescriptionDecryption(uint32 evidenceId)
        external
        validEvidence(evidenceId)
        onlyCampaignOwner(evidences[evidenceId].campaignId)
    {
        Evidence storage evidence = evidences[evidenceId];
        require(evidence.status == EvidenceStatus.PENDING, "Not pending");
        
        FHE.makePubliclyDecryptable(evidence.encryptedDescription);
        evidence.descriptionDecryptable = true;
        
        emit DescriptionDecryptionRequested(evidenceId);
    }

    /// @notice Validate evidence and set bounty amount (Compliance Officer)
    /// @param evidenceId Evidence to validate
    /// @param severityClear Decrypted severity value
    /// @param bountyAmountInput Encrypted bounty amount
    /// @param inputProof Proof for bounty input
    /// @param decryptionProof KMS proof for severity decryption
    function validateEvidence(
        uint32 evidenceId,
        uint8 severityClear,
        externalEuint64 bountyAmountInput,
        bytes calldata inputProof,
        bytes calldata decryptionProof
    )
        external
        validEvidence(evidenceId)
        onlyCampaignOwner(evidences[evidenceId].campaignId)
    {
        Evidence storage evidence = evidences[evidenceId];
        require(evidence.status == EvidenceStatus.PENDING, "Not pending");
        require(evidence.severityDecryptable, "Request decryption first");

        // Verify the decryption proof
        bytes32[] memory handlesList = new bytes32[](1);
        handlesList[0] = FHE.toBytes32(evidence.severity);
        bytes memory abiEncodedCleartexts = abi.encode(severityClear);
        FHE.checkSignatures(handlesList, abiEncodedCleartexts, decryptionProof);

        // NOTE: Severity threshold enforcement is human-verified by the validator
        // The validator reviews the decrypted severity in the UI before approving.
        // 
        // TODO: For production, implement Gateway async callback for cryptographic enforcement:
        //   1. Compute: ebool meetsThreshold = FHE.ge(severity, campaign.minSeverity)
        //   2. Request: Gateway.requestDecryption(meetsThreshold, callback)
        //   3. Enforce: Reject in callback if thresholdMet == false
        // See: https://docs.zama.ai/protocol for Gateway integration

        // Set the bounty amount
        euint64 bountyAmount = FHE.fromExternal(bountyAmountInput, inputProof);
        evidence.bountyAmount = bountyAmount;
        evidence.status = EvidenceStatus.VALIDATED;

        // Grant bounty access to submitter
        FHE.allowThis(bountyAmount);
        FHE.allow(bountyAmount, evidence.submitter);
        FHE.allow(bountyAmount, msg.sender);

        emit EvidenceValidated(evidenceId, evidence.campaignId);
    }

    /// @notice Decline evidence submission (Compliance Officer)
    /// @param evidenceId Evidence to decline
    /// @param reason Reason for declining
    function declineEvidence(
        uint32 evidenceId,
        string calldata reason
    )
        external
        validEvidence(evidenceId)
        onlyCampaignOwner(evidences[evidenceId].campaignId)
    {
        Evidence storage evidence = evidences[evidenceId];
        require(evidence.status == EvidenceStatus.PENDING, "Not pending");

        evidence.status = EvidenceStatus.DECLINED;
        evidence.declinedReason = reason;

        emit EvidenceDeclined(evidenceId, evidence.campaignId, reason);
    }

    // ============ Claim Functions ============

    /// @notice Request bounty decryption (Whistleblower)
    function requestBountyDecryption(uint32 evidenceId)
        external
        validEvidence(evidenceId)
    {
        Evidence storage evidence = evidences[evidenceId];
        require(msg.sender == evidence.submitter, "Not submitter");
        require(evidence.status == EvidenceStatus.VALIDATED, "Not validated");

        FHE.makePubliclyDecryptable(evidence.bountyAmount);
        evidence.bountyDecryptable = true;

        emit BountyDecryptionRequested(evidenceId);
    }

    /// @notice Claim bounty with decryption proof (Whistleblower)
    /// @param evidenceId Evidence to claim bounty for
    /// @param bountyClear Decrypted bounty amount
    /// @param decryptionProof KMS proof for bounty decryption
    function claimBounty(
        uint32 evidenceId,
        uint64 bountyClear,
        bytes calldata decryptionProof
    )
        external
        validEvidence(evidenceId)
    {
        Evidence storage evidence = evidences[evidenceId];
        require(msg.sender == evidence.submitter, "Not submitter");
        require(evidence.status == EvidenceStatus.VALIDATED, "Not validated");
        require(evidence.bountyDecryptable, "Request decryption first");

        // Verify the decryption proof
        bytes32[] memory handlesList = new bytes32[](1);
        handlesList[0] = FHE.toBytes32(evidence.bountyAmount);
        bytes memory abiEncodedCleartexts = abi.encode(bountyClear);
        FHE.checkSignatures(handlesList, abiEncodedCleartexts, decryptionProof);

        // Check campaign has sufficient funds
        Campaign storage campaign = campaigns[evidence.campaignId];
        if (campaign.bountyPool < bountyClear) revert InsufficientBountyPool();

        // Update state
        evidence.status = EvidenceStatus.CLAIMED;
        campaign.bountyPool -= bountyClear;

        // Transfer bounty
        (bool success, ) = payable(evidence.submitter).call{value: bountyClear}("");
        require(success, "Transfer failed");

        emit BountyClaimed(evidenceId, evidence.submitter, bountyClear);
    }

    // ============ View Functions ============

    function getCampaign(uint32 campaignId) external view returns (
        address owner,
        string memory name,
        uint256 bountyPool,
        uint256 expiryDate,
        uint32 evidenceCount,
        bool active
    ) {
        Campaign storage c = campaigns[campaignId];
        return (c.owner, c.name, c.bountyPool, c.expiryDate, c.evidenceCount, c.active);
    }

    function getEvidence(uint32 evidenceId) external view returns (
        uint32 campaignId,
        address submitter,
        EvidenceStatus status,
        uint256 timestamp,
        bool severityDecryptable,
        bool bountyDecryptable,
        bool descriptionDecryptable
    ) {
        Evidence storage e = evidences[evidenceId];
        return (e.campaignId, e.submitter, e.status, e.timestamp, e.severityDecryptable, e.bountyDecryptable, e.descriptionDecryptable);
    }

    function getSubmitterEvidenceIds(address submitter) external view returns (uint32[] memory) {
        return submitterEvidence[submitter];
    }

    function getCampaignEvidenceIds(uint32 campaignId) external view returns (uint32[] memory) {
        return campaignEvidence[campaignId];
    }

    /// @notice Get the decline reason for a declined evidence
    /// @param evidenceId The evidence ID
    /// @return The decline reason string (empty if not declined)
    function getDeclinedReason(uint32 evidenceId) 
        external 
        view 
        validEvidence(evidenceId) 
        returns (string memory) 
    {
        return evidences[evidenceId].declinedReason;
    }

    function getActiveCampaigns() external view returns (uint32[] memory) {
        uint32 count = 0;
        for (uint32 i = 1; i <= campaignCounter; i++) {
            if (campaigns[i].active && block.timestamp <= campaigns[i].expiryDate) {
                count++;
            }
        }

        uint32[] memory activeCampaigns = new uint32[](count);
        uint32 index = 0;
        for (uint32 i = 1; i <= campaignCounter; i++) {
            if (campaigns[i].active && block.timestamp <= campaigns[i].expiryDate) {
                activeCampaigns[index] = i;
                index++;
            }
        }

        return activeCampaigns;
    }

    /// @notice Get the encrypted severity handle for an evidence (for publicDecrypt)
    /// @param evidenceId The evidence ID
    /// @return The bytes32 handle of the encrypted severity
    function getEvidenceSeverityHandle(uint32 evidenceId) 
        external 
        view 
        validEvidence(evidenceId) 
        returns (bytes32) 
    {
        return FHE.toBytes32(evidences[evidenceId].severity);
    }

    /// @notice Get the encrypted bounty handle for an evidence (for publicDecrypt)
    /// @param evidenceId The evidence ID
    /// @return The bytes32 handle of the encrypted bounty amount
    function getEvidenceBountyHandle(uint32 evidenceId) 
        external 
        view 
        validEvidence(evidenceId) 
        returns (bytes32) 
    {
        return FHE.toBytes32(evidences[evidenceId].bountyAmount);
    }

    /// @notice Get the encrypted description handle for an evidence (for publicDecrypt)
    /// @param evidenceId The evidence ID
    /// @return The bytes32 handle of the encrypted description
    function getDescriptionHandle(uint32 evidenceId) 
        external 
        view 
        validEvidence(evidenceId) 
        returns (bytes32) 
    {
        return FHE.toBytes32(evidences[evidenceId].encryptedDescription);
    }

    // ============ Admin Functions ============

    /// @notice Deactivate a campaign (Campaign Owner only)
    function deactivateCampaign(uint32 campaignId) 
        external 
        onlyCampaignOwner(campaignId) 
    {
        campaigns[campaignId].active = false;
    }

    /// @notice Withdraw remaining funds from expired/deactivated campaign
    function withdrawCampaignFunds(uint32 campaignId)
        external
        onlyCampaignOwner(campaignId)
    {
        Campaign storage campaign = campaigns[campaignId];
        require(
            !campaign.active || block.timestamp > campaign.expiryDate,
            "Campaign still active"
        );

        uint256 amount = campaign.bountyPool;
        campaign.bountyPool = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
