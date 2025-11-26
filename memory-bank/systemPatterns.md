# System Patterns

## Architecture Overview
Three.js follows a modular, object-oriented architecture with clear separation of concerns.

## Core Architecture Patterns

### Scene Graph Pattern
- Hierarchical tree structure of 3D objects
- Parent-child relationships for transformations
- `Object3D` is the base class for all scene objects
- Objects can be added/removed dynamically

### Component Composition
- **Geometry**: Defines shape (vertices, faces, normals, UVs)
- **Material**: Defines appearance (color, texture, shader properties)
- **Mesh**: Combines geometry + material for rendering
- **Light**: Illuminates the scene
- **Camera**: Defines viewing perspective

### Renderer Abstraction
- Abstract renderer interface
- Multiple implementations: WebGLRenderer, WebGPURenderer
- Renderer handles low-level graphics API calls
- Scene and camera passed to renderer for drawing

## Key Design Patterns

### Factory Pattern
- Geometry factories: `BoxGeometry()`, `SphereGeometry()`, etc.
- Material factories: `MeshStandardMaterial()`, `MeshBasicMaterial()`, etc.
- Helper factories: `AxesHelper()`, `GridHelper()`, etc.

### Observer Pattern
- `EventDispatcher` base class for event handling
- Objects dispatch events (e.g., geometry changes, material updates)
- Allows reactive updates to scene changes

### Strategy Pattern
- Different rendering strategies (WebGL vs WebGPU)
- Different material strategies (PBR vs Phong vs Basic)
- Different animation interpolation strategies

### Builder Pattern
- Geometry builders for complex shapes
- Material property builders
- Scene composition builders

## Module Organization

### Source Structure (`src/`)
```
src/
├── core/          # Core classes (Object3D, BufferGeometry, etc.)
├── scenes/        # Scene management
├── cameras/       # Camera types
├── lights/        # Light types
├── materials/     # Material types
├── geometries/    # Geometry types
├── objects/       # 3D object types (Mesh, Line, Points, etc.)
├── renderers/     # Renderer implementations
├── textures/      # Texture handling
├── loaders/       # Asset loaders
├── animation/     # Animation system
├── math/          # Math utilities (Vector3, Matrix4, etc.)
├── helpers/       # Helper objects
├── extras/        # Additional utilities
└── nodes/         # Node-based material system (TSL)
```

### Entry Points
- `Three.js` - Main library entry point
- `Three.Core.js` - Core functionality only
- `Three.Legacy.js` - Legacy API support
- `Three.WebGPU.js` - WebGPU renderer
- `Three.TSL.js` - Three Shading Language

## Data Flow

### Rendering Pipeline
1. Create Scene with objects, lights, cameras
2. Update animations (if any)
3. Call `renderer.render(scene, camera)`
4. Renderer traverses scene graph
5. For each object: apply transforms, bind materials, draw geometry
6. Output to canvas/WebGL context

### Animation Flow
1. Create `AnimationClip` with keyframe tracks
2. Create `AnimationMixer` for scene
3. Create `AnimationAction` from clip
4. Update mixer each frame
5. Mixer updates object properties based on keyframes

## Key Classes and Relationships

### Core Classes
- `Object3D`: Base class for all 3D objects
- `BufferGeometry`: Efficient geometry representation
- `Material`: Base class for all materials
- `Scene`: Root container for 3D objects
- `Camera`: Defines viewing frustum
- `Renderer`: Handles actual rendering

### Inheritance Hierarchy
```
Object3D
├── Mesh
├── Line
├── Points
├── Sprite
├── Group
└── ...

Material
├── MeshBasicMaterial
├── MeshStandardMaterial
├── MeshPhongMaterial
└── ...

Camera
├── PerspectiveCamera
├── OrthographicCamera
└── ...
```

## Build System
- Uses Rollup for bundling
- Multiple build targets (module, CJS, minified)
- Tree-shaking support
- Development server with hot reload

