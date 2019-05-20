/**
 * @author mrdoob / http://mrdoob.com/
 */

var fs = require( 'fs' );
THREE = require( '../build/three.js' );

var srcFolder = __dirname + '/../examples/js/';
var dstFolder = __dirname + '/../examples/jsm/';

var files = [
	{ path: 'controls/DragControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/DeviceOrientationControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/EditorControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/FirstPersonControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/FlyControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/OrbitControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/MapControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/OrthographicTrackballControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/PointerLockControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/TrackballControls.js', dependencies: [], ignoreList: [] },
	{ path: 'controls/TransformControls.js', dependencies: [], ignoreList: [] },

	{ path: 'curves/NURBSCurve.js', dependencies: [ { name: 'NURBSUtils', path: 'curves/NURBSUtils.js' } ], ignoreList: [] },
	{ path: 'curves/NURBSSurface.js', dependencies: [ { name: 'NURBSUtils', path: 'curves/NURBSUtils.js' } ], ignoreList: [] },
	{ path: 'curves/NURBSUtils.js', dependencies: [], ignoreList: [] },

	{ path: 'exporters/GLTFExporter.js', dependencies: [], ignoreList: [ 'AnimationClip', 'Camera', 'Geometry', 'Material', 'Mesh', 'Object3D', 'RGBFormat', 'Scenes', 'ShaderMaterial', 'VertexColors' ] },
	{ path: 'exporters/MMDExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/OBJExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/PLYExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/STLExporter.js', dependencies: [], ignoreList: [] },
	{ path: 'exporters/TypedGeometryExporter.js', dependencies: [], ignoreList: [] },

	{ path: 'loaders/BVHLoader.js', dependencies: [], ignoreList: [ 'Bones' ] },
	{ path: 'loaders/ColladaLoader.js', dependencies: [ { name: 'TGALoader', path: 'loaders/TGALoader.js' } ], ignoreList: [] },
	{ path: 'loaders/DDSLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/EXRLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/FBXLoader.js', dependencies: [ { name: 'TGALoader', path: 'loaders/TGALoader.js' }, { name: 'NURBSCurve', path: 'curves/NURBSCurve.js' } ], ignoreList: [] },
	{ path: 'loaders/GLTFLoader.js', dependencies: [], ignoreList: [ 'NoSide', 'Matrix2', 'DDSLoader' ] },
	{ path: 'loaders/MTLLoader.js', dependencies: [], ignoreList: [ 'BackSide', 'DoubleSide', 'ClampToEdgeWrapping', 'MirroredRepeatWrapping' ] },
	{ path: 'loaders/OBJLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PCDLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PDBLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/PLYLoader.js', dependencies: [], ignoreList: [ 'Mesh' ] },
	{ path: 'loaders/STLLoader.js', dependencies: [], ignoreList: [ 'Mesh', 'MeshPhongMaterial', 'VertexColors' ] },
	{ path: 'loaders/SVGLoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/TGALoader.js', dependencies: [], ignoreList: [] },
	{ path: 'loaders/VRMLLoader.js', dependencies: [], ignoreList: [] },

	{ path: 'pmrem/PMREMCubeUVPacker.js', dependencies: [], ignoreList: [] },
	{ path: 'pmrem/PMREMGenerator.js', dependencies: [], ignoreList: [] },

	{ path: 'shaders/UnpackDepthRGBAShader.js', dependencies: [], ignoreList: [] },

	{ path: 'renderers/CSS2DRenderer.js', dependencies: [], ignoreList: [] },
	{ path: 'renderers/CSS3DRenderer.js', dependencies: [], ignoreList: [] },
	{ path: 'renderers/Projector.js', dependencies: [], ignoreList: [] },
	{ path: 'renderers/SoftwareRenderer.js', dependencies: [ { name: 'Projector', path: 'renderers/Projector.js' }, { name: 'RenderableFace', path: 'renderers/Projector.js' }, { name: 'RenderableLine', path: 'renderers/Projector.js' }, { name: 'RenderableSprite', path: 'renderers/Projector.js' } ], ignoreList: [] },
	{ path: 'renderers/SVGRenderer.js', dependencies: [ { name: 'Projector', path: 'renderers/Projector.js' }, { name: 'RenderableFace', path: 'renderers/Projector.js' }, { name: 'RenderableLine', path: 'renderers/Projector.js' }, { name: 'RenderableSprite', path: 'renderers/Projector.js' } ], ignoreList: [] },

	{ path: 'utils/BufferGeometryUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/GeometryUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/MathUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/SceneUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/ShadowMapViewer.js', dependencies: [ { name: 'UnpackDepthRGBAShader', path: 'shaders/UnpackDepthRGBAShader.js' } ], ignoreList: [ 'DirectionalLight', 'SpotLight' ] },
	{ path: 'utils/SkeletonUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/TypedArrayUtils.js', dependencies: [], ignoreList: [] },
	{ path: 'utils/UVsDebug.js', dependencies: [], ignoreList: [ 'SphereBufferGeometry' ] },
];

for ( var i = 0; i < files.length; i ++ ) {

	var file = files[ i ];
	convert( file.path, file.dependencies, file.ignoreList );

}

//

function convert( path, exampleDependencies, ignoreList ) {

	var contents = fs.readFileSync( srcFolder + path, 'utf8' );

	var classNames = [];
	var coreDependencies = {};

	// imports

	contents = contents.replace( /^\/\*+[^*]*\*+(?:[^/*][^*]*\*+)*\//, function ( match ) {

		return `${match}\n\n_IMPORTS_`;

	} );

	// class name

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+) = /g, function ( match, p1 ) {

		classNames.push( p1 );

		console.log( p1 );

		return `var ${p1} = `;

	} );

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9]+)(\.{0,1})/g, function ( match, p1, p2, p3 ) {

		if ( p1 === '\'' ) return match; // Inside a string
		if ( classNames.includes( p2 ) ) return `${p2}${p3}`;

		if ( p1 === 'Math' ) {

			coreDependencies[ '_Math' ] = true;

			return '_Math.';

		}

		return match;

	} );

	// methods

	contents = contents.replace( /new THREE\.([a-zA-Z0-9]+)\(/g, function ( match, p1 ) {

		if ( ignoreList.includes( p1 ) ) return match;

		if ( p1 in THREE ) coreDependencies[ p1 ] = true;

		return `new ${p1}(`;

	} );

	// constants

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9_]+)/g, function ( match, p1, p2 ) {

		if ( ignoreList.includes( p2 ) ) return match;
		if ( p1 === '\'' ) return match; // Inside a string
		if ( classNames.includes( p2 ) ) return p2;

		if ( p2 === 'Math' || p2 === '_Math' ) {

			coreDependencies[ '_Math' ] = true;

			return '_Math';

		}

		if ( p2 in THREE ) coreDependencies[ p2 ] = true;

		// console.log( match, p2 );

		return `${p2}`;

	} );

	//

	var keys = Object.keys( coreDependencies )
		.filter( value => ! classNames.includes( value ) )
		.map( value => value === '_Math' ? 'Math as _Math' : value )
		.map( value => '\n\t' + value )
		.sort()
		.toString();

	// core imports

	var imports = `import {${keys}\n} from "../../../build/three.module.js";`;

	// example imports

	for ( var dependency of exampleDependencies ) {

		imports += `\nimport { ${dependency.name} } from "../${dependency.path}";`;

	}

	// exports

	var exports = `export { ${classNames.join( ", " )} };\n`;

	var output = contents.replace( '_IMPORTS_', keys ? imports : '' ) + '\n' + exports;

	// console.log( output );

	fs.writeFileSync( dstFolder + path, output, 'utf-8' );

}
