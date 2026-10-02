# SkyscraperGenerator

Generates intricate, tripartite "Beaux-Arts / Neo-Gothic" terracotta skyscrapers from a small set of parameters.

The mass is read as a footprint polygon (a rectangle with one chamfered corner) split into vertical faces, each split into three tiers — a tall arcaded base, a repeating shaft and an ornate crown — then into floors and bays. A handful of authored pieces (a pier, a window, a cornice profile, a gothic arch) are instanced across the whole tower, then baked — together with the bespoke base arcade — into a single non-indexed BufferGeometry tagged with a per-vertex `partId` (PartId) so one material can shade every zone.

The generator is material agnostic — it only produces geometry. Pass a single material (e.g. a TSL node material that branches on `partId`) to dress it.

## Code Example

```js
const generator = new SkyscraperGenerator( { seed: 35, totalHeight: 140 }, material );
scene.add( generator.build() ); // a single Mesh
```

## Constructor

### new SkyscraperGenerator()

## Source

[examples/jsm/generators/city/SkyscraperGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/city/SkyscraperGenerator.js)