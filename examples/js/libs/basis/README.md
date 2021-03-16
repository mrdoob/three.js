# Basis Universal GPU Texture Compression

Basis Universal is a "[supercompressed](http://gamma.cs.unc.edu/GST/gst.pdf)"
GPU texture and texture video compression system that outputs a highly
compressed intermediate file format (.basis) that can be quickly transcoded to
a wide variety of GPU texture compression formats.

[GitHub](https://github.com/BinomialLLC/basis_universal)

## Transcoders

Basis Universal texture data may be used in two different file formats:
`.basis` and `.ktx2`, where `ktx2` is a standardized wrapper around basis texture data.

For further documentation about the Basis compressor and transcoder, refer to
the [Basis GitHub repository](https://github.com/BinomialLLC/basis_universal).

The folder contains two files required for transcoding `.basis` or `.ktx2` textures:

* `basis_transcoder.js` — JavaScript wrapper for the WebAssembly transcoder.
* `basis_transcoder.wasm` — WebAssembly transcoder.

Both are dependencies of `THREE.KTX2Loader` and `THREE.BasisTextureLoader`:

```js
var ktx2Loader = new THREE.KTX2Loader();
ktx2Loader.setTranscoderPath( 'examples/js/libs/basis/' );
ktx2Loader.detectSupport( renderer );
ktx2Loader.load( 'diffuse.ktx2', function ( texture ) {

	var material = new THREE.MeshStandardMaterial( { map: texture } );

}, function () {

	console.log( 'onProgress' );

}, function ( e ) {

	console.error( e );

} );
```

## License

[Apache License 2.0](https://github.com/BinomialLLC/basis_universal/blob/master/LICENSE)
