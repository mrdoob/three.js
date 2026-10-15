# Native HDR example images

Converted from the existing `textures/equirectangular/venice_sunset_1k.hdr` example: [Venice Sunset by Greg Zaal](https://polyhaven.com/a/venice_sunset), [CC0 / Poly Haven](https://polyhaven.com/license). Conversion by [Ben Houston](https://ben3d.ca).

Both 512×256 RGB images use BT.709 primaries, D65 and ST 2084 PQ. The source is downsampled 2×2 in linear RGB, then divided by 64 to fit its full range into PQ without clipping. Encoded linear 1 corresponds to 203 cd/m². The example uses `emissiveIntensity = 64` to restore source-relative radiance. These are lossy demonstration images, not radiance-reference fixtures or a matched-quality compression comparison.

Generate the 16-bit PQ PNG/PPM encoder inputs from the repository root:

```sh
node utils/generate-native-hdr-example.js generated-native-hdr
```

Encode inside that output directory with libavif 1.4.2 and libjxl 0.12.0:

```sh
avifenc -q 90 --depth 12 --yuv 444 --cicp 1/16/0 --range full --clli 10000,10000 venice_sunset_512_pq.png venice_sunset_512.avif
cjxl venice_sunset_512_pq.ppm venice_sunset_512.jxl -d 0.5 -x color_space=RGB_D65_SRG_Rel_PeQ --intensity_target=10000
```

The intermediate PNG/PPM samples are PQ values, not sRGB images. CLLI values are conservative upper bounds. The scaled source maximum is 29.2098 (approximately 5,930 cd/m²), with zero clipped channels. Committed image sizes: AVIF 16,864 bytes; JPEG XL 7,267 bytes.
