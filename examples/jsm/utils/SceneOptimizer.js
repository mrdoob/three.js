import * as THREE from 'three';

class SceneOptimizer {

	constructor( scene, options = {} ) {

		this.scene = scene;
		this.debug = options.debug || false;

	}

	bufferToHash( buffer ) {

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

	getMaterialPropertiesHash( material ) {

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

	getAttributesSignature( geometry ) {

		return Object.keys( geometry.attributes )
			.sort()
			.map( ( name ) => {

				const attribute = geometry.attributes[ name ];
				return `${name}_${attribute.itemSize}_${attribute.normalized}`;

			} )
			.join( '|' );

	}

	getGeometryHash( geometry ) {

		const indexHash = geometry.index
			? this.bufferToHash( geometry.index.array )
			: 'noIndex';
		const positionHash = this.bufferToHash( geometry.attributes.position.array );
		const attributesSignature = this.getAttributesSignature( geometry );
		return `${indexHash}_${positionHash}_${attributesSignature}`;

	}

	getBatchKey( materialProps, attributesSignature ) {

		return `${materialProps}_${attributesSignature}`;

	}

	analyzeModel() {

		const batchGroups = new Map();
		const singleGroups = new Map();
		const uniqueGeometries = new Set();

		this.scene.updateMatrixWorld( true );
		this.scene.traverse( ( node ) => {

			if ( ! node.isMesh ) return;

			const materialProps = this.getMaterialPropertiesHash( node.material );
			const attributesSignature = this.getAttributesSignature( node.geometry );
			const batchKey = this.getBatchKey( materialProps, attributesSignature );
			const geometryHash = this.getGeometryHash( node.geometry );
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

	createBatchedMeshes( batchGroups ) {

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

				const geometryHash = this.getGeometryHash( mesh.geometry );

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

	logDebugInfo( stats ) {

		console.group( 'Scene Optimization Results' );
		console.log( `Original meshes: ${stats.originalMeshes}` );
		console.log( `Batched into: ${stats.batchedMeshes} BatchedMesh` );
		console.log( `Single meshes: ${stats.singleMeshes} Mesh` );
		console.log( `Total draw calls: ${stats.drawCalls}` );
		console.log( `Reduction Ratio: ${stats.reductionRatio}% fewer draw calls` );
		console.groupEnd();

	}

	toBatchedMesh() {

		const { batchGroups, singleGroups, uniqueGeometries } = this.analyzeModel();
		const meshesToRemove = this.createBatchedMeshes( batchGroups );

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

			this.logDebugInfo( stats );

		}

		return this.scene;

	}

	// Placeholder for future implementation
	toInstancingMesh() {

		throw new Error( 'InstancedMesh optimization not implemented yet' );

	}

}

export { SceneOptimizer };
