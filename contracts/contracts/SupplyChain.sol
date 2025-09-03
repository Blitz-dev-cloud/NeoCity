// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SupplyChain is AccessControl, ReentrancyGuard {
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    enum BatchStatus { Created, InTransit, Delivered, Sold, Recalled }

    struct ProductBatch {
        string batchId;
        string productName;
        address owner;
        string ipfsHash;
        BatchStatus status;
        uint256 createdAt;
        uint256 quantity;
        string location;
        address[] ownershipHistory;
    }

    struct AuditEntry {
        address auditor;
        string findings;
        uint256 timestamp;
        bool passed;
    }

    mapping(string => ProductBatch) public batches;
    mapping(string => AuditEntry[]) public auditHistory;
    mapping(address => string[]) public ownerBatches;

    event BatchRegistered(string indexed batchId, address indexed owner, string productName, uint256 quantity);
    event OwnershipTransferred(string indexed batchId, address indexed from, address indexed to, uint256 timestamp);
    event BatchStatusUpdated(string indexed batchId, BatchStatus newStatus, uint256 timestamp);
    event AuditCompleted(string indexed batchId, address indexed auditor, bool passed, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    modifier onlyBatchOwner(string memory batchId) {
        require(batches[batchId].owner == msg.sender, "Not batch owner");
        _;
    }

    modifier batchExists(string memory batchId) {
        require(bytes(batches[batchId].batchId).length > 0, "Batch does not exist");
        _;
    }

    function registerFarmer(address farmer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, farmer);
    }

    function registerVendor(address vendor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VENDOR_ROLE, vendor);
    }

    function registerBatch(
        string memory batchId,
        string memory productName,
        string memory ipfsHash,
        uint256 quantity,
        string memory location
    ) external {
        require(hasRole(FARMER_ROLE, msg.sender) || hasRole(VENDOR_ROLE, msg.sender), "Unauthorized");
        require(bytes(batches[batchId].batchId).length == 0, "Batch already exists");
        require(bytes(batchId).length > 0, "Invalid batch ID");
        require(quantity > 0, "Invalid quantity");

        batches[batchId] = ProductBatch({
            batchId: batchId,
            productName: productName,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            status: BatchStatus.Created,
            createdAt: block.timestamp,
            quantity: quantity,
            location: location,
            ownershipHistory: new address[](0)
        });

        batches[batchId].ownershipHistory.push(msg.sender);
        ownerBatches[msg.sender].push(batchId);

        emit BatchRegistered(batchId, msg.sender, productName, quantity);
    }

    function transferOwnership(string memory batchId, address newOwner)
        external
        onlyBatchOwner(batchId)
        batchExists(batchId)
        nonReentrant
    {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != batches[batchId].owner, "Already owner");

        address previousOwner = batches[batchId].owner;
        batches[batchId].owner = newOwner;
        batches[batchId].ownershipHistory.push(newOwner);
        ownerBatches[newOwner].push(batchId);

        emit OwnershipTransferred(batchId, previousOwner, newOwner, block.timestamp);
    }

    function updateBatchStatus(string memory batchId, BatchStatus newStatus)
        external
        onlyBatchOwner(batchId)
        batchExists(batchId)
    {
        require(newStatus != batches[batchId].status, "Status unchanged");

        batches[batchId].status = newStatus;

        emit BatchStatusUpdated(batchId, newStatus, block.timestamp);
    }

    function updateBatchLocation(string memory batchId, string memory newLocation)
        external
        onlyBatchOwner(batchId)
        batchExists(batchId)
    {
        require(bytes(newLocation).length > 0, "Invalid location");
        batches[batchId].location = newLocation;
    }

    function conductAudit(
        string memory batchId,
        string memory findings,
        bool passed
    ) external onlyRole(AUDITOR_ROLE) batchExists(batchId) {
        auditHistory[batchId].push(AuditEntry({
            auditor: msg.sender,
            findings: findings,
            timestamp: block.timestamp,
            passed: passed
        }));

        emit AuditCompleted(batchId, msg.sender, passed, block.timestamp);
    }

    function getBatch(string memory batchId)
        external
        view
        batchExists(batchId)
        returns (
            string memory productName,
            address owner,
            string memory ipfsHash,
            BatchStatus status,
            uint256 createdAt,
            uint256 quantity,
            string memory location
        )
    {
        ProductBatch storage batch = batches[batchId];
        return (
            batch.productName,
            batch.owner,
            batch.ipfsHash,
            batch.status,
            batch.createdAt,
            batch.quantity,
            batch.location
        );
    }

    function getOwnershipHistory(string memory batchId)
        external
        view
        batchExists(batchId)
        returns (address[] memory)
    {
        return batches[batchId].ownershipHistory;
    }

    function getAuditHistory(string memory batchId)
        external
        view
        batchExists(batchId)
        returns (AuditEntry[] memory)
    {
        return auditHistory[batchId];
    }

    function getOwnerBatches(address owner) external view returns (string[] memory) {
        return ownerBatches[owner];
    }
}