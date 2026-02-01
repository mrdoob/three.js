# TODO Report for Three.js Refactoring

This document lists unresolved TODOs found in the codebase. Use this list to create GitHub issues or track internal refactoring tasks.

## Critical / Important
These items seem to indicate temporary workarounds or significant missing pieces.

- **`/src/loaders/LoadingManager.js:299`**
  - `TODO: Revert this back to a single member variable once this issue has been fixed (cloudflare/workerd/issues/3657)`
  - *Action:* Check if the upstream issue is fixed and refactor `LoadingManager`.

- **`/src/nodes/core/NodeBuilder.js`**
  - Multiple `@TODO: ignore for now` comments.
  - *Action:* Investigate why these are ignored and if they cause silent failures.

## Architectural / Refactoring
Required for long-term code health and organization.

- **`/src/nodes/tsl/TSLBase.js:9`**
  - `TODO: Separate Material Properties in other file`
  - *Action:* Refactor material properties into a dedicated module.

- **`/src/nodes/tsl/TSLBase.js:16`**
  - `TODO: Maybe rename .toVar() -> .var()`
  - *Action:* Discuss public API change for TSL syntax consistency.

- **`/src/nodes/Nodes.js:140`**
  - `@TODO: Move to jsm/renderers/webgl`
  - *Action:* Move `GLSLNodeParser` to the appropriate JSM directory.

- **`/src/nodes/accessors/ReferenceBaseNode.js:7`**
  - `TODO: Avoid duplicated code and use only ReferenceBaseNode or ReferenceNode`
  - *Action:* Deduplicate reference node logic.

##  Performance & Optimizations
Code paths that can be made faster or more efficient.

- **`/src/nodes/functions/ShadowMaskModel.js:52`**
  - `TODO: Optimize LightsNode to avoid this assignment`
  - *Action:* Improve light node assignment logic.

- **`/src/nodes/functions/VolumetricLightingModel.js:60`**
  - `TODO: toVar() should be automatic here ( in loop )`
  - *Action:* Optimize TSL variable creation in loops.

- **`/src/nodes/display/ViewportTextureNode.js:245`**
  - `TODO: Use once() when sample() supports it`
  - *Action:* Update `viewportOpaqueMipTexture` usage once `sample()` is updated.

##  Documentation Missing
Classes or methods missing JSDoc/comments.

- **`/src/nodes/gpgpu/ComputeNode.js`**
  - Multiple `TODO` comments for missing parameter descriptions.
  - *Action:* Add documentation for `ComputeNode`.

- **`/src/animation/PropertyMixer.js`**
  - Multiple `TODO` comments in method headers.
  - *Action:* Document `PropertyMixer` methods.

##  Cleanup / Minor
Small tasks that can be picked up easily.

- **`/src/extras/core/Path.js:89`**
  - `TODO consider referencing vectors instead of copying?`

- **`/src/helpers/PointLightHelper.js:62`**
  - `TODO: delete this comment?` **(FIXED)**
  - *Status:* Removed in previous step.

## Next Steps
1. Create a GitHub issue for the **LoadingManager** workaround.
2. Open a discussion for the **TSL Syntax** changes (`toVar` vs `var`).
3. Assign **Documentation** tasks to new contributors.
