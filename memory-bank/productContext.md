# Product Context

## What is Three.js?
Three.js is a JavaScript 3D library that makes it easy to create 3D graphics in web browsers without requiring deep knowledge of WebGL or WebGPU APIs.

## Problems It Solves
1. **Complexity Abstraction**: Hides the complexity of low-level WebGL/WebGPU APIs behind a simple, intuitive JavaScript API
2. **Cross-browser Compatibility**: Provides consistent 3D rendering across different browsers and platforms
3. **Rapid Development**: Enables developers to create 3D scenes, animations, and interactions quickly
4. **Performance**: Optimized rendering pipeline for real-time 3D graphics

## How It Works
Three.js uses a scene graph architecture where:
- **Scenes** contain 3D objects, lights, and cameras
- **Objects** (meshes, lines, points) are composed of geometries and materials
- **Renderers** (WebGL, WebGPU) draw the scene from a camera's perspective
- **Animation system** handles keyframe-based animations
- **Loaders** import 3D models and textures from various formats

## User Experience Goals
- **Developer-friendly**: Intuitive API that feels natural to JavaScript developers
- **Well-documented**: Extensive examples, manual, and API documentation
- **Flexible**: Supports both simple scenes and complex, performance-critical applications
- **Extensible**: Modular architecture allows for custom renderers, materials, and geometries

## Target Users
- Web developers creating 3D visualizations
- Game developers building browser-based games
- Data visualization specialists
- Artists and designers creating interactive 3D experiences
- Educational content creators

## Key Features
- Multiple renderers (WebGL, WebGPU, SVG, CSS3D)
- Rich material system (PBR, shaders, custom materials)
- Animation system with keyframe tracks
- Geometry primitives and custom geometries
- Lighting system (ambient, directional, point, spot, etc.)
- Texture loading and management
- Model loaders (GLTF, OBJ, etc.)
- Post-processing effects
- WebXR support for VR/AR
- Node-based material system (TSL - Three Shading Language)

