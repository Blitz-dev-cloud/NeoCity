// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TrafficLog is AccessControl, ReentrancyGuard {
    bytes32 public constant TRAFFIC_ADMIN_ROLE = keccak256("TRAFFIC_ADMIN_ROLE");
    bytes32 public constant TRAFFIC_OPERATOR_ROLE = keccak256("TRAFFIC_OPERATOR_ROLE");

    enum CongestionLevel { Low, Medium, High, Critical }
    enum ActionType { None, SignalAdjustment, RouteRedirection, EmergencyResponse, MaintenanceScheduled }
    enum VehicleType { Car, Truck, Bus, Emergency, Motorcycle }

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

    struct Vehicle {
        string licensePlate;
        VehicleType vehicleType;
        address owner;
        string currentLocation;
        uint256 lastUpdate;
        bool isActive;
        bool isEmergencyVehicle;
    }

    struct TrafficZone {
        string zoneName;
        uint256 vehicleCount;
        uint256 capacity;
        uint256 greenLightDuration; // in seconds
        uint256 lastUpdate;
        bool hasEmergency;
        uint256 historicalPeakCount; // Track peak traffic for adaptive capacity
        uint256 congestionStartTime; // When congestion began (0 if not congested)
        uint256 totalCongestionTime; // Cumulative congestion time
        uint256 emergencyResponseTime; // Time taken to clear emergency
    }

    mapping(uint256 => TrafficEntry) public trafficLogs;
    mapping(string => uint256[]) public locationLogs; // location => entry IDs
    mapping(address => uint256[]) public operatorLogs; // operator => entry IDs
    
    // Vehicle tracking mappings
    mapping(string => Vehicle) public vehicles; // licensePlate => Vehicle
    mapping(address => string[]) public ownerVehicles; // owner => licensePlates
    mapping(string => string[]) public zoneVehicles; // zoneName => licensePlates
    
    // Traffic zone mappings
    mapping(string => TrafficZone) public trafficZones;
    string[] public allZones;
    
    uint256 public logCount;
    uint256 public totalVehicles;

    event TrafficLogged(
        uint256 indexed logId,
        string indexed location,
        CongestionLevel congestionLevel,
        ActionType actionTaken,
        address indexed operator,
        uint256 timestamp
    );
    event EmergencyLogged(uint256 indexed logId, string indexed location, address indexed operator, uint256 timestamp);
    event VehicleRegistered(string indexed licensePlate, address indexed owner, VehicleType vehicleType);
    event VehicleLocationUpdated(string indexed licensePlate, string previousLocation, string newLocation, uint256 timestamp);
    event TrafficZoneUpdated(string indexed zoneName, uint256 vehicleCount, CongestionLevel congestionLevel);
    event TrafficLightAdjusted(string indexed zoneName, uint256 greenLightDuration, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRAFFIC_ADMIN_ROLE, msg.sender);
        _grantRole(TRAFFIC_OPERATOR_ROLE, msg.sender);
        
        // Initialize default traffic zones
        _initializeTrafficZone("Downtown", 100);
        _initializeTrafficZone("Highway 101", 200);
        _initializeTrafficZone("Residential Area", 50);
        _initializeTrafficZone("Industrial Zone", 80);
    }
    
    function _initializeTrafficZone(string memory zoneName, uint256 capacity) internal {
        trafficZones[zoneName] = TrafficZone({
            zoneName: zoneName,
            vehicleCount: 0,
            capacity: capacity,
            greenLightDuration: 30, // Default 30 seconds
            lastUpdate: block.timestamp,
            hasEmergency: false,
            historicalPeakCount: 0,
            congestionStartTime: 0,
            totalCongestionTime: 0,
            emergencyResponseTime: 0
        });
        allZones.push(zoneName);
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
    
    // ============ VEHICLE TRACKING FUNCTIONS ============
    
    function registerVehicle(
        string memory licensePlate,
        VehicleType vehicleType,
        bool isEmergencyVehicle
    ) external nonReentrant returns (bool) {
        require(bytes(licensePlate).length > 0, "Invalid license plate");
        require(!vehicles[licensePlate].isActive, "Vehicle already registered");
        
        vehicles[licensePlate] = Vehicle({
            licensePlate: licensePlate,
            vehicleType: vehicleType,
            owner: msg.sender,
            currentLocation: "",
            lastUpdate: block.timestamp,
            isActive: true,
            isEmergencyVehicle: isEmergencyVehicle
        });
        
        ownerVehicles[msg.sender].push(licensePlate);
        totalVehicles++;
        
        emit VehicleRegistered(licensePlate, msg.sender, vehicleType);
        return true;
    }
    
    function updateVehicleLocation(string memory licensePlate, string memory newLocation) 
        external 
        nonReentrant 
        returns (bool) 
    {
        Vehicle storage vehicle = vehicles[licensePlate];
        require(vehicle.isActive, "Vehicle not registered");
        require(vehicle.owner == msg.sender, "Not vehicle owner");
        require(bytes(newLocation).length > 0, "Invalid location");
        
        string memory previousLocation = vehicle.currentLocation;
        
        // Remove from previous zone
        if (bytes(previousLocation).length > 0) {
            _removeVehicleFromZone(previousLocation, licensePlate);
        }
        
        // Add to new zone
        _addVehicleToZone(newLocation, licensePlate);
        
        // Update vehicle data
        vehicle.currentLocation = newLocation;
        vehicle.lastUpdate = block.timestamp;
        
        emit VehicleLocationUpdated(licensePlate, previousLocation, newLocation, block.timestamp);
        
        // Auto-adjust traffic based on congestion
        _autoAdjustTrafficLight(newLocation);
        
        return true;
    }
    
    function _addVehicleToZone(string memory zoneName, string memory licensePlate) internal {
        TrafficZone storage zone = trafficZones[zoneName];
        
        // Create zone if doesn't exist
        if (bytes(zone.zoneName).length == 0) {
            trafficZones[zoneName] = TrafficZone({
                zoneName: zoneName,
                vehicleCount: 0,
                capacity: 100, // Default capacity
                greenLightDuration: 30,
                lastUpdate: block.timestamp,
                hasEmergency: false,
                historicalPeakCount: 0,
                congestionStartTime: 0,
                totalCongestionTime: 0,
                emergencyResponseTime: 0
            });
            allZones.push(zoneName);
        }
        
        zoneVehicles[zoneName].push(licensePlate);
        trafficZones[zoneName].vehicleCount++;
        
        // Update historical peak for adaptive capacity planning
        if (trafficZones[zoneName].vehicleCount > trafficZones[zoneName].historicalPeakCount) {
            trafficZones[zoneName].historicalPeakCount = trafficZones[zoneName].vehicleCount;
        }
        
        trafficZones[zoneName].lastUpdate = block.timestamp;
        
        // Mark emergency if emergency vehicle enters
        if (vehicles[licensePlate].isEmergencyVehicle) {
            trafficZones[zoneName].hasEmergency = true;
            // Record when emergency response started
            if (trafficZones[zoneName].emergencyResponseTime == 0) {
                trafficZones[zoneName].emergencyResponseTime = block.timestamp;
            }
        }
        
        // Track congestion start time
        CongestionLevel congestion = _calculateCongestion(zoneName);
        if (congestion >= CongestionLevel.High && trafficZones[zoneName].congestionStartTime == 0) {
            trafficZones[zoneName].congestionStartTime = block.timestamp;
        }
        
        emit TrafficZoneUpdated(zoneName, trafficZones[zoneName].vehicleCount, congestion);
    }
    
    function _removeVehicleFromZone(string memory zoneName, string memory licensePlate) internal {
        TrafficZone storage zone = trafficZones[zoneName];
        if (zone.vehicleCount > 0) {
            zone.vehicleCount--;
            zone.lastUpdate = block.timestamp;
            
            // Remove from zoneVehicles array
            string[] storage zoneVehicleList = zoneVehicles[zoneName];
            for (uint256 i = 0; i < zoneVehicleList.length; i++) {
                if (keccak256(bytes(zoneVehicleList[i])) == keccak256(bytes(licensePlate))) {
                    zoneVehicleList[i] = zoneVehicleList[zoneVehicleList.length - 1];
                    zoneVehicleList.pop();
                    break;
                }
            }
            
            // Check if emergency vehicle left
            if (vehicles[licensePlate].isEmergencyVehicle) {
                bool hasEmergency = _checkForEmergencyVehicles(zoneName);
                
                // Calculate emergency response time if all emergencies cleared
                if (zone.hasEmergency && !hasEmergency && zone.emergencyResponseTime > 0) {
                    zone.emergencyResponseTime = block.timestamp - zone.emergencyResponseTime;
                } else if (!hasEmergency) {
                    zone.emergencyResponseTime = 0;
                }
                
                zone.hasEmergency = hasEmergency;
            }
            
            // Update congestion tracking
            CongestionLevel congestion = _calculateCongestion(zoneName);
            if (congestion < CongestionLevel.High && zone.congestionStartTime > 0) {
                // Congestion cleared - add to total congestion time
                zone.totalCongestionTime += (block.timestamp - zone.congestionStartTime);
                zone.congestionStartTime = 0;
            }
        }
    }
    
    function _checkForEmergencyVehicles(string memory zoneName) internal view returns (bool) {
        string[] storage zoneVehicleList = zoneVehicles[zoneName];
        for (uint256 i = 0; i < zoneVehicleList.length; i++) {
            if (vehicles[zoneVehicleList[i]].isEmergencyVehicle) {
                return true;
            }
        }
        return false;
    }
    
    // ============ SMART CONGESTION CONTROL ============
    
    /**
     * @dev Advanced congestion calculation with adaptive thresholds
     * Uses: Current utilization, historical peaks, congestion duration
     * Algorithm: Dynamic threshold adjustment based on zone behavior patterns
     */
    function _calculateCongestion(string memory zoneName) internal view returns (CongestionLevel) {
        TrafficZone storage zone = trafficZones[zoneName];
        
        // Emergency vehicles always trigger critical status
        if (zone.hasEmergency) {
            return CongestionLevel.Critical;
        }
        
        // Calculate base utilization percentage
        uint256 utilizationPercent = (zone.vehicleCount * 100) / zone.capacity;
        
        // Adaptive thresholds based on historical peak patterns
        uint256 peakRatio = zone.historicalPeakCount > 0 
            ? (zone.vehicleCount * 100) / zone.historicalPeakCount 
            : utilizationPercent;
        
        // Time-based congestion severity multiplier (longer congestion = worse)
        uint256 congestionDuration = 0;
        if (zone.congestionStartTime > 0) {
            congestionDuration = block.timestamp - zone.congestionStartTime;
        }
        
        // Progressive severity scaling: +10% severity per 5 minutes of congestion
        uint256 durationMultiplier = congestionDuration / 300; // 300 seconds = 5 minutes
        uint256 adjustedUtilization = utilizationPercent + (durationMultiplier * 10);
        
        // Multi-factor congestion determination
        // Critical: >90% utilization OR (>80% AND congested >15min) OR (>70% peak ratio)
        if (adjustedUtilization >= 90 || 
            (utilizationPercent >= 80 && congestionDuration > 900) || 
            peakRatio >= 95) {
            return CongestionLevel.Critical;
        }
        // High: >70% utilization OR (>60% AND congested >10min) OR (>85% peak ratio)
        else if (adjustedUtilization >= 70 || 
                 (utilizationPercent >= 60 && congestionDuration > 600) ||
                 peakRatio >= 85) {
            return CongestionLevel.High;
        }
        // Medium: >40% utilization OR (>30% AND congested >5min) OR (>70% peak ratio)
        else if (adjustedUtilization >= 40 || 
                 (utilizationPercent >= 30 && congestionDuration > 300) ||
                 peakRatio >= 70) {
            return CongestionLevel.Medium;
        }
        // Low: Everything else
        else {
            return CongestionLevel.Low;
        }
    }
    
    /**
     * @dev Intelligent traffic light control with recovery algorithm
     * Implements: Emergency priority, congestion relief, smooth recovery
     * Features: 
     * - Emergency vehicle pre-emption (60s green)
     * - Progressive green light extension during congestion
     * - Gradual recovery to prevent oscillation
     * - Load balancing between zones
     */
    function _autoAdjustTrafficLight(string memory zoneName) internal {
        TrafficZone storage zone = trafficZones[zoneName];
        CongestionLevel congestion = _calculateCongestion(zoneName);
        
        uint256 newDuration;
        uint256 currentDuration = zone.greenLightDuration;
        
        // PHASE 1: Emergency Response (Highest Priority)
        if (zone.hasEmergency) {
            newDuration = 60; // Max green light for emergency vehicles
        }
        // PHASE 2: Critical Congestion Recovery
        else if (congestion == CongestionLevel.Critical) {
            // Aggressive clearing: 50-70s based on duration
            uint256 congestionDuration = zone.congestionStartTime > 0 
                ? block.timestamp - zone.congestionStartTime 
                : 0;
            
            // Longer congestion = longer green (up to 70s)
            if (congestionDuration > 1800) { // >30 min
                newDuration = 70;
            } else if (congestionDuration > 900) { // >15 min
                newDuration = 60;
            } else {
                newDuration = 50;
            }
        }
        // PHASE 3: High Congestion Management
        else if (congestion == CongestionLevel.High) {
            // Progressive relief: 40-50s
            uint256 utilizationPercent = (zone.vehicleCount * 100) / zone.capacity;
            
            if (utilizationPercent >= 80) {
                newDuration = 50; // Near critical
            } else {
                newDuration = 40; // Standard high
            }
        }
        // PHASE 4: Medium Traffic Balancing
        else if (congestion == CongestionLevel.Medium) {
            newDuration = 30; // Balanced flow
        }
        // PHASE 5: Low Traffic Efficiency & Recovery
        else {
            // Gradual recovery: Don't drop too fast to prevent oscillation
            if (currentDuration > 35) {
                newDuration = currentDuration - 5; // Gradual decrease
            } else {
                newDuration = 20; // Minimum for efficiency
            }
        }
        
        // Smooth transition: Limit change rate to ±15s per update
        uint256 maxChange = 15;
        if (newDuration > currentDuration + maxChange) {
            newDuration = currentDuration + maxChange;
        } else if (newDuration + maxChange < currentDuration) {
            newDuration = currentDuration - maxChange;
        }
        
        // Apply bounds: 15s minimum, 90s maximum
        if (newDuration < 15) newDuration = 15;
        if (newDuration > 90) newDuration = 90;
        
        if (zone.greenLightDuration != newDuration) {
            zone.greenLightDuration = newDuration;
            emit TrafficLightAdjusted(zoneName, newDuration, block.timestamp);
        }
    }
    
    function manualAdjustTrafficLight(string memory zoneName, uint256 duration) 
        external 
        onlyTrafficPersonnel 
        returns (bool) 
    {
        require(duration >= 10 && duration <= 120, "Duration must be between 10-120 seconds");
        TrafficZone storage zone = trafficZones[zoneName];
        require(bytes(zone.zoneName).length > 0, "Zone does not exist");
        
        zone.greenLightDuration = duration;
        emit TrafficLightAdjusted(zoneName, duration, block.timestamp);
        return true;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getVehicle(string memory licensePlate) 
        external 
        view 
        returns (
            VehicleType vehicleType,
            address owner,
            string memory currentLocation,
            uint256 lastUpdate,
            bool isActive,
            bool isEmergencyVehicle
        ) 
    {
        Vehicle storage vehicle = vehicles[licensePlate];
        return (
            vehicle.vehicleType,
            vehicle.owner,
            vehicle.currentLocation,
            vehicle.lastUpdate,
            vehicle.isActive,
            vehicle.isEmergencyVehicle
        );
    }
    
    function getTrafficZone(string memory zoneName) 
        external 
        view 
        returns (
            uint256 vehicleCount,
            uint256 capacity,
            uint256 greenLightDuration,
            uint256 lastUpdate,
            bool hasEmergency,
            CongestionLevel congestion,
            uint256 historicalPeakCount,
            uint256 congestionDuration,
            uint256 totalCongestionTime,
            uint256 emergencyResponseTime
        ) 
    {
        TrafficZone storage zone = trafficZones[zoneName];
        CongestionLevel congestionLevel = _calculateCongestion(zoneName);
        
        uint256 currentCongestionDuration = 0;
        if (zone.congestionStartTime > 0) {
            currentCongestionDuration = block.timestamp - zone.congestionStartTime;
        }
        
        return (
            zone.vehicleCount,
            zone.capacity,
            zone.greenLightDuration,
            zone.lastUpdate,
            zone.hasEmergency,
            congestionLevel,
            zone.historicalPeakCount,
            currentCongestionDuration,
            zone.totalCongestionTime,
            zone.emergencyResponseTime
        );
    }
    
    /**
     * @dev Get congestion recovery metrics for a zone
     * Returns: Average recovery time, congestion frequency, efficiency score
     */
    function getZoneCongestionMetrics(string memory zoneName) 
        external 
        view 
        returns (
            uint256 totalCongestionTime,
            uint256 currentCongestionDuration,
            uint256 peakUtilization,
            uint256 averageResponseTime
        ) 
    {
        TrafficZone storage zone = trafficZones[zoneName];
        
        uint256 currentDuration = 0;
        if (zone.congestionStartTime > 0) {
            currentDuration = block.timestamp - zone.congestionStartTime;
        }
        
        uint256 peakUtil = zone.historicalPeakCount > 0 
            ? (zone.historicalPeakCount * 100) / zone.capacity 
            : 0;
        
        return (
            zone.totalCongestionTime,
            currentDuration,
            peakUtil,
            zone.emergencyResponseTime
        );
    }
    
    /**
     * @dev Analyze overall system health and efficiency
     */
    function getSystemHealthMetrics() 
        external 
        view 
        returns (
            uint256 totalZones,
            uint256 criticalZones,
            uint256 highCongestionZones,
            uint256 activeEmergencies,
            uint256 totalVehiclesTracked
        ) 
    {
        uint256 critical = 0;
        uint256 high = 0;
        uint256 emergencies = 0;
        
        for (uint256 i = 0; i < allZones.length; i++) {
            CongestionLevel level = _calculateCongestion(allZones[i]);
            if (level == CongestionLevel.Critical) critical++;
            if (level == CongestionLevel.High) high++;
            if (trafficZones[allZones[i]].hasEmergency) emergencies++;
        }
        
        return (
            allZones.length,
            critical,
            high,
            emergencies,
            totalVehicles
        );
    }
    
    function getZoneVehicles(string memory zoneName) external view returns (string[] memory) {
        return zoneVehicles[zoneName];
    }
    
    function getOwnerVehicles(address owner) external view returns (string[] memory) {
        return ownerVehicles[owner];
    }
    
    function getAllZones() external view returns (string[] memory) {
        return allZones;
    }
    
    function getCongestionLevel(string memory zoneName) external view returns (CongestionLevel) {
        return _calculateCongestion(zoneName);
    }
    
    function getRecommendedRoute(string memory currentZone, string memory destination) 
        external 
        view 
        returns (string[] memory route, CongestionLevel[] memory congestionLevels) 
    {
        // Simplified routing - returns all zones with their congestion levels
        uint256 zoneCount = allZones.length;
        string[] memory allZonesList = new string[](zoneCount);
        CongestionLevel[] memory allCongestions = new CongestionLevel[](zoneCount);
        
        for (uint256 i = 0; i < zoneCount; i++) {
            allZonesList[i] = allZones[i];
            allCongestions[i] = _calculateCongestion(allZones[i]);
        }
        
        return (allZonesList, allCongestions);
    }
}