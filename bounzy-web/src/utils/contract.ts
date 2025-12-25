export const BOUNZY_ADDRESS = "0x1af8c2c3ff2427223113ccd9a60cad027cf2fdd0";

export const BOUNZY_ABI = [
    // Campaign Functions
    {
        inputs: [
            { internalType: "externalEuint8", name: "minSeverityInput", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
            { internalType: "string", name: "name", type: "string" },
            { internalType: "uint256", name: "durationDays", type: "uint256" }
        ],
        name: "createCampaign",
        outputs: [{ internalType: "uint32", name: "campaignId", type: "uint32" }],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "campaignId", type: "uint32" }],
        name: "fundCampaign",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    // Evidence Functions
    {
        inputs: [
            { internalType: "uint32", name: "campaignId", type: "uint32" },
            { internalType: "externalEuint256", name: "evidenceHashInput", type: "bytes32" },
            { internalType: "externalEuint8", name: "severityInput", type: "bytes32" },
            { internalType: "externalEuint256", name: "descriptionInput", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" }
        ],
        name: "submitEvidence",
        outputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "requestSeverityDecryption",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "requestDescriptionDecryption",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint32", name: "evidenceId", type: "uint32" },
            { internalType: "uint8", name: "severityClear", type: "uint8" },
            { internalType: "externalEuint64", name: "bountyAmountInput", type: "bytes32" },
            { internalType: "bytes", name: "inputProof", type: "bytes" },
            { internalType: "bytes", name: "decryptionProof", type: "bytes" }
        ],
        name: "validateEvidence",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint32", name: "evidenceId", type: "uint32" },
            { internalType: "string", name: "reason", type: "string" }
        ],
        name: "declineEvidence",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "requestBountyDecryption",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint32", name: "evidenceId", type: "uint32" },
            { internalType: "uint64", name: "bountyClear", type: "uint64" },
            { internalType: "bytes", name: "decryptionProof", type: "bytes" }
        ],
        name: "claimBounty",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    // View Functions
    {
        inputs: [{ internalType: "uint32", name: "campaignId", type: "uint32" }],
        name: "getCampaign",
        outputs: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "string", name: "name", type: "string" },
            { internalType: "uint256", name: "bountyPool", type: "uint256" },
            { internalType: "uint256", name: "expiryDate", type: "uint256" },
            { internalType: "uint32", name: "evidenceCount", type: "uint32" },
            { internalType: "bool", name: "active", type: "bool" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "getEvidence",
        outputs: [
            { internalType: "uint32", name: "campaignId", type: "uint32" },
            { internalType: "address", name: "submitter", type: "address" },
            { internalType: "uint8", name: "status", type: "uint8" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
            { internalType: "bool", name: "severityDecryptable", type: "bool" },
            { internalType: "bool", name: "bountyDecryptable", type: "bool" },
            { internalType: "bool", name: "descriptionDecryptable", type: "bool" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "campaignCounter",
        outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "evidenceCounter",
        outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "submitter", type: "address" }],
        name: "getSubmitterEvidenceIds",
        outputs: [{ internalType: "uint32[]", name: "", type: "uint32[]" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "campaignId", type: "uint32" }],
        name: "getCampaignEvidenceIds",
        outputs: [{ internalType: "uint32[]", name: "", type: "uint32[]" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getActiveCampaigns",
        outputs: [{ internalType: "uint32[]", name: "", type: "uint32[]" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "getEvidenceSeverityHandle",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "getEvidenceBountyHandle",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "getDeclinedReason",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint32", name: "evidenceId", type: "uint32" }],
        name: "getDescriptionHandle",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function"
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint32", name: "campaignId", type: "uint32" },
            { indexed: true, internalType: "address", name: "owner", type: "address" },
            { indexed: false, internalType: "string", name: "name", type: "string" },
            { indexed: false, internalType: "uint256", name: "bountyPool", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "expiryDate", type: "uint256" }
        ],
        name: "CampaignCreated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint32", name: "evidenceId", type: "uint32" },
            { indexed: true, internalType: "uint32", name: "campaignId", type: "uint32" },
            { indexed: true, internalType: "address", name: "submitter", type: "address" },
            { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
        ],
        name: "EvidenceSubmitted",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint32", name: "evidenceId", type: "uint32" },
            { indexed: true, internalType: "uint32", name: "campaignId", type: "uint32" }
        ],
        name: "EvidenceValidated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint32", name: "evidenceId", type: "uint32" },
            { indexed: true, internalType: "uint32", name: "campaignId", type: "uint32" },
            { indexed: false, internalType: "string", name: "reason", type: "string" }
        ],
        name: "EvidenceDeclined",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint32", name: "evidenceId", type: "uint32" },
            { indexed: true, internalType: "address", name: "submitter", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "BountyClaimed",
        type: "event"
    }
] as const;

export const EvidenceStatus = {
    PENDING: 0,
    VALIDATED: 1,
    DECLINED: 2,
    CLAIMED: 3
} as const;
