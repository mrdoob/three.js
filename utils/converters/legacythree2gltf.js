#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const Canvas = require( 'canvas' );
const { Blob, FileReader } = require( 'vblob' );
THREE = require( '../../build/three.js' );
require( '../../examples/js/loaders/deprecated/LegacyJSONLoader.js' );
require( '../../examples/js/exporters/GLTFExporter.js' );
require( '../../examples/js/utils/BufferGeometryUtils.js' );

if ( process.argv.length <= 2 ) {

	console.log( `Usage: ${path.basename( __filename )} model.json [ --optimize ]` );
	process.exit( - 1 );

}

var file = process.argv[ 2 ];
var optimize = process.argv.indexOf( '--optimize' ) > 0;
var resourceDirectory = THREE.LoaderUtils.extractUrlBase( file );

//

// Patch global scope to imitate browser environment.
global.window = global;
global.Blob = Blob;
global.FileReader = FileReader;
global.THREE = THREE;
global.document = {
	createElement: ( nodeName ) => {

		if ( nodeName !== 'canvas' ) throw new Error( `Cannot create node ${nodeName}` );

		const canvas = new Canvas( 256, 256 );
		// This isn't working — currently need to avoid toBlob(), so export to embedded .gltf not .glb.
		// canvas.toBlob = function () {
		//   return new Blob([this.toBuffer()]);
		// };
		return canvas;

	}
};

//

// Load legacy JSON file and construct a mesh.

var jsonContent = fs.readFileSync( file, 'utf8' );
var loader = new THREE.LegacyJSONLoader();
var { geometry, materials } = loader.parse( JSON.parse( jsonContent ), resourceDirectory );

var mesh;
var boneDefs = geometry.bones || [];
var animations = geometry.animations || [];
var hasVertexColors = geometry.colors.length > 0;

geometry = new THREE.BufferGeometry().fromGeometry( geometry );

// Remove unnecessary vertex colors and groups added during BufferGeometry conversion.
if ( ! hasVertexColors ) geometry.removeAttribute( 'color' );
if ( geometry.groups.length === 1 ) geometry.clearGroups();

if ( ! materials ) {

	materials = new THREE.MeshStandardMaterial( { color: 0x888888, roughness: 1, metalness: 0 } );

}

if ( optimize ) {

	geometry = THREE.BufferGeometryUtils.mergeVertices( geometry );

}

if ( boneDefs.length ) {

	var { roots, bones } = initBones( boneDefs );
	mesh = new THREE.SkinnedMesh( geometry, materials );
	roots.forEach( ( bone ) => mesh.add( bone ) );
	mesh.updateMatrixWorld( true );
	mesh.bind( new THREE.Skeleton( bones ), mesh.matrixWorld );
	mesh.normalizeSkinWeights();

} else {

	mesh = new THREE.Mesh( geometry, materials );

}

//

// Export to glTF.
var exporter = new THREE.GLTFExporter();
exporter.parse( mesh, ( json ) => {

	var content = JSON.stringify( json );
	fs.writeFileSync( path.basename( file, '.json' ) + '.gltf', content, 'utf8' );

}, { binary: false, animations } );

//

/** Previously SkinnedMesh.initBones(). */
function initBones( boneDefs ) {

	var bones = [], bone, gbone;
	var i, il;

	// first, create array of 'Bone' objects from geometry data

	for ( i = 0, il = boneDefs.length; i < il; i ++ ) {

		gbone = boneDefs[ i ];

		// create new 'Bone' object

		bone = new THREE.Bone();
		bones.push( bone );

		// apply values

		bone.name = gbone.name;
		bone.position.fromArray( gbone.pos );
		bone.quaternion.fromArray( gbone.rotq );
		if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );

	}

	// second, create bone hierarchy
	var roots = [];

	for ( i = 0, il = boneDefs.length; i < il; i ++ ) {

		gbone = boneDefs[ i ];

		if ( ( gbone.parent !== - 1 ) && ( gbone.parent !== null ) && ( bones[ gbone.parent ] !== undefined ) ) {

			// subsequent bones in the hierarchy

			bones[ gbone.parent ].add( bones[ i ] );

		} else {

			// topmost bone, immediate child of the skinned mesh

			roots.push( bones[ i ] );

		}

	}

	return { roots, bones };

}
