// Licensed under a BSD license. See license.html for license
'use strict';  // eslint-disable-line

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
  const supportedLangs = {
    'en': true,
    'zh': true,
  };

  function insertLang(codeKeywordLinks) {
    const lang = document.documentElement.lang.substr(0, 2).toLowerCase();
    const langPart = `#api/${supportedLangs[lang] ? lang : 'en'}/`;
    const langAddedLinks = {};
    for (const [keyword, url] of Object.entries(codeKeywordLinks)) {
      langAddedLinks[keyword] = url.replace('#api/', langPart);
    }
    return langAddedLinks;
  }

  const codeKeywordLinks = insertLang({
    AnimationAction: 'https://threejs.org/docs/#api/animation/AnimationAction',
    AnimationClip: 'https://threejs.org/docs/#api/animation/AnimationClip',
    AnimationMixer: 'https://threejs.org/docs/#api/animation/AnimationMixer',
    AnimationObjectGroup: 'https://threejs.org/docs/#api/animation/AnimationObjectGroup',
    AnimationUtils: 'https://threejs.org/docs/#api/animation/AnimationUtils',
    KeyframeTrack: 'https://threejs.org/docs/#api/animation/KeyframeTrack',
    PropertyBinding: 'https://threejs.org/docs/#api/animation/PropertyBinding',
    PropertyMixer: 'https://threejs.org/docs/#api/animation/PropertyMixer',
    BooleanKeyframeTrack: 'https://threejs.org/docs/#api/animation/tracks/BooleanKeyframeTrack',
    ColorKeyframeTrack: 'https://threejs.org/docs/#api/animation/tracks/ColorKeyframeTrack',
    NumberKeyframeTrack: 'https://threejs.org/docs/#api/animation/tracks/NumberKeyframeTrack',
    QuaternionKeyframeTrack: 'https://threejs.org/docs/#api/animation/tracks/QuaternionKeyframeTrack',
    StringKeyframeTrack: 'https://threejs.org/docs/#api/animation/tracks/StringKeyframeTrack',
    VectorKeyframeTrack: 'https://threejs.org/docs/#api/animation/tracks/VectorKeyframeTrack',
    Audio: 'https://threejs.org/docs/#api/audio/Audio',
    AudioAnalyser: 'https://threejs.org/docs/#api/audio/AudioAnalyser',
    AudioContext: 'https://threejs.org/docs/#api/audio/AudioContext',
    AudioListener: 'https://threejs.org/docs/#api/audio/AudioListener',
    PositionalAudio: 'https://threejs.org/docs/#api/audio/PositionalAudio',
    ArrayCamera: 'https://threejs.org/docs/#api/cameras/ArrayCamera',
    Camera: 'https://threejs.org/docs/#api/cameras/Camera',
    CubeCamera: 'https://threejs.org/docs/#api/cameras/CubeCamera',
    OrthographicCamera: 'https://threejs.org/docs/#api/cameras/OrthographicCamera',
    PerspectiveCamera: 'https://threejs.org/docs/#api/cameras/PerspectiveCamera',
    StereoCamera: 'https://threejs.org/docs/#api/cameras/StereoCamera',
    Animation: 'https://threejs.org/docs/#api/constants/Animation',
    Core: 'https://threejs.org/docs/#api/constants/Core',
    CustomBlendingEquation: 'https://threejs.org/docs/#api/constants/CustomBlendingEquations',
    DrawModes: 'https://threejs.org/docs/#api/constants/DrawModes',
    Materials: 'https://threejs.org/docs/#api/constants/Materials',
    Renderer: 'https://threejs.org/docs/#api/constants/Renderer',
    Textures: 'https://threejs.org/docs/#api/constants/Textures',
    BufferAttribute: 'https://threejs.org/docs/#api/core/BufferAttribute',
    BufferGeometry: 'https://threejs.org/docs/#api/core/BufferGeometry',
    Clock: 'https://threejs.org/docs/#api/core/Clock',
    DirectGeometry: 'https://threejs.org/docs/#api/core/DirectGeometry',
    EventDispatcher: 'https://threejs.org/docs/#api/core/EventDispatcher',
    Face3: 'https://threejs.org/docs/#api/core/Face3',
    Geometry: 'https://threejs.org/docs/#api/core/Geometry',
    InstancedBufferAttribute: 'https://threejs.org/docs/#api/core/InstancedBufferAttribute',
    InstancedBufferGeometry: 'https://threejs.org/docs/#api/core/InstancedBufferGeometry',
    InstancedInterleavedBuffer: 'https://threejs.org/docs/#api/core/InstancedInterleavedBuffer',
    InterleavedBuffer: 'https://threejs.org/docs/#api/core/InterleavedBuffer',
    InterleavedBufferAttribute: 'https://threejs.org/docs/#api/core/InterleavedBufferAttribute',
    Layers: 'https://threejs.org/docs/#api/core/Layers',
    Object3D: 'https://threejs.org/docs/#api/core/Object3D',
    Raycaster: 'https://threejs.org/docs/#api/core/Raycaster',
    Uniform: 'https://threejs.org/docs/#api/core/Uniform',
    BufferAttributeTypes: 'https://threejs.org/docs/#api/core/bufferAttributeTypes/BufferAttributeTypes',
    Earcut: 'https://threejs.org/docs/#api/extras/Earcut',
    ShapeUtils: 'https://threejs.org/docs/#api/extras/ShapeUtils',
    Curve: 'https://threejs.org/docs/#api/extras/core/Curve',
    CurvePath: 'https://threejs.org/docs/#api/extras/core/CurvePath',
    Font: 'https://threejs.org/docs/#api/extras/core/Font',
    Interpolations: 'https://threejs.org/docs/#api/extras/core/Interpolations',
    Path: 'https://threejs.org/docs/#api/extras/core/Path',
    Shape: 'https://threejs.org/docs/#api/extras/core/Shape',
    ShapePath: 'https://threejs.org/docs/#api/extras/core/ShapePath',
    ArcCurve: 'https://threejs.org/docs/#api/extras/curves/ArcCurve',
    CatmullRomCurve3: 'https://threejs.org/docs/#api/extras/curves/CatmullRomCurve3',
    CubicBezierCurve: 'https://threejs.org/docs/#api/extras/curves/CubicBezierCurve',
    CubicBezierCurve3: 'https://threejs.org/docs/#api/extras/curves/CubicBezierCurve3',
    EllipseCurve: 'https://threejs.org/docs/#api/extras/curves/EllipseCurve',
    LineCurve: 'https://threejs.org/docs/#api/extras/curves/LineCurve',
    LineCurve3: 'https://threejs.org/docs/#api/extras/curves/LineCurve3',
    QuadraticBezierCurve: 'https://threejs.org/docs/#api/extras/curves/QuadraticBezierCurve',
    QuadraticBezierCurve3: 'https://threejs.org/docs/#api/extras/curves/QuadraticBezierCurve3',
    SplineCurve: 'https://threejs.org/docs/#api/extras/curves/SplineCurve',
    ImmediateRenderObject: 'https://threejs.org/docs/#api/extras/objects/ImmediateRenderObject',
    BoxBufferGeometry: 'https://threejs.org/docs/#api/geometries/BoxBufferGeometry',
    BoxGeometry: 'https://threejs.org/docs/#api/geometries/BoxGeometry',
    CircleBufferGeometry: 'https://threejs.org/docs/#api/geometries/CircleBufferGeometry',
    CircleGeometry: 'https://threejs.org/docs/#api/geometries/CircleGeometry',
    ConeBufferGeometry: 'https://threejs.org/docs/#api/geometries/ConeBufferGeometry',
    ConeGeometry: 'https://threejs.org/docs/#api/geometries/ConeGeometry',
    CylinderBufferGeometry: 'https://threejs.org/docs/#api/geometries/CylinderBufferGeometry',
    CylinderGeometry: 'https://threejs.org/docs/#api/geometries/CylinderGeometry',
    DodecahedronBufferGeometry: 'https://threejs.org/docs/#api/geometries/DodecahedronBufferGeometry',
    DodecahedronGeometry: 'https://threejs.org/docs/#api/geometries/DodecahedronGeometry',
    EdgesGeometry: 'https://threejs.org/docs/#api/geometries/EdgesGeometry',
    ExtrudeBufferGeometry: 'https://threejs.org/docs/#api/geometries/ExtrudeBufferGeometry',
    ExtrudeGeometry: 'https://threejs.org/docs/#api/geometries/ExtrudeGeometry',
    IcosahedronBufferGeometry: 'https://threejs.org/docs/#api/geometries/IcosahedronBufferGeometry',
    IcosahedronGeometry: 'https://threejs.org/docs/#api/geometries/IcosahedronGeometry',
    LatheBufferGeometry: 'https://threejs.org/docs/#api/geometries/LatheBufferGeometry',
    LatheGeometry: 'https://threejs.org/docs/#api/geometries/LatheGeometry',
    OctahedronBufferGeometry: 'https://threejs.org/docs/#api/geometries/OctahedronBufferGeometry',
    OctahedronGeometry: 'https://threejs.org/docs/#api/geometries/OctahedronGeometry',
    ParametricBufferGeometry: 'https://threejs.org/docs/#api/geometries/ParametricBufferGeometry',
    ParametricGeometry: 'https://threejs.org/docs/#api/geometries/ParametricGeometry',
    PlaneBufferGeometry: 'https://threejs.org/docs/#api/geometries/PlaneBufferGeometry',
    PlaneGeometry: 'https://threejs.org/docs/#api/geometries/PlaneGeometry',
    PolyhedronBufferGeometry: 'https://threejs.org/docs/#api/geometries/PolyhedronBufferGeometry',
    PolyhedronGeometry: 'https://threejs.org/docs/#api/geometries/PolyhedronGeometry',
    RingBufferGeometry: 'https://threejs.org/docs/#api/geometries/RingBufferGeometry',
    RingGeometry: 'https://threejs.org/docs/#api/geometries/RingGeometry',
    ShapeBufferGeometry: 'https://threejs.org/docs/#api/geometries/ShapeBufferGeometry',
    ShapeGeometry: 'https://threejs.org/docs/#api/geometries/ShapeGeometry',
    SphereBufferGeometry: 'https://threejs.org/docs/#api/geometries/SphereBufferGeometry',
    SphereGeometry: 'https://threejs.org/docs/#api/geometries/SphereGeometry',
    TetrahedronBufferGeometry: 'https://threejs.org/docs/#api/geometries/TetrahedronBufferGeometry',
    TetrahedronGeometry: 'https://threejs.org/docs/#api/geometries/TetrahedronGeometry',
    TextBufferGeometry: 'https://threejs.org/docs/#api/geometries/TextBufferGeometry',
    TextGeometry: 'https://threejs.org/docs/#api/geometries/TextGeometry',
    TorusBufferGeometry: 'https://threejs.org/docs/#api/geometries/TorusBufferGeometry',
    TorusGeometry: 'https://threejs.org/docs/#api/geometries/TorusGeometry',
    TorusKnotBufferGeometry: 'https://threejs.org/docs/#api/geometries/TorusKnotBufferGeometry',
    TorusKnotGeometry: 'https://threejs.org/docs/#api/geometries/TorusKnotGeometry',
    TubeBufferGeometry: 'https://threejs.org/docs/#api/geometries/TubeBufferGeometry',
    TubeGeometry: 'https://threejs.org/docs/#api/geometries/TubeGeometry',
    WireframeGeometry: 'https://threejs.org/docs/#api/geometries/WireframeGeometry',
    ArrowHelper: 'https://threejs.org/docs/#api/helpers/ArrowHelper',
    AxesHelper: 'https://threejs.org/docs/#api/helpers/AxesHelper',
    BoxHelper: 'https://threejs.org/docs/#api/helpers/BoxHelper',
    Box3Helper: 'https://threejs.org/docs/#api/helpers/Box3Helper',
    CameraHelper: 'https://threejs.org/docs/#api/helpers/CameraHelper',
    DirectionalLightHelper: 'https://threejs.org/docs/#api/helpers/DirectionalLightHelper',
    FaceNormalsHelper: 'https://threejs.org/docs/#api/helpers/FaceNormalsHelper',
    GridHelper: 'https://threejs.org/docs/#api/helpers/GridHelper',
    PolarGridHelper: 'https://threejs.org/docs/#api/helpers/PolarGridHelper',
    HemisphereLightHelper: 'https://threejs.org/docs/#api/helpers/HemisphereLightHelper',
    PlaneHelper: 'https://threejs.org/docs/#api/helpers/PlaneHelper',
    PointLightHelper: 'https://threejs.org/docs/#api/helpers/PointLightHelper',
    RectAreaLightHelper: 'https://threejs.org/docs/#api/helpers/RectAreaLightHelper',
    SkeletonHelper: 'https://threejs.org/docs/#api/helpers/SkeletonHelper',
    SpotLightHelper: 'https://threejs.org/docs/#api/helpers/SpotLightHelper',
    VertexNormalsHelper: 'https://threejs.org/docs/#api/helpers/VertexNormalsHelper',
    AmbientLight: 'https://threejs.org/docs/#api/lights/AmbientLight',
    DirectionalLight: 'https://threejs.org/docs/#api/lights/DirectionalLight',
    HemisphereLight: 'https://threejs.org/docs/#api/lights/HemisphereLight',
    Light: 'https://threejs.org/docs/#api/lights/Light',
    PointLight: 'https://threejs.org/docs/#api/lights/PointLight',
    RectAreaLight: 'https://threejs.org/docs/#api/lights/RectAreaLight',
    SpotLight: 'https://threejs.org/docs/#api/lights/SpotLight',
    DirectionalLightShadow: 'https://threejs.org/docs/#api/lights/shadows/DirectionalLightShadow',
    LightShadow: 'https://threejs.org/docs/#api/lights/shadows/LightShadow',
    SpotLightShadow: 'https://threejs.org/docs/#api/lights/shadows/SpotLightShadow',
    AnimationLoader: 'https://threejs.org/docs/#api/loaders/AnimationLoader',
    AudioLoader: 'https://threejs.org/docs/#api/loaders/AudioLoader',
    BufferGeometryLoader: 'https://threejs.org/docs/#api/loaders/BufferGeometryLoader',
    Cache: 'https://threejs.org/docs/#api/loaders/Cache',
    CompressedTextureLoader: 'https://threejs.org/docs/#api/loaders/CompressedTextureLoader',
    CubeTextureLoader: 'https://threejs.org/docs/#api/loaders/CubeTextureLoader',
    DataTextureLoader: 'https://threejs.org/docs/#api/loaders/DataTextureLoader',
    FileLoader: 'https://threejs.org/docs/#api/loaders/FileLoader',
    FontLoader: 'https://threejs.org/docs/#api/loaders/FontLoader',
    ImageBitmapLoader: 'https://threejs.org/docs/#api/loaders/ImageBitmapLoader',
    ImageLoader: 'https://threejs.org/docs/#api/loaders/ImageLoader',
    JSONLoader: 'https://threejs.org/docs/#api/loaders/JSONLoader',
    Loader: 'https://threejs.org/docs/#api/loaders/Loader',
    LoaderUtils: 'https://threejs.org/docs/#api/loaders/LoaderUtils',
    MaterialLoader: 'https://threejs.org/docs/#api/loaders/MaterialLoader',
    ObjectLoader: 'https://threejs.org/docs/#api/loaders/ObjectLoader',
    TextureLoader: 'https://threejs.org/docs/#api/loaders/TextureLoader',
    DefaultLoadingManager: 'https://threejs.org/docs/#api/loaders/managers/DefaultLoadingManager',
    LoadingManager: 'https://threejs.org/docs/#api/loaders/managers/LoadingManager',
    LineBasicMaterial: 'https://threejs.org/docs/#api/materials/LineBasicMaterial',
    LineDashedMaterial: 'https://threejs.org/docs/#api/materials/LineDashedMaterial',
    Material: 'https://threejs.org/docs/#api/materials/Material',
    MeshBasicMaterial: 'https://threejs.org/docs/#api/materials/MeshBasicMaterial',
    MeshDepthMaterial: 'https://threejs.org/docs/#api/materials/MeshDepthMaterial',
    MeshLambertMaterial: 'https://threejs.org/docs/#api/materials/MeshLambertMaterial',
    MeshNormalMaterial: 'https://threejs.org/docs/#api/materials/MeshNormalMaterial',
    MeshPhongMaterial: 'https://threejs.org/docs/#api/materials/MeshPhongMaterial',
    MeshPhysicalMaterial: 'https://threejs.org/docs/#api/materials/MeshPhysicalMaterial',
    MeshStandardMaterial: 'https://threejs.org/docs/#api/materials/MeshStandardMaterial',
    MeshToonMaterial: 'https://threejs.org/docs/#api/materials/MeshToonMaterial',
    PointsMaterial: 'https://threejs.org/docs/#api/materials/PointsMaterial',
    RawShaderMaterial: 'https://threejs.org/docs/#api/materials/RawShaderMaterial',
    ShaderMaterial: 'https://threejs.org/docs/#api/materials/ShaderMaterial',
    ShadowMaterial: 'https://threejs.org/docs/#api/materials/ShadowMaterial',
    SpriteMaterial: 'https://threejs.org/docs/#api/materials/SpriteMaterial',
    Box2: 'https://threejs.org/docs/#api/math/Box2',
    Box3: 'https://threejs.org/docs/#api/math/Box3',
    Color: 'https://threejs.org/docs/#api/math/Color',
    Cylindrical: 'https://threejs.org/docs/#api/math/Cylindrical',
    Euler: 'https://threejs.org/docs/#api/math/Euler',
    Frustum: 'https://threejs.org/docs/#api/math/Frustum',
    Interpolant: 'https://threejs.org/docs/#api/math/Interpolant',
    Line3: 'https://threejs.org/docs/#api/math/Line3',
    Math: 'https://threejs.org/docs/#api/math/Math',
    Matrix3: 'https://threejs.org/docs/#api/math/Matrix3',
    Matrix4: 'https://threejs.org/docs/#api/math/Matrix4',
    Plane: 'https://threejs.org/docs/#api/math/Plane',
    Quaternion: 'https://threejs.org/docs/#api/math/Quaternion',
    Ray: 'https://threejs.org/docs/#api/math/Ray',
    Sphere: 'https://threejs.org/docs/#api/math/Sphere',
    Spherical: 'https://threejs.org/docs/#api/math/Spherical',
    Triangle: 'https://threejs.org/docs/#api/math/Triangle',
    Vector2: 'https://threejs.org/docs/#api/math/Vector2',
    Vector3: 'https://threejs.org/docs/#api/math/Vector3',
    Vector4: 'https://threejs.org/docs/#api/math/Vector4',
    CubicInterpolant: 'https://threejs.org/docs/#api/math/interpolants/CubicInterpolant',
    DiscreteInterpolant: 'https://threejs.org/docs/#api/math/interpolants/DiscreteInterpolant',
    LinearInterpolant: 'https://threejs.org/docs/#api/math/interpolants/LinearInterpolant',
    QuaternionLinearInterpolant: 'https://threejs.org/docs/#api/math/interpolants/QuaternionLinearInterpolant',
    Bone: 'https://threejs.org/docs/#api/objects/Bone',
    Group: 'https://threejs.org/docs/#api/objects/Group',
    Line: 'https://threejs.org/docs/#api/objects/Line',
    LineLoop: 'https://threejs.org/docs/#api/objects/LineLoop',
    LineSegments: 'https://threejs.org/docs/#api/objects/LineSegments',
    LOD: 'https://threejs.org/docs/#api/objects/LOD',
    Mesh: 'https://threejs.org/docs/#api/objects/Mesh',
    Points: 'https://threejs.org/docs/#api/objects/Points',
    Skeleton: 'https://threejs.org/docs/#api/objects/Skeleton',
    SkinnedMesh: 'https://threejs.org/docs/#api/objects/SkinnedMesh',
    Sprite: 'https://threejs.org/docs/#api/objects/Sprite',
    WebGLRenderer: 'https://threejs.org/docs/#api/renderers/WebGLRenderer',
    WebGLRenderTarget: 'https://threejs.org/docs/#api/renderers/WebGLRenderTarget',
    WebGLCubeRenderTarget: 'https://threejs.org/docs/#api/renderers/WebGLCubeRenderTarget',
    ShaderChunk: 'https://threejs.org/docs/#api/renderers/shaders/ShaderChunk',
    ShaderLib: 'https://threejs.org/docs/#api/renderers/shaders/ShaderLib',
    UniformsLib: 'https://threejs.org/docs/#api/renderers/shaders/UniformsLib',
    UniformsUtils: 'https://threejs.org/docs/#api/renderers/shaders/UniformsUtils',
    Fog: 'https://threejs.org/docs/#api/scenes/Fog',
    FogExp2: 'https://threejs.org/docs/#api/scenes/FogExp2',
    Scene: 'https://threejs.org/docs/#api/scenes/Scene',
    CanvasTexture: 'https://threejs.org/docs/#api/textures/CanvasTexture',
    CompressedTexture: 'https://threejs.org/docs/#api/textures/CompressedTexture',
    CubeTexture: 'https://threejs.org/docs/#api/textures/CubeTexture',
    DataTexture: 'https://threejs.org/docs/#api/textures/DataTexture',
    DepthTexture: 'https://threejs.org/docs/#api/textures/DepthTexture',
    Texture: 'https://threejs.org/docs/#api/textures/Texture',
    VideoTexture: 'https://threejs.org/docs/#api/textures/VideoTexture',
    CCDIKSolver: 'https://threejs.org/docs/#examples/animations/CCDIKSolver',
    MMDAnimationHelper: 'https://threejs.org/docs/#examples/animations/MMDAnimationHelper',
    MMDPhysics: 'https://threejs.org/docs/#examples/animations/MMDPhysics',
    OrbitControls: 'https://threejs.org/docs/#examples/controls/OrbitControls',
    ConvexBufferGeometry: 'https://threejs.org/docs/#examples/geometries/ConvexBufferGeometry',
    ConvexGeometry: 'https://threejs.org/docs/#examples/geometries/ConvexGeometry',
    DecalGeometry: 'https://threejs.org/docs/#examples/geometries/DecalGeometry',
    BabylonLoader: 'https://threejs.org/docs/#examples/loaders/BabylonLoader',
    GLTFLoader: 'https://threejs.org/docs/#examples/loaders/GLTFLoader',
    MMDLoader: 'https://threejs.org/docs/#examples/loaders/MMDLoader',
    MTLLoader: 'https://threejs.org/docs/#examples/loaders/MTLLoader',
    OBJLoader: 'https://threejs.org/docs/#examples/loaders/OBJLoader',
    OBJLoader2: 'https://threejs.org/docs/#examples/loaders/OBJLoader2',
    LoaderSupport: 'https://threejs.org/docs/#examples/loaders/LoaderSupport',
    PCDLoader: 'https://threejs.org/docs/#examples/loaders/PCDLoader',
    PDBLoader: 'https://threejs.org/docs/#examples/loaders/PDBLoader',
    SVGLoader: 'https://threejs.org/docs/#examples/loaders/SVGLoader',
    TGALoader: 'https://threejs.org/docs/#examples/loaders/TGALoader',
    PRWMLoader: 'https://threejs.org/docs/#examples/loaders/PRWMLoader',
    Lensflare: 'https://threejs.org/docs/#examples/objects/Lensflare',
    GLTFExporter: 'https://threejs.org/docs/#examples/exporters/GLTFExporter',
  });

  function getKeywordLink(keyword) {
    const dotNdx = keyword.indexOf('.');
    if (dotNdx) {
      const before = keyword.substring(0, dotNdx);
      const link = codeKeywordLinks[before];
      if (link) {
        return `${link}.${keyword.substr(dotNdx + 1)}`;
      }
    }
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

  const methodPropertyRE = /^(\w+)\.(\w+)$/;
  const classRE = /^(\w+)$/;
  $('a').each(function() {
    const href = this.getAttribute('href');
    if (!href) {
      return;
    }
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
      return $('<pre class="prettyprint showlinemods notranslate" translate="no">' + this.innerHTML + '</pre>');
    });
  if (window.prettyPrint) {
    window.prettyPrint();
  }
  $('span[class=com]')
    .replaceWith(function() {
      return $('<span class="com notranslate" translate="yes">' + this.innerHTML + '</span>');
    });

  const params = getQueryParams();
  if (params.doubleSpace || params.doublespace) {
    document.body.className = document.body.className + ' doubleSpace';
  }

  $('.language').on('change', function() {
    window.location.href = this.value;
  });

  if (window.threejsLessonUtils) {
    window.threejsLessonUtils.afterPrettify();
  }
});
}(jQuery));

// ios needs this to allow touch events in an iframe
window.addEventListener('touchstart', {});