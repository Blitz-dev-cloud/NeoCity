# NeoCity Systems Explained

## 📋 Table of Contents

1. [Healthcare System (Doctor-Patient)](#healthcare-system)
2. [Traffic System (Congestion Control)](#traffic-system)
3. [Traffic Light Placement Issues](#traffic-light-issues)

---

## 🏥 Healthcare System (Doctor-Patient)

### How It Works

#### **1. Role-Based Access**

```
Patient → Owns medical records (via DID)
Doctor → Must be authorized by admin to access records
Admin → Contract deployer who authorizes doctors
```

#### **2. Current Flow**

**Step 1: Doctor Authorization** (Admin only)

```solidity
// Contract: EHRRegistry.sol
authorizeDoctorWithDID(string memory doctorDID)
  ↓
- Verifies doctor has DOCTOR role in IdentityRegistry
- Grants DOCTOR_ROLE in EHRRegistry
- Sets authorizedDoctors[doctorAddress] = true
```

**Step 2: Patient Uploads Record**

```solidity
uploadRecord(patientDID, ipfsHash, recordType)
  ↓
- Patient encrypts medical data
- Uploads to IPFS (Pinata)
- Stores IPFS hash on blockchain
- Only patient or authorized doctor can upload
```

**Step 3: Patient Grants Access to Doctor**

```solidity
grantAccess(patientDID, doctorAddress, duration, permissions)
  ↓
- Patient explicitly grants access
- Time-limited (e.g., 7 days)
- Permissions: "read", "write", "full"
- Creates AccessGrant struct
```

**Step 4: Doctor Accesses Records**

```solidity
getPatientRecords(patientDID)
  ↓
- Checks if doctor is authorized
- Checks if access grant is active
- Checks if access hasn't expired
- Returns array of MedicalRecord structs
```

**Step 5: Patient Revokes Access**

```solidity
revokeAccess(patientDID, doctorAddress)
  ↓
- Patient can revoke anytime
- Sets accessGrant.isActive = false
```

#### **3. Access Control Logic**

```solidity
modifier onlyPatientOrAuthorizedDoctor(string memory patientDID) {
    // Check 1: Is caller the patient?
    bool isPatient = identityRegistry.getIdentityOwner(patientDID) == msg.sender;

    // Check 2: Is caller an authorized doctor with valid access?
    bool isAuthorizedDoctor =
        authorizedDoctors[msg.sender] &&          // Admin authorized
        accessGrants[patientDID][msg.sender].isActive &&  // Patient granted
        accessGrants[patientDID][msg.sender].expiryTime > block.timestamp; // Not expired

    require(isPatient || isAuthorizedDoctor, "Unauthorized");
    _;
}
```

#### **4. Frontend Integration**

**Healthcare Dashboard (`/healthcare`)**

- **Upload Tab**: Patient uploads medical records (IPFS + blockchain)
- **Records Tab**: View own medical records
- **Access Tab**: Grant/revoke doctor access

**Current Issues:**

- ❌ No admin dashboard to authorize doctors
- ❌ Doctors can't be assigned DOCTOR role in IdentityRegistry UI
- ❌ No doctor dashboard to view patient records

#### **5. Recommended Improvements**

**A. Add Admin Dashboard** (`/admin`)

```tsx
// Features needed:
- View all identity registration requests
- Approve/reject doctor registrations
- Authorize doctors in EHRRegistry
- View all authorized doctors
- Revoke doctor authorizations
```

**B. Add Doctor Dashboard** (`/healthcare/doctor`)

```tsx
// Features needed:
- View patients who granted access
- View patient records (if access granted)
- Upload records for patients (if permission granted)
- Request access from patients
```

**C. Identity Registration Flow**

```
User registers → Selects role (PATIENT/DOCTOR/etc.)
  ↓
Admin approves identity
  ↓
If role = DOCTOR → Admin also authorizes in EHRRegistry
  ↓
Doctor can now request patient access
```

---

## 🚦 Traffic System (Congestion Control)

### Current Implementation

#### **1. Traffic Light System**

**Components:**

- `TrafficLightManager` - Singleton managing all traffic lights
- `TrafficLight` - Individual 3D traffic light component
- `TrafficLightController` - Updates all lights every frame

**Traffic Light Cycle:**

```
Red (4 seconds) → Green (5 seconds) → Yellow (1 seconds) → Red...
Total cycle: 10 seconds
```

**Synchronization:**

```javascript
// Different intersections have different delays
Main center: delay = 0s, 5s  (horizontal vs vertical)
Secondary:   delay = 2s, 3s, 7s (staggered for traffic flow)
```

#### **2. Vehicle Behavior**

**Speed Control Logic:**

```javascript
// In CityVehicles.tsx
if (shouldStop) {
  // Red or Yellow light ahead
  vehicle.speed = Math.max(0, vehicle.speed - 0.002); // Decelerate
  vehicle.stopped = vehicle.speed < 0.001;
} else {
  // Green light
  vehicle.speed = Math.min(vehicle.baseSpeed, vehicle.speed + 0.001); // Accelerate
  vehicle.stopped = false;
}
```

**Stopping Logic:**

```javascript
// Vehicle stops if near intersection AND light is red/yellow
if (
  Math.abs(pos.x - intersectionX) < 8 &&
  Math.abs(pos.z - intersectionZ) < 8
) {
  if (
    manager.getState(lightId) === "red" ||
    manager.getState(lightId) === "yellow"
  ) {
    shouldStop = true;
  }
}
```

#### **3. Congestion Monitoring**

**Real-time Metrics:**

```javascript
export const trafficCongestionData = {
  totalVehicles: 0,
  stoppedVehicles: 0,
  averageSpeed: 0,
  congestionLevel: 0, // 0-100
};

// Congestion level = (stoppedVehicles / totalVehicles) * 100
```

#### **4. Traffic Logging to Blockchain**

**Contract: TrafficLog.sol**

```solidity
logTrafficData(
    location,           // "Main Intersection", "Highway 101"
    congestionLevel,    // Low, Medium, High, Critical (0-3)
    actionTaken,        // SignalAdjustment, RouteRedirection, etc.
    description,        // Human-readable description
    predictionData,     // IPFS hash with AI/ML predictions
    isEmergency         // true/false
)
```

**Frontend Dashboard (`/traffic`)**

- User submits traffic incident/prediction
- Data uploaded to IPFS (with AI predictions, affected routes)
- IPFS hash stored on blockchain
- Events emitted for monitoring systems

**How It Should Work:**

1. 3D city monitors real-time congestion (via `trafficCongestionData`)
2. When congestion > threshold → Auto-log to blockchain
3. Smart contract can trigger actions:
   - Adjust traffic light timings
   - Send alerts to users
   - Notify emergency services

**Current Gap:**

- ❌ 3D city congestion data NOT connected to blockchain logging
- ❌ No automatic logging when congestion detected
- ❌ Traffic lights have fixed timings (no dynamic adjustment)

---

## 🚨 Traffic Light Placement Issues

### Current Problems

#### **1. Too Many Traffic Lights**

```tsx
// In CityScene3D.tsx - Lines 203-248
// Currently: 16+ traffic lights scattered everywhere
<TrafficLight position={[6, 0, 6]} id="main-h-center" delay={0} />
<TrafficLight position={[-6, 0, -6]} id="main-h-center-opposite" delay={0} />
<TrafficLight position={[6, 0, -6]} id="main-v-center" delay={5} />
<TrafficLight position={[-6, 0, 6]} id="main-v-center-opposite" delay={5} />
// ... 12 more lights at secondary intersections
```

#### **2. Incorrect Positioning**

- Lights placed randomly, not at actual road intersections
- Not facing correct direction for oncoming traffic
- Placed in middle of roads instead of corners

#### **3. Road Layout (for reference)**

```
Main roads (gray asphalt):
- Horizontal: z=0 (width: 8 units, lanes at z=±2)
- Vertical: x=0 (width: 8 units, lanes at x=±2)

Secondary roads:
- Horizontal: z=±35
- Vertical: x=±35

Intersections occur where roads cross:
- Main intersection: (0, 0)
- Secondary: (±35, 0), (0, ±35), (±35, ±35)
```

### Recommended Fix

#### **Place lights at PATCH CORNERS (realistic placement)**

```tsx
// 1. MAIN INTERSECTION (x=0, z=0)
// NE corner - controls northbound & eastbound
<TrafficLight position={[3, 0, 3]} rotation={[0, -Math.PI/4, 0]} id="main-ne" delay={0} />

// NW corner - controls northbound & westbound
<TrafficLight position={[-3, 0, 3]} rotation={[0, Math.PI/4, 0]} id="main-nw" delay={5} />

// SE corner - controls southbound & eastbound
<TrafficLight position={[3, 0, -3]} rotation={[0, -3*Math.PI/4, 0]} id="main-se" delay={5} />

// SW corner - controls southbound & westbound
<TrafficLight position={[-3, 0, -3]} rotation={[0, 3*Math.PI/4, 0]} id="main-sw" delay={0} />

// 2. SECONDARY INTERSECTIONS (repeat pattern at x=±35, z=±35)
// Only place lights at actual intersections (4-way stops)
```

#### **Correct Facing Direction**

Traffic lights should face ONCOMING traffic:

- **Northbound traffic** (moving +z): Light faces south (rotation: 0)
- **Southbound traffic** (moving -z): Light faces north (rotation: Math.PI)
- **Eastbound traffic** (moving +x): Light faces west (rotation: -Math.PI/2)
- **Westbound traffic** (moving -x): Light faces east (rotation: Math.PI/2)

**Corner placement logic:**

```
NE corner → faces southwest → rotation: 3π/4
NW corner → faces southeast → rotation: -3π/4
SE corner → faces northwest → rotation: π/4
SW corner → faces northeast → rotation: -π/4
```

---

## 🔧 Implementation Improvements Needed

### 1. Fix Traffic Light Placement

- Remove all current scattered lights
- Place 4 lights per intersection (at corners)
- Correct rotation to face oncoming traffic
- Only place at actual road intersections

### 2. Connect Congestion to Blockchain

```tsx
// In CityVehicles.tsx - Add auto-logging
useEffect(() => {
  if (trafficCongestionData.congestionLevel > 70) {
    // Auto-log high congestion to blockchain
    logTrafficData({
      location: "Real-time 3D City",
      congestionLevel: 3, // Critical
      description: `${trafficCongestionData.stoppedVehicles}/${trafficCongestionData.totalVehicles} vehicles stopped`,
    });
  }
}, [trafficCongestionData.congestionLevel]);
```

### 3. Dynamic Traffic Light Timing

```tsx
// Adjust light timings based on congestion
if (congestionLevel > 50) {
  greenDuration = 8; // Longer green for congested direction
  redDuration = 6;
} else {
  greenDuration = 5; // Normal timing
  redDuration = 4;
}
```

### 4. Add Admin/Doctor Dashboards

- `/admin` - Approve identities, authorize doctors
- `/healthcare/doctor` - View patient records with granted access

---

## 📊 Summary

| System                 | Current State                                                  | Issues                                                             | Fixes Needed                                                             |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **Healthcare**         | ✅ Contracts working<br>✅ Patient uploads<br>✅ Access grants | ❌ No admin UI<br>❌ No doctor UI<br>❌ Can't authorize doctors    | Add admin dashboard<br>Add doctor dashboard<br>Create authorization flow |
| **Traffic 3D**         | ✅ Vehicles move<br>✅ Lights cycle<br>✅ Congestion tracked   | ❌ Lights everywhere<br>❌ Wrong positions<br>❌ No dynamic timing | Place at corners<br>Correct rotations<br>Adjust timing by congestion     |
| **Traffic Blockchain** | ✅ Contract working<br>✅ Manual logging                       | ❌ Not connected to 3D<br>❌ No auto-logging                       | Connect congestion data<br>Auto-log when high congestion                 |

Would you like me to implement these fixes? I can:

1. Fix traffic light placement and rotations
2. Connect 3D congestion to blockchain logging
3. Create admin and doctor dashboards
