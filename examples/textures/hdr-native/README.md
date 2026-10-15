# Native HDR example images

Converted from the existing `textures/equirectangular/venice_sunset_1k.hdr` example: [Venice Sunset by Greg Zaal](https://polyhaven.com/a/venice_sunset), [CC0 / Poly Haven](https://polyhaven.com/license). Conversion by [Ben Houston](https://ben3d.ca).

`venice_sunset_512.jxl` is a 512×256 lossy JPEG XL image storing linear float RGB with BT.709 primaries and D65. The source is downsampled 2×2 in linear RGB and stored unscaled, with a maximum of 1,862 and zero clipped channels. It is a demonstration image, not a radiance-reference fixture.

Encoded with OpenImageIO and libjxl 0.12.0:

```sh
oiiotool venice_sunset_1k.hdr --resize:filter=box 512x256 -d float -o venice_sunset_512.pfm
cjxl venice_sunset_512.pfm venice_sunset_512.jxl -d 0.5 -x color_space=RGB_D65_SRG_Rel_Lin --intensity_target=203
```

Committed image size: 35,510 bytes.
