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
				totalInstances: 0, // Add instance counter per batch group
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
				geometry: node.geometry,
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
 * Modifies the original scene to use batched meshes while preserving structure
 * @param {THREE.Group} scene - The scene to modify
 * @param {boolean} debug - Log statistics to console
 * @returns {Map<string, THREE.BatchedMesh>} Map of created batched meshes
 */
export function optimizeSceneToBatchedMesh( scene, debug = false ) {

	const { batchGroups } = analyzeGLTFModel( scene );
	const stats = {
		totalObjects: 0,
		batchedMeshes: 0,
		meshes: 0,
		totalInstances: 0,
		uniqueGeometries: 0,
		uniqueMaterialVariants: new Set(),
	};

	// Create batched meshes
	const batchedMeshesMap = new Map();
	for ( const [ batchKey, group ] of batchGroups ) {

		const batchedMesh = createPreciseBatchedMesh( group.materialProps, group );
		batchedMeshesMap.set( batchKey, {
			mesh: batchedMesh,
			geometryIds: new Map(),
			instanceCount: 0,
			originalMeshes: new Map(), // Track original meshes and their instance IDs
		} );

		stats.batchedMeshes ++;

	}

	// Process the scene and replace meshes with instances
	scene.updateMatrixWorld( true ); // Ensure world matrices are up to date

	scene.traverse( ( node ) => {

		if ( ! node.isMesh ) return;

		const materialProps = getMaterialPropertiesHash( node.material );
		const attributesSignature = getAttributesSignature( node.geometry );
		const batchKey = getBatchKey( materialProps, attributesSignature );

		// Check if this mesh should be batched
		const batchData = batchedMeshesMap.get( batchKey );
		if ( batchData ) {

			const geometryHash = getGeometryHash( node.geometry );

			// Add geometry to batch if not already added
			if ( ! batchData.geometryIds.has( geometryHash ) ) {

				batchData.geometryIds.set(
					geometryHash,
					batchData.mesh.addGeometry( node.geometry )
				);
				stats.uniqueGeometries ++;

			}

			const geometryId = batchData.geometryIds.get( geometryHash );
			const instanceId = batchData.mesh.addInstance( geometryId );

			if ( instanceId === - 1 ) {

				console.warn( 'Failed to add instance - capacity exceeded' );
				return;

			}

			// Store the original mesh's world matrix and color
			batchData.mesh.setMatrixAt( instanceId, node.matrixWorld );
			batchData.mesh.setColorAt( instanceId, node.material.color );

			// Track this mesh and its instance
			batchData.originalMeshes.set( node, {
				instanceId,
				originalMatrix: node.matrix.clone(),
				originalParent: node.parent,
			} );

			stats.totalInstances ++;
			stats.uniqueMaterialVariants.add( materialProps );
			batchData.instanceCount ++;

			// Keep the original mesh's properties but make it invisible
			node.visible = false;
			node.userData.batchData = {
				batchKey,
				instanceId,
				originalMatrix: node.matrix.clone(),
			};

		} else {

			// This is a single instance mesh, leave it as is
			stats.meshes ++;
			stats.totalInstances ++;

		}

	} );

	// Add all batched meshes to the scene root
	for ( const [ , batchData ] of batchedMeshesMap ) {

		scene.add( batchData.mesh );

	}

	if ( debug === true ) {

		_debugBatchedMeshStats( scene, stats );

	}

	return scene;

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
