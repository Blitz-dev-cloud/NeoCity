// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TrafficLog is AccessControl, ReentrancyGuard {
    bytes32 public constant TRAFFIC_ADMIN_ROLE = keccak256("TRAFFIC_ADMIN_ROLE");
    bytes32 public constant TRAFFIC_OPERATOR_ROLE = keccak256("TRAFFIC_OPERATOR_ROLE");

    enum CongestionLevel { Low, Medium, High, Critical }
    enum ActionType { None, SignalAdjustment, RouteRedirection, EmergencyResponse, MaintenanceScheduled }

    struct TrafficEntry {
        uint256 id;
        string location;
        uint256 timestamp;
        CongestionLevel congestionLevel;
        ActionType actionTaken;
        address operator;
        string description;
        string predictionData; // IPFS hash for ML prediction data
        bool isEmergency;
    }

    mapping(uint256 => TrafficEntry) public trafficLogs;
    mapping(string => uint256[]) public locationLogs; // location => entry IDs
    mapping(address => uint256[]) public operatorLogs; // operator => entry IDs

    uint256 public logCount;

    event TrafficLogged(
        uint256 indexed logId,
        string indexed location,
        CongestionLevel congestionLevel,
        ActionType actionTaken,
        address indexed operator,
        uint256 timestamp
    );
    event EmergencyLogged(uint256 indexed logId, string indexed location, address indexed operator, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRAFFIC_ADMIN_ROLE, msg.sender);
        _grantRole(TRAFFIC_OPERATOR_ROLE, msg.sender);
    }

    modifier onlyTrafficPersonnel() {
        require(
            hasRole(TRAFFIC_ADMIN_ROLE, msg.sender) || hasRole(TRAFFIC_OPERATOR_ROLE, msg.sender),
            "Unauthorized: Not traffic personnel"
        );
        _;
    }

    function addTrafficOperator(address operator) external onlyRole(TRAFFIC_ADMIN_ROLE) {
        _grantRole(TRAFFIC_OPERATOR_ROLE, operator);
    }

    function removeTrafficOperator(address operator) external onlyRole(TRAFFIC_ADMIN_ROLE) {
        _revokeRole(TRAFFIC_OPERATOR_ROLE, operator);
    }

    function logTrafficData(
        string memory location,
        CongestionLevel congestionLevel,
        ActionType actionTaken,
        string memory description,
        string memory predictionData,
        bool isEmergency
    ) external onlyTrafficPersonnel nonReentrant returns (uint256) {
        require(bytes(location).length > 0, "Invalid location");

        logCount++;

        trafficLogs[logCount] = TrafficEntry({
            id: logCount,
            location: location,
            timestamp: block.timestamp,
            congestionLevel: congestionLevel,
            actionTaken: actionTaken,
            operator: msg.sender,
            description: description,
            predictionData: predictionData,
            isEmergency: isEmergency
        });

        locationLogs[location].push(logCount);
        operatorLogs[msg.sender].push(logCount);

        emit TrafficLogged(logCount, location, congestionLevel, actionTaken, msg.sender, block.timestamp);

        if (isEmergency) {
            emit EmergencyLogged(logCount, location, msg.sender, block.timestamp);
        }

        return logCount;
    }

    function getTrafficEntry(uint256 logId)
        external
        view
        returns (
            string memory location,
            uint256 timestamp,
            CongestionLevel congestionLevel,
            ActionType actionTaken,
            address operator,
            string memory description,
            string memory predictionData,
            bool isEmergency
        )
    {
        require(logId <= logCount && logId > 0, "Invalid log ID");

        TrafficEntry storage entry = trafficLogs[logId];
        return (
            entry.location,
            entry.timestamp,
            entry.congestionLevel,
            entry.actionTaken,
            entry.operator,
            entry.description,
            entry.predictionData,
            entry.isEmergency
        );
    }

    function getLocationLogs(string memory location) external view returns (uint256[] memory) {
        return locationLogs[location];
    }

    function getOperatorLogs(address operator) external view returns (uint256[] memory) {
        return operatorLogs[operator];
    }

    function getRecentLogs(uint256 count) external view returns (uint256[] memory) {
        require(count > 0, "Count must be greater than 0");

        uint256 actualCount = count > logCount ? logCount : count;
        uint256[] memory recentLogs = new uint256[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            recentLogs[i] = logCount - i;
        }

        return recentLogs;
    }

    function getLogsByTimeRange(uint256 startTime, uint256 endTime) external view returns (uint256[] memory) {
        require(startTime < endTime, "Invalid time range");

        uint256[] memory tempResults = new uint256[](logCount);
        uint256 resultCount = 0;

        for (uint256 i = 1; i <= logCount; i++) {
            if (trafficLogs[i].timestamp >= startTime && trafficLogs[i].timestamp <= endTime) {
                tempResults[resultCount] = i;
                resultCount++;
            }
        }

        uint256[] memory results = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            results[i] = tempResults[i];
        }

        return results;
    }

    function getEmergencyLogs() external view returns (uint256[] memory) {
        uint256[] memory tempResults = new uint256[](logCount);
        uint256 resultCount = 0;

        for (uint256 i = 1; i <= logCount; i++) {
            if (trafficLogs[i].isEmergency) {
                tempResults[resultCount] = i;
                resultCount++;
            }
        }

        uint256[] memory results = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            results[i] = tempResults[i];
        }

        return results;
    }
}