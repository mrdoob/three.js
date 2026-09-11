# GaussianSplatGroup Memory Usage Estimate

Representative case: 100,000 live Gaussian splats, all with spherical harmonics degree 3.

This estimates `GaussianSplatGroup`-owned storage only. It does not count the caller-owned source `BufferGeometry` attributes, renderer/program overhead, JavaScript object overhead, or small fixed uniforms/kernels.

## Per-Splat Data Sizes

- Center: `vec4<f32>` = 16 bytes
- Covariance A: `vec4<f32>` = 16 bytes
- Covariance B: `vec4<f32>` = 16 bytes
- Color: `u32` = 4 bytes
- SH degree 1: 3 packed `u32` words = 12 bytes
- SH degree 2: 4 packed `u32` words = 16 bytes
- SH degree 3: 6 packed `u32` words = 24 bytes
- Full degree-3 source splat: 104 bytes

## Previous Merged-Buffer Layout

Per splat:

- Per-record source storage: 104 bytes
- Merged render storage: center + covariance A + covariance B + color + SH contribution = 68 bytes
- Counting sort order/bin storage: 8 bytes
- Total: 180 bytes per splat

For 100,000 splats:

- Per-splat storage: 18,000,000 bytes
- Counting sort histogram/offset fixed storage: 32,768 bytes
- Total: 18,032,768 bytes, about 17.20 MiB

## Packed Source Layout

Per splat:

- Packed source storage padded to degree 3: 104 bytes
- Record/matrix index: 4 bytes
- Counting sort order/bin storage: 8 bytes
- Total: 116 bytes per splat

Per record:

- Transform matrix: 64 bytes
- Local camera position: 16 bytes
- Total: 80 bytes per splat cloud

For 100,000 splats in one splat cloud:

- Per-splat storage: 11,600,000 bytes
- Per-record storage: 80 bytes
- Counting sort histogram/offset fixed storage: 32,768 bytes
- Total: 11,632,848 bytes, about 11.09 MiB

## Difference

- Savings: 6,399,920 bytes, about 6.10 MiB
- Reduction: about 35.5%

The savings come from removing the duplicated merged render buffers. The new `recordIndex` metadata is much smaller than the removed merged center/covariance/color/SH contribution buffers.
