# Prefiltered HDR cubemaps

These environments are generated from the original 2K HDRIs using three.js
`PMREMGenerator`, then encoded as Basis Universal UASTC HDR 4x4 with Zstandard
level 19 supercompression. Each cubemap has six 512 × 512 faces and seven
prefiltered mip levels, ending at 8 × 8. Their roughness values follow
`PMREMGenerator.lodToRoughness()`.

Load with `KTX2Loader` and set `texture.isPMREMTexture = true`. The texture can
then be used directly as the scene environment and background.

## Sources

All source HDRIs are [CC0](https://polyhaven.com/license), provided by Poly Haven.

| Environment | Photographer |
| --- | --- |
| [Ballroom](https://polyhaven.com/a/ballroom) | Sergej Majboroda |
| [Brown Photostudio 02](https://polyhaven.com/a/brown_photostudio_02) | Sergej Majboroda |
| [Cape Hill](https://polyhaven.com/a/cape_hill) | Greg Zaal |
| [Cannon](https://polyhaven.com/a/cannon) | Greg Zaal |
| [Metro Noord](https://polyhaven.com/a/metro_noord) | Greg Zaal |
| [The Sky Is On Fire](https://polyhaven.com/a/the_sky_is_on_fire) | Greg Zaal |
| [Studio Small 09](https://polyhaven.com/a/studio_small_09) | Sergej Majboroda |
| [Wide Street 01](https://polyhaven.com/a/wide_street_01) | Sergej Majboroda |

## Regeneration

From the repository root, with dependencies installed and the `basisu` encoder
available:

```sh
node utils/generatePMREM.js ballroom_2k.hdr examples/textures/pmrem/ballroom_2k.pmrem.ktx2 /path/to/basisu
```

The encoder used for these assets is Basis Universal v2.50.0, revision
`99f52d63aa6799cbdaecfe977111dc5ec3b31d47`. The generator preserves the
prefiltered mip chain and converts render-target cube orientation to the
uploaded cubemap convention. It limits radiance to the HDR compression format's
maximum of 65,280, avoiding automatic exposure rescaling by the encoder.
