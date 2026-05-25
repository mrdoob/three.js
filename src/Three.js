// Three.js — Rust/WASM backend
// Top-level WASM initialization + all public class re-exports

import init, { init_core, create_object, process_commands, set_scene_lights,
    create_geometries_batch, get_gl_commands
} from '../src/wasm/three_core.js';
import {
    setWasmExports, writeToCache, readFromCache, enqueueMethod,
    createObjectDirect, flush,
    PropPath, Method,
} from '../src/wasm/core.js';

// ---- Top-level WASM initialization ----
await init();
init_core();
setWasmExports({ process_commands, create_object, get_gl_commands });

// ---- Re-export all public classes (engine.js exports them under public names) ----
export {
    Vector3, Euler, Quaternion, Matrix4,
    Object3D, Scene, Group, Mesh,
    PerspectiveCamera, WebGLRenderer,
} from '../src/wasm/engine.js';

export { WebGLAdapter } from '../src/renderers/webgl/WebGLAdapter.js';
