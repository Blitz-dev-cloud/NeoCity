// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract IdentityRegistry is Ownable, AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct Identity {
        address owner;
        string didDocument;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    mapping(string => Identity) public identities;
    mapping(address => string[]) public userDIDs;
    mapping(string => mapping(string => bool)) public verifiableCredentials;
    
    event IdentityRegistered(string indexed did, address indexed owner, uint256 timestamp);
    event IdentityUpdated(string indexed did, address indexed owner, uint256 timestamp);
    event IdentityRevoked(string indexed did, address indexed owner, uint256 timestamp);
    event CredentialIssued(string indexed did, string indexed credentialId, uint256 timestamp);
    event CredentialRevoked(string indexed did, string indexed credentialId, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    
    modifier onlyIdentityOwner(string memory did) {
        require(identities[did].owner == msg.sender, "Not identity owner");
        _;
    }
    
    modifier didExists(string memory did) {
        require(identities[did].owner != address(0), "DID does not exist");
        _;
    }
    
    function registerIdentity(string memory did, string memory didDocument) external {
        require(identities[did].owner == address(0), "DID already exists");
        require(bytes(did).length > 0, "Invalid DID");
        
        identities[did] = Identity({
            owner: msg.sender,
            didDocument: didDocument,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        userDIDs[msg.sender].push(did);
        
        emit IdentityRegistered(did, msg.sender, block.timestamp);
    }
    
    function updateIdentity(string memory did, string memory newDidDocument) 
        external 
        onlyIdentityOwner(did) 
        didExists(did) 
    {
        require(identities[did].isActive, "Identity is revoked");
        
        identities[did].didDocument = newDidDocument;
        identities[did].updatedAt = block.timestamp;
        
        emit IdentityUpdated(did, msg.sender, block.timestamp);
    }
    
    function revokeIdentity(string memory did) external onlyIdentityOwner(did) didExists(did) {
        identities[did].isActive = false;
        identities[did].updatedAt = block.timestamp;
        
        emit IdentityRevoked(did, msg.sender, block.timestamp);
    }
    
    function issueCredential(string memory did, string memory credentialId) 
        external 
        onlyRole(VERIFIER_ROLE) 
        didExists(did) 
    {
        require(identities[did].isActive, "Identity is not active");
        verifiableCredentials[did][credentialId] = true;
        
        emit CredentialIssued(did, credentialId, block.timestamp);
    }
    
    function revokeCredential(string memory did, string memory credentialId) 
        external 
        onlyRole(VERIFIER_ROLE) 
        didExists(did) 
    {
        verifiableCredentials[did][credentialId] = false;
        
        emit CredentialRevoked(did, credentialId, block.timestamp);
    }
    
    function verifyIdentity(string memory did) external view returns (bool) {
        return identities[did].owner != address(0) && identities[did].isActive;
    }
    
    function verifyZKProof(string memory did, bytes memory proof) external view returns (bool) {
        require(identities[did].isActive, "Identity not active");
        return true; // placeholder
    }

    function getIdentityOwner(string memory did) external view returns (address) {
        return identities[did].owner;
    }

}
