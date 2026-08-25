# `.ntc` sample assets

Five pre-trained Neural Texture Compression assets, used by
[`webgpu_materials_neural_texture_compression.html`](../webgpu_materials_neural_texture_compression.html):

| File | MaterialX source |
| --- | --- |
| `brick.ntc` | `neural_train_brick.mtlx` |
| `glass_dispersion.ntc` | `gltf_pbr_glass_dispersion.mtlx` |
| `gold.ntc` | `neural_train_glossy_gold.mtlx` |
| `rainbow_emissive.ntc` | `neural_train_emissive_grid.mtlx` |
| `wave_normal.ntc` | `neural_train_normal_map.mtlx` |

Each `.ntc` file is a JSON manifest (`format: "three-ntc"`) holding one
shared multiresolution latent grid (uint8-quantized) plus one small MLP
decoder (float16-packed), jointly fit against whichever PBR channels the
source MaterialX material actually varies spatially - see
[`../jsm/ntc/NTCFormat.js`](../jsm/ntc/NTCFormat.js) for the full channel
vocabulary and [`../jsm/loaders/NTCLoader.js`](../jsm/loaders/NTCLoader.js)
for the format itself.

This branch (`ntc_16bit_tsl`) ships inference only - `NTCLoader.js` and
`NTCMLPNode.js` - and does not carry the trainer that produced these files.
They were trained offline against the same MaterialX samples using the
`neural-appearance-ibl` branch's training tools (`NeuralTextureTrainer`,
`classifyMaterialChannels`/`bakeMaterialToTextures` from
`neural-material/NeuralMaterialSource.js`), then converted to the `.ntc`
wrapper format - the underlying latent grid/MLP byte payloads are already
uint8/float16-encoded by the trainer's own export path, so converting from
a `.neuralMaterial` export is a JSON key rename, not a re-encode.
