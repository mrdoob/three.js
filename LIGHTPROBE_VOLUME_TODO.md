# LightProbeVolume

# To do

- [ ] Re-read https://github.com/mrdoob/three.js/issues/16228 for requirements.

## To do after review

- [ ] Unit tests.
- [ ] Blender and Godot get by with only gridded volumes. Could we do the same? Wouldn't even need a Delaunay implementation. Faster builds.
- [ ] Use AABB to optimize update() if object is outside
- [ ] LightProbeVolumeHelper should use InstancedMesh w/ per-instance SH

## To do much later

- Experiment with proxy volumes for larger objects
- Support per-object SH

## Documentation

A LightProbeVolume samples diffuse indirect lighting in a scene at each of several LightProbe locations, then provides approximate diffuse lighting for objects at any location within that space. The method complements baked lighting and lightmaps — which only support static objects — by providing high-quality lighting for dynamic objects as they move throughout a larger scene. Like lightmaps, LightProbeVolumes can be 'baked' offline and stored, then loaded and applied at runtime very efficiently.

To bake lighting for a scene, construct a LightProbeVolume, add some probes, and sample scene lighting:

```javascript
var cubeCamera = new THREE.CubeCamera( 0.1, 100, 256, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter
} );

// If renderer uses sRGB output encoding, renderTarget must do the same.
cubeCamera.renderTarget.texture.encoding = THREE.sRGBEncoding;

// Generate a light probe volume and populate probes in a 10x3x10 grid. Then
// sample lighting at each probe using the CubeCamera.
var volume = new THREE.LightProbeVolume()
  .expand( new THREE.Box3().setFromObject( scene ), 10, 3, 10 )
  .build()
  .bake( renderer, scene, cubeCamera );

// Store volume and baked lighting as a small JSON object.
var data = volume.toJSON();
```

Before baking, probes should be spread throughout a scene densely enough to capture major lighting shifts like bright windows, dark corners, and surfaces that reflect or emit bright colors. Extremely large volumes (e.g. 1000+ probes) may be less efficient to store and apply.

Evenly distributing probes using a 'grid' pattern is sufficient in many cases, but manual placement of probes allows greater control over the final result.

To load the baked LightProbeVolume and apply it to dynamic objects in a scene:

```javascript
// Reconstruct the volume with pre-baked lighting.
var volume = new THREE.LightProbeVolume().fromJSON( data );

function render () {

    // When dynamic objects move, use the volume to update their lighting.
    volume.update( mesh1 );
    volume.update( mesh2 );

    renderer.render( scene, camera );

    // TODO(donmccurdy): How does `mesh.diffuseSH` get applied? Replace this?

}
```

Lighting from a LightProbeVolume works best with dynamic objects sized similarly to, or smaller than, the spacing between LightProbe locations. Lighting is sampled only at the center of each mesh, and larger objects like terrain and buildings will not receive realistic lighting from a single sample.
