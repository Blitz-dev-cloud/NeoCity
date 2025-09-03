// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IdentityRegistry.sol";

contract EHRRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    IdentityRegistry public identityRegistry;
    
    struct MedicalRecord {
        string ipfsHash;
        address uploader;
        uint256 timestamp;
        string recordType;
        bool isActive;
    }
    
    struct AccessGrant {
        address doctor;
        uint256 expiryTime;
        bool isActive;
        string permissions;
    }
    
    mapping(string => MedicalRecord[]) public patientRecords;
    mapping(string => mapping(address => AccessGrant)) public accessGrants;
    mapping(address => bool) public authorizedDoctors;
    
    event RecordUploaded(string indexed patientDID, address indexed uploader, string ipfsHash, string recordType, uint256 timestamp);
    event AccessGranted(string indexed patientDID, address indexed doctor, uint256 expiryTime, string permissions);
    event AccessRevoked(string indexed patientDID, address indexed doctor, uint256 timestamp);
    event DoctorAuthorized(address indexed doctor, uint256 timestamp);
    event DoctorDeauthorized(address indexed doctor, uint256 timestamp);
    
    constructor(address _identityRegistry) {
        identityRegistry = IdentityRegistry(_identityRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    modifier onlyPatient(string memory patientDID) {
        require(identityRegistry.verifyIdentity(patientDID), "Invalid patient DID");
        require(identityRegistry.getIdentityOwner(patientDID) == msg.sender, "Not patient");
        _;
    }
    
    modifier onlyAuthorizedDoctor() {
        require(hasRole(DOCTOR_ROLE, msg.sender) || authorizedDoctors[msg.sender], "Not authorized doctor");
        _;
    }
    
    modifier onlyPatientOrAuthorizedDoctor(string memory patientDID) {
        bool isPatient = identityRegistry.verifyIdentity(patientDID) && 
                        identityRegistry.getIdentityOwner(patientDID) == msg.sender;

        bool isAuthorizedDoctor = (hasRole(DOCTOR_ROLE, msg.sender) || authorizedDoctors[msg.sender]) &&
                                accessGrants[patientDID][msg.sender].isActive &&
                                accessGrants[patientDID][msg.sender].expiryTime > block.timestamp;

        require(isPatient || isAuthorizedDoctor, "Unauthorized access");
        _;
    }
    
    function authorizeDoctor(address doctor) external onlyRole(ADMIN_ROLE) {
        authorizedDoctors[doctor] = true;
        _grantRole(DOCTOR_ROLE, doctor);
        emit DoctorAuthorized(doctor, block.timestamp);
    }
    
    function deauthorizeDoctor(address doctor) external onlyRole(ADMIN_ROLE) {
        authorizedDoctors[doctor] = false;
        _revokeRole(DOCTOR_ROLE, doctor);
        emit DoctorDeauthorized(doctor, block.timestamp);
    }
    
    function uploadRecord(
        string memory patientDID,
        string memory ipfsHash,
        string memory recordType
    ) external onlyPatientOrAuthorizedDoctor(patientDID) nonReentrant {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        require(bytes(recordType).length > 0, "Invalid record type");
        
        patientRecords[patientDID].push(MedicalRecord({
            ipfsHash: ipfsHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            recordType: recordType,
            isActive: true
        }));
        
        emit RecordUploaded(patientDID, msg.sender, ipfsHash, recordType, block.timestamp);
    }
    
    function grantAccess(
        string memory patientDID,
        address doctor,
        uint256 duration,
        string memory permissions
    ) external onlyPatient(patientDID) {
        require(authorizedDoctors[doctor] || hasRole(DOCTOR_ROLE, doctor), "Doctor not authorized");
        require(duration > 0, "Invalid duration");
        
        accessGrants[patientDID][doctor] = AccessGrant({
            doctor: doctor,
            expiryTime: block.timestamp + duration,
            isActive: true,
            permissions: permissions
        });
        
        emit AccessGranted(patientDID, doctor, block.timestamp + duration, permissions);
    }
    
    function revokeAccess(string memory patientDID, address doctor) external onlyPatient(patientDID) {
        require(accessGrants[patientDID][doctor].isActive, "Access not granted");
        
        accessGrants[patientDID][doctor].isActive = false;
        
        emit AccessRevoked(patientDID, doctor, block.timestamp);
    }
    
    function getPatientRecords(string memory patientDID) 
        external 
        view 
        onlyPatientOrAuthorizedDoctor(patientDID) 
        returns (MedicalRecord[] memory) 
    {
        return patientRecords[patientDID];
    }
    
    function getRecordCount(string memory patientDID) external view returns (uint256) {
        return patientRecords[patientDID].length;
    }
    
    function hasAccess(string memory patientDID, address doctor) external view returns (bool) {
        AccessGrant storage grant = accessGrants[patientDID][doctor];
        return grant.isActive && grant.expiryTime > block.timestamp;
    }
}