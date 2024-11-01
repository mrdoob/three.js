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
	const uniqueGeometries = new Set();

	scene.updateMatrixWorld( true );
	scene.traverse( ( node ) => {

		if ( ! node.isMesh ) return;

		const materialProps = getMaterialPropertiesHash( node.material );
		const attributesSignature = getAttributesSignature( node.geometry );
		const batchKey = getBatchKey( materialProps, attributesSignature );
		const geometryHash = getGeometryHash( node.geometry );
		uniqueGeometries.add( geometryHash );

		if ( ! batchGroups.has( batchKey ) ) {

			batchGroups.set( batchKey, {
				meshes: [],
				geometryStats: new Map(),
				totalInstances: 0,
				materialProps: node.material.clone(),
			} );

		}

		const group = batchGroups.get( batchKey );
		group.meshes.push( node );
		group.totalInstances ++;

		// Track geometry statistics
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

	return { batchGroups, singleGroups, uniqueGeometries: uniqueGeometries.size };

}

/**
 * Creates BatchedMeshes and places them in the correct parent
 */
function createBatchedMeshes( batchGroups ) {

	const meshesToRemove = new Set();

	for ( const [ , group ] of batchGroups ) {

		const maxGeometries = group.totalInstances;
		const maxVertices = Array.from( group.geometryStats.values() ).reduce(
			( sum, stats ) => sum + stats.vertices,
			0
		);
		const maxIndices = Array.from( group.geometryStats.values() ).reduce(
			( sum, stats ) => sum + stats.indices,
			0
		);

		const batchedMaterial = new THREE.MeshPhysicalMaterial( group.materialProps );
		const batchedMesh = new THREE.BatchedMesh(
			maxGeometries,
			maxVertices,
			maxIndices,
			batchedMaterial
		);

		// Get the first mesh in the group to determine parent
		const referenceMesh = group.meshes[ 0 ];
		batchedMesh.name = `${referenceMesh.name}_batch`;

		const geometryIds = new Map();
		const inverseParentMatrix = new THREE.Matrix4();

		// Get parent's inverse matrix for local transforms
		if ( referenceMesh.parent ) {

			referenceMesh.parent.updateWorldMatrix( true, false );
			inverseParentMatrix.copy( referenceMesh.parent.matrixWorld ).invert();

		}

		// Add all meshes to the batch
		for ( const mesh of group.meshes ) {

			const geometryHash = getGeometryHash( mesh.geometry );

			if ( ! geometryIds.has( geometryHash ) ) {

				geometryIds.set( geometryHash, batchedMesh.addGeometry( mesh.geometry ) );

			}

			const geometryId = geometryIds.get( geometryHash );
			const instanceId = batchedMesh.addInstance( geometryId );

			// Calculate local matrix relative to the BatchedMesh's parent
			const localMatrix = new THREE.Matrix4();
			mesh.updateWorldMatrix( true, false );
			localMatrix.copy( mesh.matrixWorld );
			if ( referenceMesh.parent ) {

				localMatrix.premultiply( inverseParentMatrix );

			}

			batchedMesh.setMatrixAt( instanceId, localMatrix );
			batchedMesh.setColorAt( instanceId, mesh.material.color );

			meshesToRemove.add( mesh );

		}

		// Add BatchedMesh to the same parent as the reference mesh
		if ( referenceMesh.parent ) {

			referenceMesh.parent.add( batchedMesh );

		}

	}

	return meshesToRemove;

}

export function optimizeSceneToBatchedMesh( scene, debug = false ) {

	const { batchGroups, singleGroups, uniqueGeometries } = analyzeGLTFModel( scene );
	const meshesToRemove = createBatchedMeshes( batchGroups );

	// Remove original meshes that were batched
	meshesToRemove.forEach( ( mesh ) => {

		if ( mesh.parent ) {

			mesh.parent.remove( mesh );

		}

		if ( mesh.geometry ) mesh.geometry.dispose();
		if ( mesh.material ) {

			if ( Array.isArray( mesh.material ) ) {

				mesh.material.forEach( ( m ) => m.dispose() );

			} else {

				mesh.material.dispose();

			}

		}

	} );

	if ( debug ) {

		const totalOriginalMeshes = meshesToRemove.size + singleGroups.size;
		const totalFinalMeshes = batchGroups.size + singleGroups.size;

		const stats = {
			originalMeshes: totalOriginalMeshes,
			batchedMeshes: batchGroups.size,
			singleMeshes: singleGroups.size,
			drawCalls: totalFinalMeshes,
			uniqueGeometries: uniqueGeometries,
			reductionRatio: ( ( 1 - totalFinalMeshes / totalOriginalMeshes ) * 100 ).toFixed( 1 )
		};

		console.group( 'Scene Optimization Results' );
		console.log( `Original meshes: ${stats.originalMeshes}` );
		console.log( `Batched into: ${stats.batchedMeshes} BatchedMesh` );
		console.log( `Single meshes: ${stats.singleMeshes} Mesh` );
		console.log( `Total draw calls: ${stats.drawCalls}` );
		console.log( `Reduction Ratio: ${stats.reductionRatio}% fewer draw calls` );
		console.groupEnd();

	}


	return scene;

}
