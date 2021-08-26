/*eslint-env node*/

'use strict';

process.on('unhandledRejection', up => {
  throw up;
});

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const liveEditor = require('@gfxfundamentals/live-editor');
const liveEditorPath = path.dirname(require.resolve('@gfxfundamentals/live-editor'));
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

// make a fake window because jquery sucks
const dom = new JSDOM('');
global.window = dom.window;
global.document = global.window.document;
const jquery = require('jquery');

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  const s_ignoreRE = /\.(md|py|sh|enc)$/i;
  function noMds(filename) {
    return !s_ignoreRE.test(filename);
  }

  const s_isMdRE = /\.md$/i;
  function mdsOnly(filename) {
    return s_isMdRE.test(filename);
  }

  function notFolder(filename) {
    return !fs.statSync(filename).isDirectory();
  }

  function noMdsNoFolders(filename) {
    return noMds(filename) && notFolder(filename);
  }

  grunt.initConfig({
    eslint: {
      lib: {
        src: [
          'threejs/resources/*.js',
        ],
      },
      support: {
        src: [
          'Gruntfile.js',
          'build/js/build.js',
        ],
      },
      examples: {
        src: [
          'threejs/*.html',
          'threejs/lessons/resources/*.js',
          '!threejs/lessons/resources/prettify.js',
          'threejs/lessons/resources/*.html',
        ],
      },
    },
    copy: {
      main: {
        files: [
          { expand: false, src: '*', dest: 'out/', filter: noMdsNoFolders, },
          { expand: true, cwd: `${liveEditor.monacoEditor}/`, src: 'min/**', dest: 'out/monaco-editor/', nonull: true, },
          { expand: true, cwd: `${liveEditorPath}/src/`, src: '**', dest: 'out/threejs/resources/', nonull: true, },
          { expand: true, src: 'threejs/**', dest: 'out/', filter: noMds, },
          { expand: true, src: '3rdparty/**', dest: 'out/', },
        ],
      },
    },
    clean: [
      'out/**/*',
    ],
    buildlesson: {
      main: {
        files: [],
      },
    },
    watch: {
      main: {
        files: [
          'threejs/**',
          '3rdparty/**',
          'node_modules/@gfxfundamentals/live-editor/src/**',
        ],
        tasks: ['copy'],
        options: {
          spawn: false,
        },
      },
      lessons: {
        files: [
          'threejs/lessons/**/threejs*.md',
        ],
        tasks: ['buildlesson'],
        options: {
          spawn: false,
        },
      },
    },
  });

  let changedFiles = {};
  const onChange = grunt.util._.debounce(function() {
    grunt.config('copy.main.files', Object.keys(changedFiles).filter(noMds).map((file) => {
      const copy = {
        src: file,
        dest: 'out/',
      };
      if (file.indexOf('live-editor') >= 0) {
        copy.cwd = `${path.dirname(file)}/`;
        copy.src = path.basename(file);
        copy.expand = true;
        copy.dest = 'out/threejs/resources/';
      }
      return copy;
    }));
    grunt.config('buildlesson.main.files', Object.keys(changedFiles).filter(mdsOnly).map((file) => {
      return {
        src: file,
      };
    }));
    changedFiles = {};
  }, 200);
  grunt.event.on('watch', function(action, filepath) {
    changedFiles[filepath] = action;
    onChange();
  });

  function fixThreeJSLinks(html) {
    const supportedLangs = {
      'en': true,
      'zh': true,
      'ko': true,
    };

    global.document.open('text/html', 'replace');
    global.document.write(html);
    global.document.close();
    const $ = jquery;

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
      BoxGeometry: 'https://threejs.org/docs/#api/geometries/BoxGeometry',
      CircleGeometry: 'https://threejs.org/docs/#api/geometries/CircleGeometry',
      ConeGeometry: 'https://threejs.org/docs/#api/geometries/ConeGeometry',
      CylinderGeometry: 'https://threejs.org/docs/#api/geometries/CylinderGeometry',
      DodecahedronGeometry: 'https://threejs.org/docs/#api/geometries/DodecahedronGeometry',
      EdgesGeometry: 'https://threejs.org/docs/#api/geometries/EdgesGeometry',
      ExtrudeGeometry: 'https://threejs.org/docs/#api/geometries/ExtrudeGeometry',
      IcosahedronGeometry: 'https://threejs.org/docs/#api/geometries/IcosahedronGeometry',
      LatheGeometry: 'https://threejs.org/docs/#api/geometries/LatheGeometry',
      OctahedronGeometry: 'https://threejs.org/docs/#api/geometries/OctahedronGeometry',
      ParametricGeometry: 'https://threejs.org/docs/#api/geometries/ParametricGeometry',
      PlaneGeometry: 'https://threejs.org/docs/#api/geometries/PlaneGeometry',
      PolyhedronGeometry: 'https://threejs.org/docs/#api/geometries/PolyhedronGeometry',
      RingGeometry: 'https://threejs.org/docs/#api/geometries/RingGeometry',
      ShapeGeometry: 'https://threejs.org/docs/#api/geometries/ShapeGeometry',
      SphereGeometry: 'https://threejs.org/docs/#api/geometries/SphereGeometry',
      TetrahedronGeometry: 'https://threejs.org/docs/#api/geometries/TetrahedronGeometry',
      TextGeometry: 'https://threejs.org/docs/#api/geometries/TextGeometry',
      TorusGeometry: 'https://threejs.org/docs/#api/geometries/TorusGeometry',
      TorusKnotGeometry: 'https://threejs.org/docs/#api/geometries/TorusKnotGeometry',
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

    $('pre>code')
      .unwrap()
      .replaceWith(function() {
        return $(`<pre class="prettyprint showlinemods notranslate ${this.className || ''}" translate="no">${this.innerHTML}</pre>`);
      });

    return dom.serialize();
  }

  const buildSettings = {
    outDir: 'out',
    baseUrl: 'https://threejsfundamentals.org',
    rootFolder: 'threejs',
    lessonGrep: 'threejs*.md',
    siteName: 'ThreeJSFundamentals',
    siteThumbnail: 'threejsfundamentals.jpg',  // in rootFolder/lessons/resources
    templatePath: 'build/templates',
    owner: 'gfxfundamentals',
    repo: 'threejsfundamentals',
    thumbnailOptions: {
      thumbnailBackground: 'threejsfundamentals-background.jpg',
      text: [
        {
          font: 'bold 100px lesson-font',
          verticalSpacing: 100,
          offset: [100, 120],
          textAlign: 'left',
          shadowOffset: [15, 15],
          strokeWidth: 15,
          textWrapWidth: 1000,
        },
        {
          font: 'bold 60px lesson-font',
          text: 'threejsfundamentals.org',
          verticalSpacing: 100,
          offset: [-100, -90],
          textAlign: 'right',
          shadowOffset: [8, 8],
          strokeWidth: 15,
          textWrapWidth: 1000,
          color: 'hsl(340, 100%, 70%)',
        },
      ],
    },
    postHTMLFn: fixThreeJSLinks,
  };

  // just the hackiest way to get this working.
  grunt.registerMultiTask('buildlesson', 'build a lesson', function() {
    const filenames = new Set();
    this.files.forEach((files) => {
      files.src.forEach((filename) => {
        filenames.add(filename);
      });
    });
    const buildStuff = require('@gfxfundamentals/lesson-builder');
    const settings = {...buildSettings, filenames};
    const finish = this.async();
    buildStuff(settings).finally(finish);
  });

  grunt.registerTask('buildlessons', function() {
    const buildStuff = require('@gfxfundamentals/lesson-builder');
    const finish = this.async();
    buildStuff(buildSettings).finally(finish);
  });

  grunt.task.registerMultiTask('fixthreepaths', 'fix three paths', function() {
    const options = this.options({});
    const oldVersionRE = new RegExp(`/${options.oldVersionStr}/`, 'g');
    const newVersionReplacement = `/${options.newVersionStr}/`;
    this.files.forEach((files) => {
      files.src.forEach((filename) => {
        const oldContent = fs.readFileSync(filename, {encoding: 'utf8'});
        const newContent = oldContent.replace(oldVersionRE, newVersionReplacement);
        if (oldContent !== newContent) {
          grunt.log.writeln(`updating ${filename} to ${options.newVersionStr}`);
          fs.writeFileSync(filename, newContent);
        }
      });
    });
  });

  grunt.registerTask('bumpthree', function() {
    const lessonInfo = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf8'}));
    const oldVersion = lessonInfo.threejsfundamentals.threeVersion;
    const oldVersionStr = `r${oldVersion}`;
    const threePath = '../three.js'; //path.dirname(path.dirname(require.resolve('three')));
    const threeInfo = JSON.parse(fs.readFileSync(path.join(threePath, 'package.json'), {encoding: 'utf8'}));
    const newVersion = semver.minor(threeInfo.version);
    const newVersionStr = `r${newVersion}`;
    const basePath = path.join('threejs', 'resources', 'threejs', newVersionStr);
    grunt.config.merge({
      copy: {
        threejs: {
          files: [
            { expand: true, cwd: `${threePath}/build/`, src: 'three.js', dest: `${basePath}/build/`, },
            { expand: true, cwd: `${threePath}/build/`, src: 'three.min.js', dest: `${basePath}/build/`, },
            { expand: true, cwd: `${threePath}/build/`, src: 'three.module.js', dest: `${basePath}/build/`, },
            { expand: true, cwd: `${threePath}/examples/js/`, src: '**', dest: `${basePath}/examples/js/`, },
            { expand: true, cwd: `${threePath}/examples/jsm/`, src: '**', dest: `${basePath}/examples/jsm/`, },
          ],
        },
      },
      fixthreepaths: {
        options: {
          oldVersionStr,
          newVersionStr,
        },
        src: [
          'threejs/**/*.html',
          'threejs/**/*.md',
          'threejs/**/*.js',
          '!threejs/resources/threejs/**',
        ],
      },
    });

    lessonInfo.threejsfundamentals.threeVersion = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(lessonInfo, null, 2));
    grunt.task.run(['copy:threejs', 'fixthreepaths']);
  });

  grunt.registerTask('build', ['clean', 'copy:main', 'buildlessons']);
  grunt.registerTask('buildwatch', ['build', 'watch']);

  grunt.registerTask('default', ['eslint', 'build']);
};

