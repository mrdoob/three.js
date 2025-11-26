# Progress: BatchedMesh LOD System

## Overall Status

**Project Phase:** Example optimization in progress  
**Completion:** ~45% of requested scene polish  
**Last Updated:** November 25, 2025

## What Works

### Scene Composition ✅
- [x] `webgl_batchedmesh_lod.html` loads fox + tree GLBs
- [x] Terrain generated via Perlin noise, foxes follow surface
- [x] Separate BatchedMeshes for foxes and trees with proper materials
- [x] Custom UI controls for LOD distances + live counters
- [x] Basic performance optimizations (no AA, capped pixel ratio, throttled updates)

### Functionality ✅
- [x] Foxes animate across terrain with reduced speed
- [x] Trees constrained to valleys (terrain height filter)
- [x] LOD swaps active for both species
- [x] Frustum culling disabled to avoid popping

## What's Left

### Visual Polish (In Progress)
- [ ] Ensure fox textures render correctly (currently black)
- [ ] Adjust tree spacing to avoid overlaps
- [ ] Offset tree roots so trunks sit on ground
- [ ] Update counts (target 2,500 trees) + UI labels

### Performance
- [ ] Re-test FPS after lowering tree count & spacing
- [ ] Consider further simplification for distant LODs
- [ ] Profile animation/update loops for hotspots

### Verification
- [ ] Restart local server and validate scene visually
- [ ] Confirm LOD counters match actual distribution
- [ ] Ensure no disappearing objects when rotating camera

## Known Issues

1. Fox materials appear black (likely material/texture misconfiguration).
2. Trees sometimes intersect terrain (need base offset alignment).
3. Tree placement algorithm clusters points too closely.
4. FPS still low under heavy tree density.

## Metrics Snapshot

| Metric | Target | Current |
|--------|--------|---------|
| FPS (desktop) | ≥40 | ~25-30 (needs improvement) |
| Tree count | 2,500 | 5,000 configured, pending reduction |
| Fox count | 100 | 100 ✅ |
| LOD UI accuracy | 100% | Needs revalidation post-changes |

## Next Milestones

1. **Tree pass** – spacing + height fix + count reduction.  
2. **Fox material pass** – restore textures and confirm lighting.  
3. **Performance validation** – reprofile after changes (FPS, counts).  
4. **UI sync** – ensure controls display new defaults + counts.

## Lessons / Notes

- Batching per species keeps materials isolated and avoids skin issues.
- Terrain height lookup must consider mesh bounding boxes to prevent sinking.
- Performance bottleneck now dominated by tree density + animation loop frequency.
- Need reliable workflow for starting local server to validate visual changes.
