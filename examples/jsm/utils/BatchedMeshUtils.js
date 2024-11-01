import * as THREE from 'three';

function bufferToHash( buffer ) {

	let hash = 0;
	if ( buffer.byteLength !== 0 ) {

		let uintArray;
		if ( buffer.buffer ) {

			uintArray = new Uint8Array(
				buffer.buffer,
				buffer.byteOffset,
				buffer.byteLength
			);

		} else {

			uintArray = new Uint8Array( buffer );

		}

		for ( let i = 0; i < buffer.byteLength; i ++ ) {

			const byte = uintArray[ i ];
			hash = ( hash << 5 ) - hash + byte;
			hash |= 0;

		}

	}

	return hash;

}

/**
 * Gets material properties hash excluding color (since color can vary within a batch)
 * @param {THREE.Material} material - The material to hash
 * @returns {string} Hash of non-color material properties
 */
function getMaterialPropertiesHash( material ) {

	const mapProps = [
		'alphaMap',
		'aoMap',
		'bumpMap',
		'displacementMap',
		'emissiveMap',
		'envMap',
		'lightMap',
		'metalnessMap',
		'normalMap',
		'roughnessMap',
	];

	// Build map hash
	const mapHash = mapProps
		.map( ( prop ) => {

			const map = material[ prop ];
			if ( ! map ) return 0;
			return `${map.uuid}_${map.offset.x}_${map.offset.y}_${map.repeat.x}_${map.repeat.y}_${map.rotation}`;

		} )
		.join( '|' );

	// Build physical properties hash
	const physicalProps = [
		'transparent',
		'opacity',
		'alphaTest',
		'alphaToCoverage',
		'side',
		'vertexColors',
		'visible',
		'blending',
		'wireframe',
		'flatShading',
		'premultipliedAlpha',
		'dithering',
		'toneMapped',
		'depthTest',
		'depthWrite',
		// Physical material specific
		'metalness',
		'roughness',
		'clearcoat',
		'clearcoatRoughness',
		'sheen',
		'sheenRoughness',
		'transmission',
		'thickness',
		'attenuationDistance',
		'ior',
		'iridescence',
		'iridescenceIOR',
		'iridescenceThicknessRange',
		'reflectivity',
	]
		.map( ( prop ) => {

			if ( typeof material[ prop ] === 'undefined' ) return 0;
			if ( material[ prop ] === null ) return 0;
			return material[ prop ].toString();

		} )
		.join( '|' );

	// Include emissive color (unlike base color, this can't vary per instance)
	const emissiveHash = material.emissive ? material.emissive.getHexString() : 0;

	// Include attenuationColor
	const attenuationHash = material.attenuationColor
		? material.attenuationColor.getHexString()
		: 0;

	// Include sheenColor
	const sheenColorHash = material.sheenColor
		? material.sheenColor.getHexString()
		: 0;

	return [
		material.type,
		physicalProps,
		mapHash,
		emissiveHash,
		attenuationHash,
		sheenColorHash,
	].join( '_' );

}

/**
 * Helper to get attributes signature for a geometry
 */
function getAttributesSignature( geometry ) {

	return Object.keys( geometry.attributes )
		.sort()
		.map( ( name ) => {

			const attribute = geometry.attributes[ name ];
			return `${name}_${attribute.itemSize}_${attribute.normalized}`;

		} )
		.join( '|' );

}

/**
 * Helper to get geometry hash including attributes signature
 */
function getGeometryHash( geometry ) {

	const indexHash = geometry.index
		? bufferToHash( geometry.index.array )
		: 'noIndex';
	const positionHash = bufferToHash( geometry.attributes.position.array );
	const attributesSignature = getAttributesSignature( geometry );
	return `${indexHash}_${positionHash}_${attributesSignature}`;

}

/**
 * Creates a combined key for batch grouping based on non-color material properties and attributes
 */
function getBatchKey( materialProps, attributesSignature ) {

	return `${materialProps}_${attributesSignature}`;

}

/**
 * Analyzes a GLTF model to group meshes by material properties and attributes
 */
function analyzeGLTFModel( scene ) {

	const batchGroups = new Map();
	const singleGroups = new Map();

	scene.updateMatrixWorld( true );
	scene.traverse( ( node ) => {

		if ( ! node.isMesh ) return;

		const materialProps = getMaterialPropertiesHash( node.material );
		const attributesSignature = getAttributesSignature( node.geometry );
		const batchKey = getBatchKey( materialProps, attributesSignature );

		if ( ! batchGroups.has( batchKey ) ) {

			batchGroups.set( batchKey, {
				meshes: [],
				geometryStats: new Map(),
				totalInstances: 0
			} );

		}

		const group = batchGroups.get( batchKey );
		group.meshes.push( node );
		group.totalInstances ++; // Increment total instances for this batch

		// Track geometry statistics
		const geometryHash = getGeometryHash( node.geometry );
		if ( ! group.geometryStats.has( geometryHash ) ) {

			group.geometryStats.set( geometryHash, {
				count: 0,
				vertices: node.geometry.attributes.position.count,
				indices: node.geometry.index ? node.geometry.index.count : 0,
				geometry: node.geometry
			} );

		}

		group.geometryStats.get( geometryHash ).count ++;

	} );

	// Move single instance groups to singleGroups
	for ( const [ batchKey, group ] of batchGroups ) {

		if ( group.totalInstances === 1 ) {

			singleGroups.set( batchKey, group );
			batchGroups.delete( batchKey );

		}

	}

	return { batchGroups, singleGroups };

}

/**
 * Creates a BatchedMesh with exact buffer sizes
 */
function createPreciseBatchedMesh( materialProps, group ) {

	const maxGeometries = group.totalInstances;

	const maxVertices = Array.from( group.geometryStats.values() ).reduce(
		( sum, stats ) => sum + stats.vertices,
		0
	);

	const maxIndices = Array.from( group.geometryStats.values() ).reduce(
		( sum, stats ) => sum + stats.indices,
		0
	);

	// Create material with shared properties
	const batchedMaterial = new THREE.MeshPhysicalMaterial( materialProps );

	const batchedMesh = new THREE.BatchedMesh(
		maxGeometries,
		maxVertices,
		maxIndices,
		batchedMaterial
	);

	return batchedMesh;

}

/**
 * Converts a GLTF model into BatchedMeshes and individual meshes where appropriate
 * @param {THREE.Group} Scene - The group/scene
 * @param {boolean} debug - Log statistics to console
 * @returns {THREE.BatchedMesh|THREE.Mesh[]} Converted meshes
 */
export function optimizeSceneToBatchedMesh( scene, debug = false ) {

	const { batchGroups, singleGroups } = analyzeGLTFModel( scene );
	const batchedMeshes = [];
	const singleInstanceMeshes = [];

	const stats = {
		totalObjects: 0,
		batchedMeshes: 0,
		meshes: 0,
		totalInstances: 0,
		uniqueGeometries: 0,
		uniqueMaterialVariants: new Set(),
	};

	// Create batched meshes
	for ( const [ , group ] of batchGroups ) {

		const batchedMesh = createPreciseBatchedMesh( group.materialProps, group );

		const geometryIds = new Map();

		// Add all meshes to the batch
		for ( const mesh of group.meshes ) {

			const geometryHash = getGeometryHash( mesh.geometry );

			if ( ! geometryIds.has( geometryHash ) ) {

				geometryIds.set( geometryHash, batchedMesh.addGeometry( mesh.geometry ) );
				stats.uniqueGeometries ++;

			}

			const geometryId = geometryIds.get( geometryHash );
			const instanceId = batchedMesh.addInstance( geometryId );

			if ( instanceId === - 1 ) {

				console.warn( 'Failed to add instance - capacity exceeded' );
				continue;

			}

			batchedMesh.setMatrixAt( instanceId, mesh.matrixWorld );
			batchedMesh.setColorAt( instanceId, mesh.material.color );

			stats.totalInstances ++;
			stats.uniqueMaterialVariants.add(
				getMaterialPropertiesHash( mesh.material )
			);

		}

		batchedMeshes.push( batchedMesh );
		stats.batchedMeshes ++;

	}

	// Handle single instance meshes
	for ( const [ , /* batchKey */ group ] of singleGroups ) {

		const mesh = group.meshes[ 0 ];
		// Clone the mesh to preserve the original
		const singleMesh = mesh.clone();
		singleInstanceMeshes.push( singleMesh );
		stats.meshes ++;
		stats.totalInstances ++;

	}

	if ( debug === true ) {

		_debugBatchedMeshStats( scene, stats );

	}

	return new THREE.Group().add( ...batchedMeshes, ...singleInstanceMeshes );

}

/**
 * Logs batched mesh statistics
 * @param {Object} stats - Batched mesh statistics
 */
function _debugBatchedMeshStats( scene, stats ) {

	scene.traverse( () => stats.totalObjects ++ );

	// In your convertGLTFToBatchedMeshes function:
	console.group( 'Scene Optimization Results' );

	// Pre-optimization stats
	console.log( 'Original Scene:' );
	console.log( `  Total Objects: ${stats.totalObjects}` );
	console.log( `  Total Meshes: ${stats.totalInstances}` );
	console.log( `  Unique Geometries: ${stats.uniqueGeometries}` );
	console.log( `  Unique Materials: ${stats.uniqueMaterialVariants.size}` );

	// Optimization results
	console.log( '\nAfter Optimization:' );
	console.log( `  BatchedMeshes: ${stats.batchedMeshes}` );
	console.log( `  Single Meshes: ${stats.meshes}` );
	console.log( `  Total Draw Calls: ${stats.batchedMeshes + stats.meshes}` );

	// Detailed stats
	console.log( '\nDetailed Statistics:' );
	console.log(
		`  Reduction Ratio: ${(
			( 1 - ( stats.batchedMeshes + stats.meshes ) / stats.totalInstances ) *
      100
		).toFixed( 1 )}% fewer draw calls`
	);

	console.groupEnd();

}

// Example usage:
/*
const batchedMeshes = sceneToBatchedMeshes(gltf.scene);
batchedMeshes.forEach(mesh => scene.add(mesh));
*/
