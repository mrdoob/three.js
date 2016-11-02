
Notes on the sandbox example
-----------------------------

- relies on webgl extensions
  - getcontext('experimental-webgl')
  - oes_texture_float
  - oes_texture_float_linear

- pre-computed brdf values
  - ltc_mat: 64 x 64 x 4 floats
  - ltc_mag: 64 x 64 x 1 float
