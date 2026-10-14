import { Color, Group, LinearSRGBColorSpace, Matrix3, Matrix4, Mesh, Object3D, Vector2 } from 'three';

const instanceAttributes = { _LIGHTMAP_OFFSET: 2, _LIGHTMAP_SCALE: 2, _LIGHTMAP_ROTATION: 1 };

/**
 * Opt-in loader for the proposed KHR_lightmap extension (glTF 2.1).
 * Images store linear irradiance; texCoord defaults to 0. Node bindings replace
 * material bindings per primitive. Atlas instances expand to ordinary meshes
 * with baked UVs, supporting both renderers at the cost of GPU batching.
 *
 * @three_import import { GLTFLightMapLoaderExtension } from 'three/addons/loaders/GLTFLightMapLoaderExtension.js';
 */
class GLTFLightMapLoaderExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = 'KHR_lightmap';

	}

	loadMaterial( materialIndex ) {

		const binding = this.parser.json.materials[ materialIndex ].extensions?.[ this.name ];
		if ( binding === undefined ) return null;
		return this.parser.loadMaterial( materialIndex ).then( async material => {

			await this.assignBinding( material, binding );
			const occlusion = this.parser.json.materials[ materialIndex ].occlusionTexture;
			if ( material.isMeshBasicMaterial && occlusion ) {

				await this.parser.assignTexture( material, 'aoMap', occlusion );
				material.aoMapIntensity = occlusion.strength ?? 1;

			}

			return material;

		} );

	}

	afterRoot( result ) {

		for ( const scene of result.scenes ) {

			scene.traverse( mesh => {

				if ( ! mesh.isMesh ) return;
				if ( mesh.material.lightMap ) this.validateUV( mesh );
				for ( const name in instanceAttributes ) {

					const attribute = mesh.geometry.getAttribute( name );
					if ( attribute && ! attribute.isInstancedBufferAttribute ) throw new Error( 'KHR_lightmap: Atlas attributes cannot be vertex attributes.' );

				}

			} );

		}

	}

	async assignBinding( material, binding ) {

		await this.parser.assignTexture( material, 'lightMap', binding.lightmapTexture );
		material.lightMap = material.lightMap.clone();
		material.lightMap.colorSpace = LinearSRGBColorSpace;
		const transform = binding.lightmapTexture.extensions?.KHR_texture_transform;
		if ( transform ) {

			const offset = transform.offset || [ 0, 0 ];
			const scale = transform.scale || [ 1, 1 ];
			material.lightMap.rotation = - ( transform.rotation || 0 );
			material.lightMap.matrixAutoUpdate = false;
			material.lightMap.matrix.copy( this.atlasMatrix( offset[ 0 ], offset[ 1 ], scale[ 0 ], scale[ 1 ], transform.rotation || 0 ) );

		}

		material.lightMapIntensity = binding.intensity ?? 1;

	}

	loadNode( nodeIndex ) {

		const parser = this.parser;
		const nodeDef = parser.json.nodes[ nodeIndex ];
		const bindings = nodeDef.extensions?.[ this.name ]?.lightmaps;
		const attributes = nodeDef.extensions?.EXT_mesh_gpu_instancing?.attributes;
		const hasAtlas = attributes && Object.keys( instanceAttributes ).some( name => attributes[ name ] !== undefined );
		if ( ! bindings && ! hasAtlas ) return null;
		if ( nodeDef.mesh === undefined ) throw new Error( 'KHR_lightmap: Node bindings require a mesh.' );
		return parser.loadNode( nodeIndex ).then( async node => {

			const primitives = node.isMesh ? [ node ] : node.children.filter( child => child.isMesh && parser.associations.get( child )?.nodes === undefined );
			const used = new Set();
			for ( const binding of bindings || [] ) {

				const mesh = primitives[ binding.primitive ];
				if ( ! mesh || used.has( binding.primitive ) ) throw new Error( 'KHR_lightmap: Invalid or repeated primitive binding.' );
				used.add( binding.primitive );
				mesh.material = mesh.material.clone();
				await this.assignBinding( mesh.material, binding );
				this.validateUV( mesh );

			}

			if ( hasAtlas ) {

				const atlas = {};
				const counts = new Set();
				for ( const name in attributes ) {

					const accessor = await parser.getDependency( 'accessor', attributes[ name ] );
					counts.add( accessor.count );
					if ( instanceAttributes[ name ] === undefined ) continue;
					const def = parser.json.accessors[ attributes[ name ] ];
					if ( def.componentType !== 5126 || accessor.normalized || accessor.itemSize !== instanceAttributes[ name ] ) throw new Error( 'KHR_lightmap: Invalid instance accessor type.' );
					for ( let i = 0; i < accessor.count; i ++ ) {

						for ( let c = 0; c < accessor.itemSize; c ++ ) {

							if ( ! Number.isFinite( accessor.getComponent( i, c ) ) ) throw new Error( 'KHR_lightmap: Nonfinite instance transform.' );

						}

					}

					atlas[ name ] = accessor;

				}

				if ( counts.size !== 1 || ! primitives.some( mesh => mesh.material.lightMap ) ) throw new Error( 'KHR_lightmap: Invalid instance binding or count.' );
				for ( const mesh of primitives ) {

					if ( ! mesh.material.lightMap ) continue;
					const replacement = this.expandInstances( mesh, atlas );
					if ( mesh === node ) {

						parser.associations.set( replacement, parser.associations.get( node ) );
						node = replacement;

					} else {

						node.remove( mesh );
						node.add( replacement );

					}

				}

			}

			return node;

		} );

	}

	validateUV( mesh ) {

		const channel = mesh.material.lightMap.channel;
		const uv = mesh.geometry.getAttribute( channel === 0 ? 'uv' : `uv${ channel }` );
		if ( ! uv ) throw new Error( 'KHR_lightmap: Missing lightmap UV attribute.' );
		return uv;

	}

	atlasMatrix( x, y, sx, sy, rotation ) {

		const c = Math.cos( rotation ), s = Math.sin( rotation );
		return new Matrix3().set( c * sx, - s * sy, x, s * sx, c * sy, y, 0, 0, 1 );

	}

	expandInstances( mesh, atlas ) {

		if ( ! mesh.isInstancedMesh ) throw new Error( 'KHR_lightmap: Atlas attributes require GPU instances.' );
		const sourceUV = this.validateUV( mesh );
		const map = mesh.material.lightMap;
		if ( map.matrixAutoUpdate ) map.updateMatrix();
		const occupied = new Set();
		for ( const value of Object.values( mesh.material ) ) {

			if ( value?.isTexture && value !== map ) occupied.add( value.channel );

		}

		let channel = 0;
		while ( occupied.has( channel ) ) channel ++;
		if ( channel > 3 ) throw new Error( 'KHR_lightmap: No available UV channel for instance atlas.' );
		const group = new Group();
		Object3D.prototype.copy.call( group, mesh, false );
		for ( const child of [ ...mesh.children ] ) group.add( child );
		const matrix = new Matrix4();
		const uv = new Vector2();
		const color = new Color();
		for ( let i = 0; i < mesh.count; i ++ ) {

			const geometry = mesh.geometry.clone();
			for ( const name in geometry.attributes ) {

				if ( geometry.attributes[ name ].isInstancedBufferAttribute ) geometry.deleteAttribute( name );

			}

			const material = mesh.material.clone();
			material.lightMap = map.clone();
			material.lightMap.channel = channel;
			material.lightMap.offset.set( 0, 0 );
			material.lightMap.repeat.set( 1, 1 );
			material.lightMap.rotation = 0;
			material.lightMap.matrix.identity();
			material.lightMap.matrixAutoUpdate = true;
			const offset = atlas._LIGHTMAP_OFFSET;
			const scale = atlas._LIGHTMAP_SCALE;
			const transform = this.atlasMatrix( offset ? offset.getX( i ) : 0, offset ? offset.getY( i ) : 0, scale ? scale.getX( i ) : 1, scale ? scale.getY( i ) : 1, atlas._LIGHTMAP_ROTATION ? atlas._LIGHTMAP_ROTATION.getX( i ) : 0 );
			transform.multiply( map.matrix );
			const bakedUV = sourceUV.clone();
			for ( let j = 0; j < sourceUV.count; j ++ ) {

				uv.fromBufferAttribute( sourceUV, j ).applyMatrix3( transform );
				bakedUV.setXY( j, uv.x, uv.y );

			}

			geometry.setAttribute( channel === 0 ? 'uv' : `uv${ channel }`, bakedUV );
			if ( mesh.instanceColor ) material.color.multiply( color.fromBufferAttribute( mesh.instanceColor, i ) );
			const instance = new Mesh( geometry, material );
			instance.castShadow = mesh.castShadow;
			instance.receiveShadow = mesh.receiveShadow;
			mesh.getMatrixAt( i, matrix );
			matrix.decompose( instance.position, instance.quaternion, instance.scale );
			group.add( instance );

		}

		return group;

	}

}

export { GLTFLightMapLoaderExtension };
