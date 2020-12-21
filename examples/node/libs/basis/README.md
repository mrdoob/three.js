# Basis Universal GPU Texture Compression

Basis Universal is a "[supercompressed](http://gamma.cs.unc.edu/GST/gst.pdf)"
GPU texture and texture video compression system that outputs a highly
compressed intermediate file format (.basis) that can be quickly transcoded to
a wide variety of GPU texture compression formats.

[GitHub](https://github.com/BinomialLLC/basis_universal)

## Transcoders

Basis Universal texture data may be used in two different file formats:
`.basis` and `.ktx2`. Texture data is identical in both cases, but different
transcoders are required to read the two file types. Both transcoders are
available in this folder now, but they may be merged in the future.

For further documentation about the Basis compressor and transcoder, refer to
the [Basis GitHub repository](https://github.com/BinomialLLC/basis_universal).

### .basis

The folder contains two files required for transcoding `.basis` textures:

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

### .ktx2

The folder contains two files required for transcoding `.ktx2` textures:

* `msc_basis_transcoder.js` — JavaScript wrapper for the WebAssembly transcoder.
* `msc_basis_transcoder.wasm` — WebAssembly transcoder.

Currently, the `msc_basis_transcoder.js` file must be added to the page as a
global script. The WASM transcoder will be downloaded from the same directory
automatically. These will likely be replaced with ES modules, and merged with
the `.basis` transcoder, in the future. See `KTX2Loader` for usage.

## License

[Apache License 2.0](https://github.com/BinomialLLC/basis_universal/blob/master/LICENSE)
