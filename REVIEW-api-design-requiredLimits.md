# API Design Review: `requiredLimits` in WebGPURenderer (PR #32907)

## What the PR Does

PR #32907 adds a `requiredLimits` option to `WebGPURenderer` constructor calls across
6 example files so they work in WebGPU compatibility mode. The changes look like this:

```js
// Before
renderer = new THREE.WebGPURenderer({ antialias: true });

// After
renderer = new THREE.WebGPURenderer({
  antialias: true,
  requiredLimits: { maxStorageBuffersInVertexStage: 3 }
});
```

The six examples affected:
| Example | Limit Added |
|---------|-------------|
| `webgpu_compute_birds` | `maxStorageBuffersInVertexStage: 3` |
| `webgpu_compute_cloth` | `maxStorageBuffersInVertexStage: 1` |
| `webgpu_compute_particles_fluid` | `maxStorageBuffersInVertexStage: 1` |
| `webgpu_compute_points` | `maxStorageBuffersInVertexStage: 1` |
| `webgpu_compute_water` | `maxStorageBuffersInVertexStage: 2` |
| `webgpu_mrt` | `maxColorAttachments: 5` |

## The Core Design Tension

There was a telling exchange in the PR discussion:

- **Makio64** suggested: *"I was wondering if we can [do] something simple like
  `compatMode: true` which setup internally requiredLimits at first render?"*
- **Mugen87** agreed: *"I think it would be good to hide such technical details somehow
  from the user if possible."*
- **greggman** (the PR author) explained WebGPU's intentional design: *"You're supposed
  to know what your app uses and request it."* But also conceded: *"Often I kind of feel
  the GL way (all available features are enabled and all limits are at their max) is better."*

This surfaces a fundamental question: **should three.js mirror raw WebGPU's explicit
resource-declaration philosophy, or should it abstract it away?**

---

## Problems with the Current Approach

### 1. Leaky Abstraction
Three.js is a high-level 3D library. Users write scenes with meshes, materials, and
lights — not GPU device descriptors. Exposing `maxStorageBuffersInVertexStage` in the
renderer constructor is a WebGPU implementation detail leaking through the abstraction.

A three.js user shouldn't need to know how many storage buffers their scene's vertex
shaders will consume. That's the engine's job to know.

### 2. Fragile and Error-Prone
The required limits are a property of the *scene content*, not the *renderer*. They
depend on which node materials, compute shaders, and render targets are used — things
that may change dynamically. Hard-coding them at renderer construction time means:

- Users must manually audit GPU resource usage to determine the right values.
- Values become stale if the scene evolves.
- Getting the number wrong produces a cryptic device-creation failure.

### 3. Inconsistent with Three.js Conventions
No other part of the three.js API asks users to pre-declare hardware resource budgets.
You don't specify `maxTextures: 12` when creating a scene with 12 textures. The engine
handles it. `requiredLimits` breaks this convention.

### 4. Duplicated Knowledge
The engine already builds the shader programs and knows what resources they use. Asking
the user to *also* declare those resources is duplicating knowledge that the engine
already possesses (or could derive).

---

## Alternative API Designs (Prettier Approaches)

### Option A: Request Maximum Adapter Limits Automatically

The simplest fix. When creating the device, instead of passing the user's
`requiredLimits` (or an empty `{}`), request the adapter's actual maximum limits:

```js
// In WebGPUBackend.init():
const deviceDescriptor = {
  requiredFeatures: supportedFeatures,
  requiredLimits: adapter.limits   // <-- just request everything the adapter supports
};
```

This is the OpenGL-style approach greggman alluded to. The adapter already knows its own
limits — we just ask for all of them. No user-facing API change needed at all; the
`requiredLimits` option can be removed from examples entirely.

**Pros:**
- Zero API surface change for users.
- Matches the existing three.js philosophy of "just works."
- The adapter won't advertise limits it can't deliver, so this is safe.

**Cons:**
- Slightly less "WebGPU-idiomatic" (but three.js is an abstraction layer, not a raw
  API wrapper).
- On some implementations, requesting maximum limits *might* have minor perf or memory
  implications (though in practice, WebGPU adapters report what's available, not what
  could theoretically exist).

**This is the highest-leverage change.** A single line in `WebGPUBackend.init()` would
eliminate the need for `requiredLimits` in every example and every user application.

### Option B: Deferred / Automatic Limit Detection

Instead of requiring limits up front, the renderer could analyze the scene's actual
resource usage during the first render and re-request the device if needed:

```js
// User writes:
renderer = new THREE.WebGPURenderer({ antialias: true });
// Engine internally detects storage buffer usage and requests appropriate limits
```

The flow:
1. Create device with default limits.
2. On first render, analyze compiled shaders / pipeline layouts to determine actual
   resource requirements.
3. If requirements exceed the default limits, re-request the device with elevated limits
   (or warn).

**Pros:**
- Completely invisible to users.
- Always correct — derived from actual usage, not guesses.

**Cons:**
- Re-creating a device mid-session is expensive and complex.
- Adds latency to first render.
- Architectural complexity is high for marginal benefit over Option A.

### Option C: High-Level Capability Flags

Instead of raw WebGPU limit names, expose domain-specific capabilities:

```js
renderer = new THREE.WebGPURenderer({
  antialias: true,
  capabilities: {
    computeInVertex: true,    // requests storage buffer limits for vertex stage
    extendedRenderTargets: 5  // requests maxColorAttachments
  }
});
```

Or even simpler, with a preset system:

```js
renderer = new THREE.WebGPURenderer({
  antialias: true,
  profile: 'compute'  // pre-configured limits for compute-heavy scenes
});
```

**Pros:**
- Users think in three.js concepts, not WebGPU concepts.
- Engine maps high-level flags to specific limit values internally.
- Forward-compatible: if the underlying limits change across spec revisions, the
  high-level flag stays the same.

**Cons:**
- Another layer of abstraction to maintain.
- Hard to cover all possible limit combinations with a clean set of flags.
- Still requires the user to know *something* about their resource usage.

### Option D: Keep `requiredLimits` as an Expert Escape Hatch Only

Adopt Option A as the default behavior, but *also* keep `requiredLimits` as a
documented escape hatch for advanced users who want to constrain their device
intentionally (e.g., testing on limited hardware):

```js
// Normal usage — no limits needed, engine requests adapter max
renderer = new THREE.WebGPURenderer({ antialias: true });

// Expert usage — intentionally constrain to test compat hardware
renderer = new THREE.WebGPURenderer({
  antialias: true,
  requiredLimits: { maxStorageBuffersInVertexStage: 0 }  // test minimal config
});
```

**Pros:**
- Best of both worlds: simple by default, powerful when needed.
- No breaking change — existing code with `requiredLimits` still works.
- Clean separation between "it just works" and "I know what I'm doing."

**Cons:**
- Minor: two code paths to maintain. But they're trivially different.

---

## Recommendation

**Option A (or A+D)** is the clear winner. The implementation is a one-line change in
`WebGPUBackend.init()`:

```js
// Current code (line 207-210 of WebGPUBackend.js):
const deviceDescriptor = {
  requiredFeatures: supportedFeatures,
  requiredLimits: parameters.requiredLimits  // user-provided or {}
};

// Proposed:
const deviceDescriptor = {
  requiredFeatures: supportedFeatures,
  requiredLimits: Object.keys(parameters.requiredLimits).length > 0
    ? parameters.requiredLimits         // explicit user override
    : adapter.limits                    // otherwise, request adapter max
};
```

This matches the existing pattern in the same function where three.js already
auto-requests *all supported features* from the adapter:

```js
// Lines 193-205: already auto-requests all features!
const features = Object.values( GPUFeatureName );
const supportedFeatures = [];
for ( const name of features ) {
  if ( adapter.features.has( name ) ) {
    supportedFeatures.push( name );
  }
}
```

**There's a philosophical inconsistency in the current code**: it auto-requests all
*features* but requires users to manually specify *limits*. If the engine trusts itself
to request all features, it should trust itself to request all limits too.

---

## Summary

| Approach | User Effort | Correctness | Complexity | Recommended |
|----------|-------------|-------------|------------|-------------|
| Current (`requiredLimits` in examples) | High | Fragile | Low | No |
| **A: Request adapter max limits** | **None** | **Reliable** | **Trivial** | **Yes** |
| B: Deferred detection | None | Perfect | High | No |
| C: Capability flags | Medium | Good | Medium | No |
| **D: A + expert escape hatch** | **None (default)** | **Reliable** | **Trivial** | **Yes** |

The current API leaks WebGPU internals through what should be a high-level abstraction.
The fix is elegant, minimal, and consistent with how three.js already handles GPU
features in the same code path.
