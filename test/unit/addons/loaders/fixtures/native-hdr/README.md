# Native HDR reference fixtures

Original synthetic neutral patches, dedicated to the public domain under CC0-1.0. No third-party image pixels are included. Eight 20-pixel-wide patches span 0–10,000 cd/m² using BT.2020 PQ. The JSON manifest gives exact 12-bit AVIF samples, 16-bit JXL samples, patch centers and linear luminance relative to 203 cd/m² white.

The lossless fixtures were independently checked with libavif 1.4.2 `avifdec` and libjxl 0.12.0 `djxl`. JXL has a small 12-to-16-bit sample rounding difference.
