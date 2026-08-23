// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title HardWAveHardwareToken
 * @dev Decentralized Hardware Authenticity, Warranty Provenance & Repair Registry
 */
contract HardWAveHardwareToken is ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SERVICE_CENTER_ROLE = keccak256("SERVICE_CENTER_ROLE");

    uint256 private _nextTokenId;

    struct HardwareSpecs {
        string serialNumber;     // Physical Serial Number (e.g. HW-RTX3090-99824)
        string modelName;        // e.g. GeForce RTX 3090 Founders Edition
        string category;         // e.g. GPU, Motherboard, SSD, RAM
        uint256 manufactureDate; // Unix Timestamp
        address manufacturer;    // Minted by
        bool isActive;
    }

    struct RepairRecord {
        uint256 repairId;
        string componentName;    // e.g. "cooling_fan", "vrm", "vram", "pcb"
        string actionDescription;// e.g. "Replaced with OEM fan assembly"
        bool isReplaced;         // true if part replaced, false if minor repair
        string ipfsEvidenceHash; // IPFS hash for service receipt / diagnostic photo
        address technician;
        uint256 timestamp;
    }

    // Mapping from Token ID => Hardware Specs
    mapping(uint256 => HardwareSpecs) public hardwareRegistry;

    // Mapping from Serial Number (string) => Token ID
    mapping(string => uint256) public serialToTokenId;

    // Mapping from Token ID => Array of Repair Records
    mapping(uint256 => RepairRecord[]) private _repairHistories;

    // Events
    event HardwareMinted(
        uint256 indexed tokenId,
        string indexed serialNumber,
        string modelName,
        address indexed manufacturer,
        string tokenURI
    );

    event RepairLogged(
        uint256 indexed tokenId,
        uint256 repairId,
        string componentName,
        bool isReplaced,
        string ipfsEvidenceHash,
        address indexed technician,
        uint256 timestamp
    );

    constructor() ERC721("HardWAve Hardware Provenance", "HWAVE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
        _grantRole(SERVICE_CENTER_ROLE, msg.sender);
        _nextTokenId = 1;
    }

    /**
     * @notice Mint a new Hardware Provenance Token (Manufacturer Only)
     */
    function registerHardware(
        address to,
        string memory serialNumber,
        string memory modelName,
        string memory category,
        string memory metadataURI
    ) external onlyRole(MANUFACTURER_ROLE) whenNotPaused returns (uint256) {
        require(bytes(serialNumber).length > 0, "Serial number required");
        require(serialToTokenId[serialNumber] == 0, "Serial already registered");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        hardwareRegistry[tokenId] = HardwareSpecs({
            serialNumber: serialNumber,
            modelName: modelName,
            category: category,
            manufactureDate: block.timestamp,
            manufacturer: msg.sender,
            isActive: true
        });

        serialToTokenId[serialNumber] = tokenId;

        emit HardwareMinted(tokenId, serialNumber, modelName, msg.sender, metadataURI);
        return tokenId;
    }

    /**
     * @notice Log maintenance/repair event for a specific sub-component (Service Center Only)
     */
    function logRepair(
        uint256 tokenId,
        string memory componentName,
        string memory actionDescription,
        bool isReplaced,
        string memory ipfsEvidenceHash
    ) external onlyRole(SERVICE_CENTER_ROLE) whenNotPaused {
        require(_ownerOf(tokenId) != address(0), "Hardware does not exist");
        require(bytes(componentName).length > 0, "Component name required");

        uint256 newRepairId = _repairHistories[tokenId].length + 1;

        RepairRecord memory record = RepairRecord({
            repairId: newRepairId,
            componentName: componentName,
            actionDescription: actionDescription,
            isReplaced: isReplaced,
            ipfsEvidenceHash: ipfsEvidenceHash,
            technician: msg.sender,
            timestamp: block.timestamp
        });

        _repairHistories[tokenId].push(record);

        emit RepairLogged(
            tokenId,
            newRepairId,
            componentName,
            isReplaced,
            ipfsEvidenceHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Get all repair history records for a hardware unit
     */
    function getRepairHistory(uint256 tokenId) external view returns (RepairRecord[] memory) {
        require(_ownerOf(tokenId) != address(0), "Hardware does not exist");
        return _repairHistories[tokenId];
    }

    /**
     * @notice Fetch hardware token ID by Serial Number
     */
    function getTokenIdBySerial(string memory serialNumber) external view returns (uint256) {
        uint256 tokenId = serialToTokenId[serialNumber];
        require(tokenId != 0, "Serial not found");
        return tokenId;
    }

    // Required overrides for Solidity inheritance
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
