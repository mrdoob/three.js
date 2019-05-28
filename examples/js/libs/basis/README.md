# Basis Universal GPU Texture Compression

Basis Universal is a "[supercompressed](http://gamma.cs.unc.edu/GST/gst.pdf)"
GPU texture and texture video compression system that outputs a highly
compressed intermediate file format (.basis) that can be quickly transcoded to
a wide variety of GPU texture compression formats.

[GitHub](https://github.com/BinomialLLC/basis_universal)

## Contents

This folder contains two files:

* `basis_transcoder.js` — JavaScript wrapper for the WebAssembly transcoder.
* `basis_transcoder.wasm` — WebAssembly transcoder.

Both are dependencies of `THREE.BasisTextureLoader`:

```js
var basisLoader = new THREE.BasisTextureLoader();
basisLoader.setTranscoderPath( 'examples/js/libs/basis/' );
basisLoader.detectSupport( renderer );
basisLoader.load( 'diffuse.basis', function ( texture ) {

  var material = new THREE.MeshStandardMaterial( { map: texture } );

}, function () {

  console.log( 'onProgress' );

}, function ( e ) {

  console.error( e );

} );
```

For further documentation about the Basis compressor and transcoder, refer to
the [Basis GitHub repository](https://github.com/BinomialLLC/basis_universal).

## License

[Apache License 2.0](https://github.com/BinomialLLC/basis_universal/blob/master/LICENSE)
