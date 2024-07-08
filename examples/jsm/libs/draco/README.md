# Draco 3D Data Compression

Draco is an open-source library for compressing and decompressing 3D geometric meshes and point clouds. It is intended to improve the storage and transmission of 3D graphics.

[Website](https://google.github.io/draco/) | [GitHub](https://github.com/google/draco)

## Contents

This folder contains three utilities:

* `draco_decoder.js` — Emscripten-compiled decoder, compatible with any modern browser.
* `draco_decoder.wasm` — WebAssembly decoder, compatible with newer browsers and devices.
* `draco_wasm_wrapper.js` — JavaScript wrapper for the WASM decoder.

Each file is provided in two variations:

* **Default:** Latest stable builds, tracking the project's [master branch](https://github.com/google/draco).
* **glTF:** Builds targeted by the [glTF mesh compression extension](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression), tracking the [corresponding Draco branch](https://github.com/google/draco/tree/gltf_2.0_draco_extension).

Either variation may be used with `DRACOLoader`:

```js
var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('path/to/decoders/');
dracoLoader.setDecoderConfig({type: 'js'}); // (Optional) Override detection of WASM support.
```

Further [documentation on GitHub](https://github.com/google/draco/tree/master/javascript/example#static-loading-javascript-decoder).

## License

[Apache License 2.0](https://github.com/google/draco/blob/master/LICENSE)
