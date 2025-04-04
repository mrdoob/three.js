import * as THREE from 'three';

/**
 * This class can be used to optimized scenes by converting
 * individual meshes into {@link BatchedMesh}. This component
 * is an experimental attempt to implement auto-batching in three.js.
 */
class SceneOptimizer {

	/**
	 * Constructs a new scene optimizer.
	 *
	 * @param {Scene} scene - The scene to optimize.
	 * @param {SceneOptimizer~Options} options - The configuration options.
	 */
	constructor( scene, options = {} ) {

		this.scene = scene;
		this.debug = options.debug || false;

	}

	_bufferToHash( buffer ) {

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

	_getMaterialPropertiesHash( material ) {

		const mapProps = [
			'map',
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

		const mapHash = mapProps
			.map( ( prop ) => {

				const map = material[ prop ];
				if ( ! map ) return 0;
				return `${map.uuid}_${map.offset.x}_${map.offset.y}_${map.repeat.x}_${map.repeat.y}_${map.rotation}`;

			} )
			.join( '|' );

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

		const emissiveHash = material.emissive ? material.emissive.getHexString() : 0;
		const attenuationHash = material.attenuationColor
			? material.attenuationColor.getHexString()
			: 0;
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

	_getAttributesSignature( geometry ) {

		return Object.keys( geometry.attributes )
			.sort()
			.map( ( name ) => {

				const attribute = geometry.attributes[ name ];
				return `${name}_${attribute.itemSize}_${attribute.normalized}`;

			} )
			.join( '|' );

	}

	_getGeometryHash( geometry ) {

		const indexHash = geometry.index
			? this._bufferToHash( geometry.index.array )
			: 'noIndex';
		const positionHash = this._bufferToHash( geometry.attributes.position.array );
		const attributesSignature = this._getAttributesSignature( geometry );
		return `${indexHash}_${positionHash}_${attributesSignature}`;

	}

	_getBatchKey( materialProps, attributesSignature ) {

		return `${materialProps}_${attributesSignature}`;

	}

	_analyzeModel() {

		const batchGroups = new Map();
		const singleGroups = new Map();
		const uniqueGeometries = new Set();

		this.scene.updateMatrixWorld( true );
		this.scene.traverse( ( node ) => {

			if ( ! node.isMesh ) return;

			const materialProps = this._getMaterialPropertiesHash( node.material );
			const attributesSignature = this._getAttributesSignature( node.geometry );
			const batchKey = this._getBatchKey( materialProps, attributesSignature );
			const geometryHash = this._getGeometryHash( node.geometry );
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

	_createBatchedMeshes( batchGroups ) {

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

			const batchedMaterial = new group.materialProps.constructor( group.materialProps );

			if ( batchedMaterial.color !== undefined ) {

				// Reset color to white, color will be set per instance
				batchedMaterial.color.set( 1, 1, 1 );

			}

			const batchedMesh = new THREE.BatchedMesh(
				maxGeometries,
				maxVertices,
				maxIndices,
				batchedMaterial
			);

			const referenceMesh = group.meshes[ 0 ];
			batchedMesh.name = `${referenceMesh.name}_batch`;

			const geometryIds = new Map();
			const inverseParentMatrix = new THREE.Matrix4();

			if ( referenceMesh.parent ) {

				referenceMesh.parent.updateWorldMatrix( true, false );
				inverseParentMatrix.copy( referenceMesh.parent.matrixWorld ).invert();

			}

			for ( const mesh of group.meshes ) {

				const geometryHash = this._getGeometryHash( mesh.geometry );

				if ( ! geometryIds.has( geometryHash ) ) {

					geometryIds.set( geometryHash, batchedMesh.addGeometry( mesh.geometry ) );

				}

				const geometryId = geometryIds.get( geometryHash );
				const instanceId = batchedMesh.addInstance( geometryId );

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

			if ( referenceMesh.parent ) {

				referenceMesh.parent.add( batchedMesh );

			}

		}

		return meshesToRemove;

	}

	/**
	 * Removes empty nodes from all descendants of the given 3D object.
	 *
	 * @param {Object3D} object - The 3D object to process.
	 */
	removeEmptyNodes( object ) {

		const children = [ ...object.children ];

		for ( const child of children ) {

			this.removeEmptyNodes( child );

			if ( ( child instanceof THREE.Group || child.constructor === THREE.Object3D )
                && child.children.length === 0 ) {

				object.remove( child );

			}

		}

	}

	/**
	 * Removes the given array of meshes from the scene.
	 *
	 * @param {Set<Mesh>} meshesToRemove - The meshes to remove.
	 */
	disposeMeshes( meshesToRemove ) {

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

	}

	_logDebugInfo( stats ) {

		console.group( 'Scene Optimization Results' );
		console.log( `Original meshes: ${stats.originalMeshes}` );
		console.log( `Batched into: ${stats.batchedMeshes} BatchedMesh` );
		console.log( `Single meshes: ${stats.singleMeshes} Mesh` );
		console.log( `Total draw calls: ${stats.drawCalls}` );
		console.log( `Reduction Ratio: ${stats.reductionRatio}% fewer draw calls` );
		console.groupEnd();

	}

	/**
	 * Performs the auto-baching by identifying groups of meshes in the scene
	 * that can be represented as a single {@link BatchedMesh}. The method modifies
	 * the scene by adding instances of `BatchedMesh` and removing the now redundant
	 * individual meshes.
	 *
	 * @return {Scene} The optimized scene.
	 */
	toBatchedMesh() {

		const { batchGroups, singleGroups, uniqueGeometries } = this._analyzeModel();
		const meshesToRemove = this._createBatchedMeshes( batchGroups );

		this.disposeMeshes( meshesToRemove );
		this.removeEmptyNodes( this.scene );

		if ( this.debug ) {

			const totalOriginalMeshes = meshesToRemove.size + singleGroups.size;
			const totalFinalMeshes = batchGroups.size + singleGroups.size;

			const stats = {
				originalMeshes: totalOriginalMeshes,
				batchedMeshes: batchGroups.size,
				singleMeshes: singleGroups.size,
				drawCalls: totalFinalMeshes,
				uniqueGeometries: uniqueGeometries,
				reductionRatio: ( ( 1 - totalFinalMeshes / totalOriginalMeshes ) * 100 ).toFixed( 1 ),
			};

			this._logDebugInfo( stats );

		}

		return this.scene;

	}

	/**
	 * Performs the auto-instancing by identifying groups of meshes in the scene
	 * that can be represented as a single {@link InstancedMesh}. The method modifies
	 * the scene by adding instances of `InstancedMesh` and removing the now redundant
	 * individual meshes.
	 *
	 * This method is not yet implemented.
	 *
	 * @abstract
	 * @return {Scene} The optimized scene.
	 */
	toInstancingMesh() {

		throw new Error( 'InstancedMesh optimization not implemented yet' );

	}

}

/**
 * Constructor options of `SceneOptimizer`.
 *
 * @typedef {Object} SceneOptimizer~Options
 * @property {boolean} [debug=false] - Whether to enable debug mode or not.
 **/

export { SceneOptimizer };
