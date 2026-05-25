// Three.Core.js — Rust+WASM Three.js Core Entry
// Used by Rollup to produce build/three.core.js and build/three.module.js

import init, { init_core, create_object, process_commands, get_gl_commands } from './wasm/three_core.js';
import { setWasmExports, createObjectDirect } from './wasm/core.js';

// Top-level await WASM initialization
await init();
init_core();
setWasmExports({ process_commands, create_object: createObjectDirect, get_gl_commands });

// Re-export all public classes from engine.js
export {
    Object3D, Scene, Group, Mesh,
    PerspectiveCamera, WebGLRenderer,
    Vector3, Euler, Quaternion, Matrix4
} from './wasm/engine.js';

// Re-export constants
export * from './constants.js';
