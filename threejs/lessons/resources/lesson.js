// Licensed under a BSD license. See license.html for license
'use strict';

/* global jQuery */

(function($){
function getQueryParams() {
  const params = {};
  if (window.location.search) {
    window.location.search.substring(1).split('&').forEach(function(pair) {
      const keyValue = pair.split('=').map(function(kv) {
        return decodeURIComponent(kv);
      });
      params[keyValue[0]] = keyValue[1];
    });
  }
  return params;
}

$(document).ready(function($){

  const codeKeywordLinks = {
    AnimationAction: 'https://threejs.org/docs/api/animation/AnimationAction.html',
    AnimationClip: 'https://threejs.org/docs/api/animation/AnimationClip.html',
    AnimationMixer: 'https://threejs.org/docs/api/animation/AnimationMixer.html',
    AnimationObjectGroup: 'https://threejs.org/docs/api/animation/AnimationObjectGroup.html',
    AnimationUtils: 'https://threejs.org/docs/api/animation/AnimationUtils.html',
    KeyframeTrack: 'https://threejs.org/docs/api/animation/KeyframeTrack.html',
    PropertyBinding: 'https://threejs.org/docs/api/animation/PropertyBinding.html',
    PropertyMixer: 'https://threejs.org/docs/api/animation/PropertyMixer.html',
    BooleanKeyframeTrack: 'https://threejs.org/docs/api/animation/tracks/BooleanKeyframeTrack.html',
    ColorKeyframeTrack: 'https://threejs.org/docs/api/animation/tracks/ColorKeyframeTrack.html',
    NumberKeyframeTrack: 'https://threejs.org/docs/api/animation/tracks/NumberKeyframeTrack.html',
    QuaternionKeyframeTrack: 'https://threejs.org/docs/api/animation/tracks/QuaternionKeyframeTrack.html',
    StringKeyframeTrack: 'https://threejs.org/docs/api/animation/tracks/StringKeyframeTrack.html',
    VectorKeyframeTrack: 'https://threejs.org/docs/api/animation/tracks/VectorKeyframeTrack.html',
    Audio: 'https://threejs.org/docs/api/audio/Audio.html',
    AudioAnalyser: 'https://threejs.org/docs/api/audio/AudioAnalyser.html',
    AudioContext: 'https://threejs.org/docs/api/audio/AudioContext.html',
    AudioListener: 'https://threejs.org/docs/api/audio/AudioListener.html',
    PositionalAudio: 'https://threejs.org/docs/api/audio/PositionalAudio.html',
    ArrayCamera: 'https://threejs.org/docs/api/cameras/ArrayCamera.html',
    Camera: 'https://threejs.org/docs/api/cameras/Camera.html',
    CubeCamera: 'https://threejs.org/docs/api/cameras/CubeCamera.html',
    OrthographicCamera: 'https://threejs.org/docs/api/cameras/OrthographicCamera.html',
    PerspectiveCamera: 'https://threejs.org/docs/api/cameras/PerspectiveCamera.html',
    StereoCamera: 'https://threejs.org/docs/api/cameras/StereoCamera.html',
    Animation: 'https://threejs.org/docs/api/constants/Animation.html',
    Core: 'https://threejs.org/docs/api/constants/Core.html',
    CustomBlendingEquation: 'https://threejs.org/docs/api/constants/CustomBlendingEquations.html',
    DrawModes: 'https://threejs.org/docs/api/constants/DrawModes.html',
    Materials: 'https://threejs.org/docs/api/constants/Materials.html',
    Renderer: 'https://threejs.org/docs/api/constants/Renderer.html',
    Textures: 'https://threejs.org/docs/api/constants/Textures.html',
    BufferAttribute: 'https://threejs.org/docs/api/core/BufferAttribute.html',
    BufferGeometry: 'https://threejs.org/docs/api/core/BufferGeometry.html',
    Clock: 'https://threejs.org/docs/api/core/Clock.html',
    DirectGeometry: 'https://threejs.org/docs/api/core/DirectGeometry.html',
    EventDispatcher: 'https://threejs.org/docs/api/core/EventDispatcher.html',
    Face3: 'https://threejs.org/docs/api/core/Face3.html',
    Geometry: 'https://threejs.org/docs/api/core/Geometry.html',
    InstancedBufferAttribute: 'https://threejs.org/docs/api/core/InstancedBufferAttribute.html',
    InstancedBufferGeometry: 'https://threejs.org/docs/api/core/InstancedBufferGeometry.html',
    InstancedInterleavedBuffer: 'https://threejs.org/docs/api/core/InstancedInterleavedBuffer.html',
    InterleavedBuffer: 'https://threejs.org/docs/api/core/InterleavedBuffer.html',
    InterleavedBufferAttribute: 'https://threejs.org/docs/api/core/InterleavedBufferAttribute.html',
    Layers: 'https://threejs.org/docs/api/core/Layers.html',
    Object3D: 'https://threejs.org/docs/api/core/Object3D.html',
    Raycaster: 'https://threejs.org/docs/api/core/Raycaster.html',
    Uniform: 'https://threejs.org/docs/api/core/Uniform.html',
    BufferAttributeTypes: 'https://threejs.org/docs/api/core/bufferAttributeTypes/BufferAttributeTypes.html',
    Earcut: 'https://threejs.org/docs/api/extras/Earcut.html',
    ShapeUtils: 'https://threejs.org/docs/api/extras/ShapeUtils.html',
    Curve: 'https://threejs.org/docs/api/extras/core/Curve.html',
    CurvePath: 'https://threejs.org/docs/api/extras/core/CurvePath.html',
    Font: 'https://threejs.org/docs/api/extras/core/Font.html',
    Interpolations: 'https://threejs.org/docs/api/extras/core/Interpolations.html',
    Path: 'https://threejs.org/docs/api/extras/core/Path.html',
    Shape: 'https://threejs.org/docs/api/extras/core/Shape.html',
    ShapePath: 'https://threejs.org/docs/api/extras/core/ShapePath.html',
    ArcCurve: 'https://threejs.org/docs/api/extras/curves/ArcCurve.html',
    CatmullRomCurve3: 'https://threejs.org/docs/api/extras/curves/CatmullRomCurve3.html',
    CubicBezierCurve: 'https://threejs.org/docs/api/extras/curves/CubicBezierCurve.html',
    CubicBezierCurve3: 'https://threejs.org/docs/api/extras/curves/CubicBezierCurve3.html',
    EllipseCurve: 'https://threejs.org/docs/api/extras/curves/EllipseCurve.html',
    LineCurve: 'https://threejs.org/docs/api/extras/curves/LineCurve.html',
    LineCurve3: 'https://threejs.org/docs/api/extras/curves/LineCurve3.html',
    QuadraticBezierCurve: 'https://threejs.org/docs/api/extras/curves/QuadraticBezierCurve.html',
    QuadraticBezierCurve3: 'https://threejs.org/docs/api/extras/curves/QuadraticBezierCurve3.html',
    SplineCurve: 'https://threejs.org/docs/api/extras/curves/SplineCurve.html',
    ImmediateRenderObject: 'https://threejs.org/docs/api/extras/objects/ImmediateRenderObject.html',
    BoxBufferGeometry: 'https://threejs.org/docs/api/geometries/BoxBufferGeometry.html',
    BoxGeometry: 'https://threejs.org/docs/api/geometries/BoxGeometry.html',
    CircleBufferGeometry: 'https://threejs.org/docs/api/geometries/CircleBufferGeometry.html',
    CircleGeometry: 'https://threejs.org/docs/api/geometries/CircleGeometry.html',
    ConeBufferGeometry: 'https://threejs.org/docs/api/geometries/ConeBufferGeometry.html',
    ConeGeometry: 'https://threejs.org/docs/api/geometries/ConeGeometry.html',
    CylinderBufferGeometry: 'https://threejs.org/docs/api/geometries/CylinderBufferGeometry.html',
    CylinderGeometry: 'https://threejs.org/docs/api/geometries/CylinderGeometry.html',
    DodecahedronBufferGeometry: 'https://threejs.org/docs/api/geometries/DodecahedronBufferGeometry.html',
    DodecahedronGeometry: 'https://threejs.org/docs/api/geometries/DodecahedronGeometry.html',
    EdgesGeometry: 'https://threejs.org/docs/api/geometries/EdgesGeometry.html',
    ExtrudeBufferGeometry: 'https://threejs.org/docs/api/geometries/ExtrudeBufferGeometry.html',
    ExtrudeGeometry: 'https://threejs.org/docs/api/geometries/ExtrudeGeometry.html',
    IcosahedronBufferGeometry: 'https://threejs.org/docs/api/geometries/IcosahedronBufferGeometry.html',
    IcosahedronGeometry: 'https://threejs.org/docs/api/geometries/IcosahedronGeometry.html',
    LatheBufferGeometry: 'https://threejs.org/docs/api/geometries/LatheBufferGeometry.html',
    LatheGeometry: 'https://threejs.org/docs/api/geometries/LatheGeometry.html',
    OctahedronBufferGeometry: 'https://threejs.org/docs/api/geometries/OctahedronBufferGeometry.html',
    OctahedronGeometry: 'https://threejs.org/docs/api/geometries/OctahedronGeometry.html',
    ParametricBufferGeometry: 'https://threejs.org/docs/api/geometries/ParametricBufferGeometry.html',
    ParametricGeometry: 'https://threejs.org/docs/api/geometries/ParametricGeometry.html',
    PlaneBufferGeometry: 'https://threejs.org/docs/api/geometries/PlaneBufferGeometry.html',
    PlaneGeometry: 'https://threejs.org/docs/api/geometries/PlaneGeometry.html',
    PolyhedronBufferGeometry: 'https://threejs.org/docs/api/geometries/PolyhedronBufferGeometry.html',
    PolyhedronGeometry: 'https://threejs.org/docs/api/geometries/PolyhedronGeometry.html',
    RingBufferGeometry: 'https://threejs.org/docs/api/geometries/RingBufferGeometry.html',
    RingGeometry: 'https://threejs.org/docs/api/geometries/RingGeometry.html',
    ShapeBufferGeometry: 'https://threejs.org/docs/api/geometries/ShapeBufferGeometry.html',
    ShapeGeometry: 'https://threejs.org/docs/api/geometries/ShapeGeometry.html',
    SphereBufferGeometry: 'https://threejs.org/docs/api/geometries/SphereBufferGeometry.html',
    SphereGeometry: 'https://threejs.org/docs/api/geometries/SphereGeometry.html',
    TetrahedronBufferGeometry: 'https://threejs.org/docs/api/geometries/TetrahedronBufferGeometry.html',
    TetrahedronGeometry: 'https://threejs.org/docs/api/geometries/TetrahedronGeometry.html',
    TextBufferGeometry: 'https://threejs.org/docs/api/geometries/TextBufferGeometry.html',
    TextGeometry: 'https://threejs.org/docs/api/geometries/TextGeometry.html',
    TorusBufferGeometry: 'https://threejs.org/docs/api/geometries/TorusBufferGeometry.html',
    TorusGeometry: 'https://threejs.org/docs/api/geometries/TorusGeometry.html',
    TorusKnotBufferGeometry: 'https://threejs.org/docs/api/geometries/TorusKnotBufferGeometry.html',
    TorusKnotGeometry: 'https://threejs.org/docs/api/geometries/TorusKnotGeometry.html',
    TubeBufferGeometry: 'https://threejs.org/docs/api/geometries/TubeBufferGeometry.html',
    TubeGeometry: 'https://threejs.org/docs/api/geometries/TubeGeometry.html',
    WireframeGeometry: 'https://threejs.org/docs/api/geometries/WireframeGeometry.html',
    ArrowHelper: 'https://threejs.org/docs/api/helpers/ArrowHelper.html',
    AxesHelper: 'https://threejs.org/docs/api/helpers/AxesHelper.html',
    BoxHelper: 'https://threejs.org/docs/api/helpers/BoxHelper.html',
    Box3Helper: 'https://threejs.org/docs/api/helpers/Box3Helper.html',
    CameraHelper: 'https://threejs.org/docs/api/helpers/CameraHelper.html',
    DirectionalLightHelper: 'https://threejs.org/docs/api/helpers/DirectionalLightHelper.html',
    FaceNormalsHelper: 'https://threejs.org/docs/api/helpers/FaceNormalsHelper.html',
    GridHelper: 'https://threejs.org/docs/api/helpers/GridHelper.html',
    PolarGridHelper: 'https://threejs.org/docs/api/helpers/PolarGridHelper.html',
    HemisphereLightHelper: 'https://threejs.org/docs/api/helpers/HemisphereLightHelper.html',
    PlaneHelper: 'https://threejs.org/docs/api/helpers/PlaneHelper.html',
    PointLightHelper: 'https://threejs.org/docs/api/helpers/PointLightHelper.html',
    RectAreaLightHelper: 'https://threejs.org/docs/api/helpers/RectAreaLightHelper.html',
    SkeletonHelper: 'https://threejs.org/docs/api/helpers/SkeletonHelper.html',
    SpotLightHelper: 'https://threejs.org/docs/api/helpers/SpotLightHelper.html',
    VertexNormalsHelper: 'https://threejs.org/docs/api/helpers/VertexNormalsHelper.html',
    AmbientLight: 'https://threejs.org/docs/api/lights/AmbientLight.html',
    DirectionalLight: 'https://threejs.org/docs/api/lights/DirectionalLight.html',
    HemisphereLight: 'https://threejs.org/docs/api/lights/HemisphereLight.html',
    Light: 'https://threejs.org/docs/api/lights/Light.html',
    PointLight: 'https://threejs.org/docs/api/lights/PointLight.html',
    RectAreaLight: 'https://threejs.org/docs/api/lights/RectAreaLight.html',
    SpotLight: 'https://threejs.org/docs/api/lights/SpotLight.html',
    DirectionalLightShadow: 'https://threejs.org/docs/api/lights/shadows/DirectionalLightShadow.html',
    LightShadow: 'https://threejs.org/docs/api/lights/shadows/LightShadow.html',
    SpotLightShadow: 'https://threejs.org/docs/api/lights/shadows/SpotLightShadow.html',
    AnimationLoader: 'https://threejs.org/docs/api/loaders/AnimationLoader.html',
    AudioLoader: 'https://threejs.org/docs/api/loaders/AudioLoader.html',
    BufferGeometryLoader: 'https://threejs.org/docs/api/loaders/BufferGeometryLoader.html',
    Cache: 'https://threejs.org/docs/api/loaders/Cache.html',
    CompressedTextureLoader: 'https://threejs.org/docs/api/loaders/CompressedTextureLoader.html',
    CubeTextureLoader: 'https://threejs.org/docs/api/loaders/CubeTextureLoader.html',
    DataTextureLoader: 'https://threejs.org/docs/api/loaders/DataTextureLoader.html',
    FileLoader: 'https://threejs.org/docs/api/loaders/FileLoader.html',
    FontLoader: 'https://threejs.org/docs/api/loaders/FontLoader.html',
    ImageBitmapLoader: 'https://threejs.org/docs/api/loaders/ImageBitmapLoader.html',
    ImageLoader: 'https://threejs.org/docs/api/loaders/ImageLoader.html',
    JSONLoader: 'https://threejs.org/docs/api/loaders/JSONLoader.html',
    Loader: 'https://threejs.org/docs/api/loaders/Loader.html',
    LoaderUtils: 'https://threejs.org/docs/api/loaders/LoaderUtils.html',
    MaterialLoader: 'https://threejs.org/docs/api/loaders/MaterialLoader.html',
    ObjectLoader: 'https://threejs.org/docs/api/loaders/ObjectLoader.html',
    TextureLoader: 'https://threejs.org/docs/api/loaders/TextureLoader.html',
    DefaultLoadingManager: 'https://threejs.org/docs/api/loaders/managers/DefaultLoadingManager.html',
    LoadingManager: 'https://threejs.org/docs/api/loaders/managers/LoadingManager.html',
    LineBasicMaterial: 'https://threejs.org/docs/api/materials/LineBasicMaterial.html',
    LineDashedMaterial: 'https://threejs.org/docs/api/materials/LineDashedMaterial.html',
    Material: 'https://threejs.org/docs/api/materials/Material.html',
    MeshBasicMaterial: 'https://threejs.org/docs/api/materials/MeshBasicMaterial.html',
    MeshDepthMaterial: 'https://threejs.org/docs/api/materials/MeshDepthMaterial.html',
    MeshLambertMaterial: 'https://threejs.org/docs/api/materials/MeshLambertMaterial.html',
    MeshNormalMaterial: 'https://threejs.org/docs/api/materials/MeshNormalMaterial.html',
    MeshPhongMaterial: 'https://threejs.org/docs/api/materials/MeshPhongMaterial.html',
    MeshPhysicalMaterial: 'https://threejs.org/docs/api/materials/MeshPhysicalMaterial.html',
    MeshStandardMaterial: 'https://threejs.org/docs/api/materials/MeshStandardMaterial.html',
    MeshToonMaterial: 'https://threejs.org/docs/api/materials/MeshToonMaterial.html',
    PointsMaterial: 'https://threejs.org/docs/api/materials/PointsMaterial.html',
    RawShaderMaterial: 'https://threejs.org/docs/api/materials/RawShaderMaterial.html',
    ShaderMaterial: 'https://threejs.org/docs/api/materials/ShaderMaterial.html',
    ShadowMaterial: 'https://threejs.org/docs/api/materials/ShadowMaterial.html',
    SpriteMaterial: 'https://threejs.org/docs/api/materials/SpriteMaterial.html',
    Box2: 'https://threejs.org/docs/api/math/Box2.html',
    Box3: 'https://threejs.org/docs/api/math/Box3.html',
    Color: 'https://threejs.org/docs/api/math/Color.html',
    Cylindrical: 'https://threejs.org/docs/api/math/Cylindrical.html',
    Euler: 'https://threejs.org/docs/api/math/Euler.html',
    Frustum: 'https://threejs.org/docs/api/math/Frustum.html',
    Interpolant: 'https://threejs.org/docs/api/math/Interpolant.html',
    Line3: 'https://threejs.org/docs/api/math/Line3.html',
    Math: 'https://threejs.org/docs/api/math/Math.html',
    Matrix3: 'https://threejs.org/docs/api/math/Matrix3.html',
    Matrix4: 'https://threejs.org/docs/api/math/Matrix4.html',
    Plane: 'https://threejs.org/docs/api/math/Plane.html',
    Quaternion: 'https://threejs.org/docs/api/math/Quaternion.html',
    Ray: 'https://threejs.org/docs/api/math/Ray.html',
    Sphere: 'https://threejs.org/docs/api/math/Sphere.html',
    Spherical: 'https://threejs.org/docs/api/math/Spherical.html',
    Triangle: 'https://threejs.org/docs/api/math/Triangle.html',
    Vector2: 'https://threejs.org/docs/api/math/Vector2.html',
    Vector3: 'https://threejs.org/docs/api/math/Vector3.html',
    Vector4: 'https://threejs.org/docs/api/math/Vector4.html',
    CubicInterpolant: 'https://threejs.org/docs/api/math/interpolants/CubicInterpolant.html',
    DiscreteInterpolant: 'https://threejs.org/docs/api/math/interpolants/DiscreteInterpolant.html',
    LinearInterpolant: 'https://threejs.org/docs/api/math/interpolants/LinearInterpolant.html',
    QuaternionLinearInterpolant: 'https://threejs.org/docs/api/math/interpolants/QuaternionLinearInterpolant.html',
    Bone: 'https://threejs.org/docs/api/objects/Bone.html',
    Group: 'https://threejs.org/docs/api/objects/Group.html',
    Line: 'https://threejs.org/docs/api/objects/Line.html',
    LineLoop: 'https://threejs.org/docs/api/objects/LineLoop.html',
    LineSegments: 'https://threejs.org/docs/api/objects/LineSegments.html',
    LOD: 'https://threejs.org/docs/api/objects/LOD.html',
    Mesh: 'https://threejs.org/docs/api/objects/Mesh.html',
    Points: 'https://threejs.org/docs/api/objects/Points.html',
    Skeleton: 'https://threejs.org/docs/api/objects/Skeleton.html',
    SkinnedMesh: 'https://threejs.org/docs/api/objects/SkinnedMesh.html',
    Sprite: 'https://threejs.org/docs/api/objects/Sprite.html',
    WebGLRenderer: 'https://threejs.org/docs/api/renderers/WebGLRenderer.html',
    WebGLRenderTarget: 'https://threejs.org/docs/api/renderers/WebGLRenderTarget.html',
    WebGLRenderTargetCube: 'https://threejs.org/docs/api/renderers/WebGLRenderTargetCube.html',
    ShaderChunk: 'https://threejs.org/docs/api/renderers/shaders/ShaderChunk.html',
    ShaderLib: 'https://threejs.org/docs/api/renderers/shaders/ShaderLib.html',
    UniformsLib: 'https://threejs.org/docs/api/renderers/shaders/UniformsLib.html',
    UniformsUtils: 'https://threejs.org/docs/api/renderers/shaders/UniformsUtils.html',
    Fog: 'https://threejs.org/docs/api/scenes/Fog.html',
    FogExp2: 'https://threejs.org/docs/api/scenes/FogExp2.html',
    Scene: 'https://threejs.org/docs/api/scenes/Scene.html',
    CanvasTexture: 'https://threejs.org/docs/api/textures/CanvasTexture.html',
    CompressedTexture: 'https://threejs.org/docs/api/textures/CompressedTexture.html',
    CubeTexture: 'https://threejs.org/docs/api/textures/CubeTexture.html',
    DataTexture: 'https://threejs.org/docs/api/textures/DataTexture.html',
    DepthTexture: 'https://threejs.org/docs/api/textures/DepthTexture.html',
    Texture: 'https://threejs.org/docs/api/textures/Texture.html',
    VideoTexture: 'https://threejs.org/docs/api/textures/VideoTexture.html',
    CCDIKSolver: 'https://threejs.org/docs/examples/animations/CCDIKSolver.html',
    MMDAnimationHelper: 'https://threejs.org/docs/examples/animations/MMDAnimationHelper.html',
    MMDPhysics: 'https://threejs.org/docs/examples/animations/MMDPhysics.html',
    OrbitControls: 'https://threejs.org/docs/examples/controls/OrbitControls.html',
    ConvexBufferGeometry: 'https://threejs.org/docs/examples/geometries/ConvexBufferGeometry.html',
    ConvexGeometry: 'https://threejs.org/docs/examples/geometries/ConvexGeometry.html',
    DecalGeometry: 'https://threejs.org/docs/examples/geometries/DecalGeometry.html',
    BabylonLoader: 'https://threejs.org/docs/examples/loaders/BabylonLoader.html',
    GLTFLoader: 'https://threejs.org/docs/examples/loaders/GLTFLoader.html',
    MMDLoader: 'https://threejs.org/docs/examples/loaders/MMDLoader.html',
    MTLLoader: 'https://threejs.org/docs/examples/loaders/MTLLoader.html',
    OBJLoader: 'https://threejs.org/docs/examples/loaders/OBJLoader.html',
    OBJLoader2: 'https://threejs.org/docs/examples/loaders/OBJLoader2.html',
    LoaderSupport: 'https://threejs.org/docs/examples/loaders/LoaderSupport.html',
    PCDLoader: 'https://threejs.org/docs/examples/loaders/PCDLoader.html',
    PDBLoader: 'https://threejs.org/docs/examples/loaders/PDBLoader.html',
    SVGLoader: 'https://threejs.org/docs/examples/loaders/SVGLoader.html',
    TGALoader: 'https://threejs.org/docs/examples/loaders/TGALoader.html',
    PRWMLoader: 'https://threejs.org/docs/examples/loaders/PRWMLoader.html',
    Lensflare: 'https://threejs.org/docs/examples/objects/Lensflare.html',
    GLTFExporter: 'https://threejs.org/docs/examples/exporters/GLTFExporter.html',
  };

  function getKeywordLink(keyword) {
    return keyword.startsWith('THREE.')
      ? codeKeywordLinks[keyword.substring(6)]
      : codeKeywordLinks[keyword];
  }

  $('code').filter(function() {
    return getKeywordLink(this.textContent) &&
           this.parentElement.nodeName !== 'A';
  }).wrap(function() {
    const a = document.createElement('a');
    a.href = getKeywordLink(this.textContent);
    return a;
  });

  const methodPropertyRE = /^(\w+).(\w+)$/;
  const classRE = /^(\w+)$/;
  $('a').each(function() {
    const href = this.getAttribute('href');
    const m = methodPropertyRE.exec(href);
    if (m) {
      const codeKeywordLink = getKeywordLink(m[1]);
      if (codeKeywordLink) {
        this.setAttribute('href', `${codeKeywordLink}#${m[2]}`);
      }
    } else if (classRE.test(href)) {
      const codeKeywordLink = getKeywordLink(href);
      if (codeKeywordLink) {
        this.setAttribute('href', codeKeywordLink);
      }
    }
  });

  const linkImgs = function(bigHref) {
    return function() {
      const a = document.createElement('a');
      a.href = bigHref;
      a.title = this.alt;
      a.className = this.className;
      a.setAttribute('align', this.align);
      this.setAttribute('align', '');
      this.className = '';
      this.style.border = '0px';
      return a;
    };
  };
  const linkSmallImgs = function(ext) {
    return function() {
      const src = this.src;
      return linkImgs(src.substr(0, src.length - 7) + ext);
    };
  };
  const linkBigImgs = function() {
    const src = $(this).attr('big');
    return linkImgs(src);
  };
  $('img[big$=".jpg"]').wrap(linkBigImgs);
  $('img[src$="-sm.jpg"]').wrap(linkSmallImgs('.jpg'));
  $('img[src$="-sm.gif"]').wrap(linkSmallImgs('.gif'));
  $('img[src$="-sm.png"]').wrap(linkSmallImgs('.png'));
  $('pre>code')
    .unwrap()
    .replaceWith(function() {
      return $('<pre class="prettyprint showlinemods">' + this.innerHTML + '</pre>');
    });
  if (window.prettyPrint) {
    window.prettyPrint();
  }

  const params = getQueryParams();
  if (params.doubleSpace || params.doublespace) {
    document.body.className = document.body.className + ' doubleSpace';
  }

  $('.language').on('change', function() {
    window.location.href = this.value;
  });

});
}(jQuery));

