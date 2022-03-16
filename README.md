three.js (fork)
========

## Changes from the original three js repo
- **[r101]** Changed `depth_vert.glsl.js` and `depth_frag.glsl.js` to fix issues 
with depth on iOS. Achieved by passing down `varying vec2 vHighPrecisionZW;`
- Implemented a `Cone` math object, declared in `math/Cone.js` and `math/Cone.d.ts`,
and added to `Three.js` and `Three.d.ts`
- Implemented a `Cylinder` math object, declared in `math/Cylinder.js` and 
`math/Cylinder.d.ts`, and added to `Three.js` and `Three.d.ts`
- Added functions `intersectCone` and `intersectCylinder` to `Ray`
- Added extra base uniforms (`viewMatrixInverse` and `projectionMatrixInverse`), that will automatically be attributed by 
`WebGLRenderer`
- Added `renderSize` uniform to fragment shaders, declared in `WebGLProgram.js`
and updated by `WebGLRenderer`
- Updated `FXAAShader` to support alpha input
- ssaoMap material suport:
    - Edited `aomap_fragment.glsl.js` and `aomap_pars_fragment.glsl.js` shaders 
    to support the use of ssaoMap.
    - recorded ssaoMap to `UniformsLib`
    - added ssaoMap uniforms in `Shader lib to :
        - basic
        - lambert
        - phong
        - standard
        - **[r121+]** toon
    - added `ssaoMap` parameter declaration and detection to `WebGLPrograms`
    - added support for parameter `ssaoMap` to `WebGLProgram`'s auto define
    declarations
    - added material detection of an `ssaoMap` parameter to pass down the 
    render pipeline in `WebGLRenderer` **[r101]** / `WebGLMaterials` **[r121+]**
    - added `ssaoMap` parameter to:
        - `MeshBasicMaterial`
        - `MeshLambertMaterial`
        - `MeshPhongMaterial`
        - `MeshStandardMaterial`
        - **[r121+]** `MeshToonMaterial`
    - if `aoMap` is also defined, `ssaoMap` takes precedance over it 
    - added the `ssaoMapMatrix` parameter, which can be used to manually compute the SSAO 
      texture coordinates.


**TODO: add changes from 122 to 130**