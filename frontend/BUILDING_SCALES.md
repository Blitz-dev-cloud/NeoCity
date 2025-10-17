# 🎯 Building Scale Reference

## Updated Scales (More Conservative)

| Building       | Model Path         | Old Scale | **NEW Scale** | Size Description                    |
| -------------- | ------------------ | --------- | ------------- | ----------------------------------- |
| **Bank Tower** | `us_bank_tower`    | 0.005     | **0.002**     | Very tall skyscraper (2.5x smaller) |
| **Town Hall**  | `rauma_town_hall`  | 0.5       | **0.15**      | Government building (3x smaller)    |
| **Hospital**   | `hospital`         | 0.8       | **0.3**       | Medical center (2.6x smaller)       |
| **Farm**       | `low_poly_farm_v2` | 0.3       | **0.15**      | Farm complex (2x smaller)           |
| **Shop**       | `shop`             | 1.2       | **0.4**       | Retail store (3x smaller)           |
| **Trees**      | `maple_tree`       | 0.02      | **0.01**      | Decorative trees (2x smaller)       |

---

## 🎨 Visual Size Guide

### Recommended Building Heights in City

Think of each building's footprint as approximately **2-4 units** wide:

```
🏢 Bank Tower:    Height ≈ 10 units (tallest)
🏛️ Town Hall:     Height ≈ 6-7 units
🏥 Hospital:      Height ≈ 6-7 units
🚜 Farm:          Height ≈ 4-5 units (spread out)
🏪 Shop:          Height ≈ 5-6 units
🌳 Trees:         Height ≈ 2-3 units (decorative)
```

---

## 🔧 If Buildings Are Still Too Big/Small

### Quick Adjustment Formula:

**If too BIG**: Divide current scale by 2

```typescript
scale={0.002} // Current bank
scale={0.001} // 2x smaller
```

**If too SMALL**: Multiply current scale by 2

```typescript
scale={0.15}  // Current town hall
scale={0.30}  // 2x bigger
```

---

## 📐 Position Fine-Tuning

### If Building is Floating:

```typescript
position={[0, 0, 0]}    // Try this first
position={[0, -0.5, 0]} // Lower slightly
position={[0, -1, 0]}   // Lower more
```

### If Building is Underground:

```typescript
position={[0, -1, 0]}   // Current
position={[0, -0.5, 0]} // Raise slightly
position={[0, 0, 0]}    // Ground level
position={[0, 0.5, 0]}  // Slightly above ground
```

---

## 🎯 Expected Result

After this update, buildings should:

- ✅ Fit within the city grid roads
- ✅ Not overlap with each other
- ✅ Be visible from the default camera position `[20, 15, 20]`
- ✅ Have proper proportions relative to each other
- ✅ Allow easy navigation with orbit controls

---

## 🚀 Test These Views

1. **Top-down view**: Scroll out, look down - see city layout
2. **Street level**: Zoom in close - buildings should be immersive
3. **Orbit around**: Rotate 360° - no clipping or overlap

---

## 📝 Next Steps if Needed

### Individual Building Adjustments:

Edit `src/components/Building3D.tsx`:

```typescript
case 'bank':
  return (
    <GLTFModel
      path="/models/us_bank_tower/scene.gltf"
      scale={0.002}        // ← Adjust here
      position={[0, 0, 0]} // ← Or here
    />
  );
```

### Test Immediately:

1. Save the file
2. Browser auto-refreshes (hot reload)
3. Check if it looks better
4. Iterate until perfect!

---

**Refresh your browser now to see the updated scales!** 🏙️✨
