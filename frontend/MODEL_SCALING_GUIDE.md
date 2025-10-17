# 🎨 GLTF Model Scaling Guide

## ✅ Fixed Issues

### 1. **Tree Random Spawning** ✅

- **Problem**: Trees were spawning at random positions every render using `Math.random()`
- **Solution**: Changed to fixed position array with 20 predefined locations
- **File**: `src/components/Ground.tsx`

```typescript
// OLD (Random - causing flickering)
{
  Array.from({ length: 20 }).map((_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 15 + Math.random() * 10; // ❌ Random!
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return <Tree key={`tree-${i}`} position={[x, 0, z]} />;
  });
}

// NEW (Fixed positions - stable)
{
  [
    [-15, -15],
    [-15, -5],
    [-15, 5],
    [-15, 15],
    [-5, -15],
    [-5, 15],
    [5, -15],
    [5, 15],
    // ... more fixed positions
  ].map(([x, z], i) => <Tree key={`tree-${i}`} position={[x, 0, z]} />);
}
```

### 2. **Model Sizes** ✅

All models now have proper scales:

| Model          | Path                                  | Scale   | Notes                      |
| -------------- | ------------------------------------- | ------- | -------------------------- |
| **Maple Tree** | `/models/maple_tree/scene.gltf`       | `0.02`  | Small decorative trees     |
| **Bank Tower** | `/models/us_bank_tower/scene.gltf`    | `0.005` | Tall skyscraper            |
| **Town Hall**  | `/models/rauma_town_hall/scene.gltf`  | `0.5`   | Medium government building |
| **Hospital**   | `/models/hospital/scene.gltf`         | `0.8`   | Large medical center       |
| **Farm**       | `/models/low_poly_farm_v2/scene.gltf` | `0.3`   | Medium farm complex        |
| **Shop**       | `/models/shop/scene.gltf`             | `1.2`   | Small retail building      |

---

## 🎯 How to Adjust Model Scales

### For Buildings (`Building3D.tsx`)

```typescript
case 'bank':
  return (
    <Suspense fallback={<LoadingBox color={color} />}>
      <GLTFModel
        path="/models/us_bank_tower/scene.gltf"
        scale={0.005} // ← Change this number
        position={[0, -0.5, 0]} // Y-axis adjusts height off ground
      />
    </Suspense>
  );
```

**Scale Guidelines:**

- `0.001 - 0.01` = Very small (for huge models like skyscrapers)
- `0.1 - 0.5` = Small (for medium-sized buildings)
- `0.5 - 1.0` = Medium (for normal-sized models)
- `1.0 - 2.0` = Large (for already small models)

### For Trees (`Ground.tsx`)

```typescript
function Tree({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/maple_tree/scene.gltf");

  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={0.02} // ← Adjust tree size here
    />
  );
}
```

---

## 📐 Position Adjustments

### Y-Axis (Vertical)

- **Positive Y**: Floats above ground
- **Negative Y**: Sinks into ground
- **0**: Sits on ground level

Example:

```typescript
position={[0, -0.5, 0]} // Slightly underground (good for buildings with basements)
position={[0, 0, 0]}    // Ground level
position={[0, 1, 0]}    // Floating 1 unit above ground
```

### X and Z (Horizontal)

Adjust in `CityScene3D.tsx`:

```typescript
const buildings = [
  {
    id: "bank",
    position: [-8, 0, 6], // [X, Y, Z]
    // X: left/right (-left, +right)
    // Z: forward/back (-back, +forward)
  },
];
```

---

## 🔄 Testing Different Scales

1. **Start with 1.0** (original size)
2. **Too big?** → Divide by 2, 5, or 10
3. **Too small?** → Multiply by 2, 5, or 10
4. **Iteratively adjust** until it looks right

### Example Iteration:

```typescript
scale={1.0}    // Original - HUGE
scale={0.5}    // Half size - still big
scale={0.1}    // 1/10 size - getting there
scale={0.05}   // 1/20 size - perfect!
```

---

## 🎨 Current Scene Layout

```
         [-15,-15]  [-15,-5]  [-15,5]  [-15,15]
              🌳      🌳       🌳       🌳
         [-20,0]
              🌳      CITY MAP            🌳 [20,0]

              🌳      🌳       🌳       🌳
         [15,-15]   [15,-5]   [15,5]   [15,15]
```

**Buildings:**

- Bank: `[-8, 0, 6]`
- City Hall: `[0, 0, 8]`
- Hospital: `[8, 0, 6]`
- Farm: `[-8, 0, -3]`
- Shop: `[0, 0, -6]`
- Traffic: `[8, 0, -4]`
- Justice: `[-6, 0, -8]`
- Token: `[6, 0, -9]`

---

## 🚀 Quick Fixes

### Model Too Big?

```typescript
// Change this:
scale={2.0}

// To this:
scale={0.2}  // Divide by 10
```

### Model Floating?

```typescript
// Change this:
position={[0, 0, 0]}

// To this:
position={[0, -1, 0]}  // Lower by 1 unit
```

### Model Underground?

```typescript
// Change this:
position={[0, -2, 0]}

// To this:
position={[0, 0, 0]}  // Raise to ground level
```

---

## 🎯 Current Status

✅ Server running at: **http://localhost:3000**
✅ Trees: Fixed positions (no more random spawning)
✅ Tree scale: `0.02` (properly sized)
✅ Bank scale: `0.005` (tall tower)
✅ All models loading from `/public/models/`

---

## 📝 Files Modified

1. ✅ `src/components/Building3D.tsx` - Building GLTF loading + scales
2. ✅ `src/components/Ground.tsx` - Tree GLTF loading + fixed positions
3. ✅ `src/components/CityScene3D.tsx` - Building positions updated

---

## 🔧 If Models Still Look Wrong

### Check in Browser Console:

1. Open http://localhost:3000
2. Press F12 (DevTools)
3. Look for GLTF loading errors
4. Check model file paths are correct

### Adjust Scale Formula:

```typescript
// If model is N times too big, divide scale by N
const currentScale = 1.0;
const modelIsXTimesTooLarge = 50; // Example: 50x too big
const newScale = currentScale / modelIsXTimesTooLarge; // = 0.02
```

---

**Ready to view!** Open http://localhost:3000 and see your properly scaled 3D city! 🏙️✨
