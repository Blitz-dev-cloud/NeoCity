// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IdentityRegistry.sol";

contract Grievance is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    IdentityRegistry public identityRegistry;

    enum GrievanceStatus { Filed, UnderReview, Resolved }

    struct GrievanceRecord {
        uint256 id;
        string complainantDID;
        string title;
        string ipfsHash;
        address resolver;
        GrievanceStatus status;
        uint256 filedAt;
        string resolutionIpfsHash;
    }

    mapping(uint256 => GrievanceRecord) public grievances;
    mapping(string => uint256[]) public userGrievances;
    uint256 public grievanceCount;

    event GrievanceFiled(uint256 indexed id, string complainantDID, string title, uint256 timestamp);
    event GrievanceAssigned(uint256 indexed id, address indexed resolver, uint256 timestamp);
    event GrievanceStatusUpdated(uint256 indexed id, GrievanceStatus status, uint256 timestamp);
    event GrievanceResolved(uint256 indexed id, string resolutionIpfsHash, uint256 timestamp);

    constructor(address _identityRegistry) {
        identityRegistry = IdentityRegistry(_identityRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    // ✅ Fixed: use getIdentityOwner instead of accessing .identities(did).owner
    modifier onlyValidDID(string memory did) {
        require(identityRegistry.verifyIdentity(did), "Invalid DID");
        require(identityRegistry.getIdentityOwner(did) == msg.sender, "Not DID owner");
        _;
    }

    modifier grievanceExists(uint256 id) {
        require(id <= grievanceCount && id > 0, "Grievance does not exist");
        _;
    }

    function fileGrievance(
        string memory did,
        string memory title,
        string memory ipfsHash
    )
        external
        onlyValidDID(did)
        nonReentrant
        returns (uint256)
    {
        require(bytes(title).length > 0, "Empty title");
        require(bytes(ipfsHash).length > 0, "Empty IPFS hash");

        grievanceCount++;
        grievances[grievanceCount] = GrievanceRecord({
            id: grievanceCount,
            complainantDID: did,
            title: title,
            ipfsHash: ipfsHash,
            resolver: address(0),
            status: GrievanceStatus.Filed,
            filedAt: block.timestamp,
            resolutionIpfsHash: ""
        });

        userGrievances[did].push(grievanceCount);

        emit GrievanceFiled(grievanceCount, did, title, block.timestamp);
        return grievanceCount;
    }

    function assignGrievance(uint256 id, address resolver)
        external
        onlyRole(ADMIN_ROLE)
        grievanceExists(id)
    {
        require(hasRole(RESOLVER_ROLE, resolver), "Invalid resolver");
        require(grievances[id].resolver == address(0), "Already assigned");
        require(grievances[id].status == GrievanceStatus.Filed, "Invalid status");

        grievances[id].resolver = resolver;
        grievances[id].status = GrievanceStatus.UnderReview;

        emit GrievanceAssigned(id, resolver, block.timestamp);
        emit GrievanceStatusUpdated(id, GrievanceStatus.UnderReview, block.timestamp);
    }

    function updateGrievanceStatus(uint256 id, GrievanceStatus newStatus)
        external
        grievanceExists(id)
    {
        require(hasRole(RESOLVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        require(newStatus != grievances[id].status, "Status unchanged");
        require(
            (grievances[id].status == GrievanceStatus.Filed && newStatus == GrievanceStatus.UnderReview) ||
            (grievances[id].status == GrievanceStatus.UnderReview && newStatus == GrievanceStatus.Resolved),
            "Invalid status transition"
        );

        grievances[id].status = newStatus;
        emit GrievanceStatusUpdated(id, newStatus, block.timestamp);
    }

    function resolveGrievance(uint256 id, string memory resolutionIpfsHash)
        external
        grievanceExists(id)
    {
        require(hasRole(RESOLVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        require(bytes(resolutionIpfsHash).length > 0, "Empty resolution IPFS hash");
        require(grievances[id].status == GrievanceStatus.UnderReview, "Invalid status");

        grievances[id].status = GrievanceStatus.Resolved;
        grievances[id].resolutionIpfsHash = resolutionIpfsHash;

        emit GrievanceResolved(id, resolutionIpfsHash, block.timestamp);
        emit GrievanceStatusUpdated(id, GrievanceStatus.Resolved, block.timestamp);
    }

    // ✅ Fixed: use getIdentityOwner here
    function getGrievance(uint256 id)
        external
        view
        grievanceExists(id)
        returns (string memory complainantDID, string memory title, GrievanceStatus status)
    {
        require(
            identityRegistry.getIdentityOwner(grievances[id].complainantDID) == msg.sender ||
            hasRole(RESOLVER_ROLE, msg.sender) ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );

        GrievanceRecord storage g = grievances[id];
        return (g.complainantDID, g.title, g.status);
    }

    function getUserGrievances(string memory did)
        external
        view
        onlyValidDID(did)
        returns (uint256[] memory)
    {
        return userGrievances[did];
    }
}
