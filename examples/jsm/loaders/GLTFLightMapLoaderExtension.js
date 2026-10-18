import { ClampToEdgeWrapping, Color, DataTexture, DataUtils, FileLoader, Group, HalfFloatType, LinearFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearSRGBColorSpace, LoaderUtils, Matrix3, Matrix4, Mesh, MirroredRepeatWrapping, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, NoColorSpace, Object3D, RepeatWrapping, RGBAFormat, SRGBColorSpace, Vector2 } from 'three';

const instanceAttributes = { _LIGHTMAP_OFFSET: 2, _LIGHTMAP_SCALE: 2, _LIGHTMAP_ROTATION: 1, _LIGHTMAP_INTENSITY: 1 };
const filters = { 9728: NearestFilter, 9729: LinearFilter, 9984: NearestMipmapNearestFilter, 9985: LinearMipmapNearestFilter, 9986: NearestMipmapLinearFilter, 9987: LinearMipmapLinearFilter };
const wrappings = { 33071: ClampToEdgeWrapping, 33648: MirroredRepeatWrapping, 10497: RepeatWrapping };

/**
 * Opt-in loader for the proposed KHR_lightmap extension (glTF 2.0).
 * Images store irradiance, linear or with the sRGB transfer function as given by the
 * binding `encoding`; texCoord defaults to 0. 16-bit PNGs are decoded with full precision
 * into half float textures, the browser decodes other images and the 8-bit fallback.
 * Node bindings replace material bindings per primitive. Atlas instances expand to
 * ordinary meshes with baked UVs, supporting both renderers at the cost of GPU batching.
 * With `keepInstances`, instanced meshes keep their instances and the atlas
 * attributes; with WebGPURenderer, `instancedLightMap()` of `DirectionalLightMapNode.js` makes their
 * materials look the light map up in the region of each instance.
 *
 * The optional `directionTexture` of a binding holds the dominant directions of a directional light
 * map, the luminance-weighted average direction to the incident light in the world space of the
 * scene, encoded like a normal map, `direction = rgb * 2 - 1`. It uses the UVs and the texture
 * transform of `lightmapTexture`, and the loader keeps it in `material.lightMapDirection`. With
 * `WebGPURenderer`, pass `directionalLightMap()` in the options, so that the materials shade their
 * light maps with it and normal maps show under baked light.
 *
 * ```js
 * loader.register( parser => new GLTFLightMapLoaderExtension( parser ) );
 *
 * // WebGPURenderer, with directional light maps
 * import { directionalLightMap } from 'three/addons/tsl/lighting/DirectionalLightMapNode.js';
 * loader.register( parser => new GLTFLightMapLoaderExtension( parser, { directionalLightMap } ) );
 * ```
 *
 * @three_import import { GLTFLightMapLoaderExtension } from 'three/addons/loaders/GLTFLightMapLoaderExtension.js';
 */
class GLTFLightMapLoaderExtension {

	/**
	 * Constructs a light map loader plugin.
	 *
	 * @param {GLTFParser} parser - The glTF parser.
	 * @param {Object} [options] - The loading options.
	 * @param {boolean} [options.highPrecision=true] - Whether 16-bit PNG light maps are decoded with full precision.
	 * Otherwise the browser decodes them with 8 bits.
	 * @param {?function(Material, Texture)} [options.directionalLightMap=null] - Applies the direction texture of a
	 * directional light map to a material, e.g. `directionalLightMap()` of `DirectionalLightMapNode.js`.
	 * @param {boolean} [options.keepInstances=false] - Whether atlas instances stay instanced, with the atlas
	 * attributes `_LIGHTMAP_OFFSET`, `_LIGHTMAP_SCALE`, `_LIGHTMAP_ROTATION` and `_LIGHTMAP_INTENSITY` on their
	 * geometries. Otherwise they expand to ordinary meshes.
	 */
	constructor( parser, { highPrecision = true, directionalLightMap = null, keepInstances = false } = {} ) {

		this.parser = parser;
		this.name = 'KHR_lightmap';
		this.highPrecision = highPrecision;
		this.directionalLightMap = directionalLightMap;
		this.keepInstances = keepInstances;
		this.textureCache = new Map();

	}

	loadMaterial( materialIndex ) {

		const binding = this.parser.json.materials[ materialIndex ].extensions?.[ this.name ];
		if ( binding === undefined ) return null;
		return this.parser.loadMaterial( materialIndex ).then( async material => {

			await this.assignBinding( material, binding, this.parser.json.materials[ materialIndex ] );

			return material;

		} );

	}

	async afterRoot( result ) {

		const materials = new Set();

		for ( const scene of result.scenes ) {

			scene.traverse( mesh => {

				if ( ! mesh.isMesh ) return;
				if ( mesh.material.lightMap ) this.validateUV( mesh );
				for ( const name in instanceAttributes ) {

					const attribute = mesh.geometry.getAttribute( name );
					if ( attribute && ! attribute.isInstancedBufferAttribute ) throw new Error( 'KHR_lightmap: Atlas attributes cannot be vertex attributes.' );

				}

				materials.add( mesh.material );

			} );

		}

		for ( const material of materials ) await this.resolveDirection( material );

	}

	async assignBinding( material, binding, materialDef ) {

		const intensity = binding.intensity ?? 1;
		const encoding = binding.encoding ?? 'linear';
		if ( ! Number.isFinite( intensity ) || intensity < 0 ) throw new Error( 'KHR_lightmap: Invalid binding intensity.' );
		if ( encoding !== 'linear' && encoding !== 'srgb' ) throw new Error( 'KHR_lightmap: Unsupported encoding.' );
		const texture = this.highPrecision ? await this.loadHighPrecisionTexture( binding.lightmapTexture.index, encoding ) : null;

		if ( texture !== null ) {

			material.lightMap = texture.clone();
			material.lightMap.channel = binding.lightmapTexture.texCoord ?? 0;

		} else {

			await this.parser.assignTexture( material, 'lightMap', binding.lightmapTexture );
			material.lightMap = material.lightMap.clone();
			material.lightMap.colorSpace = encoding === 'srgb' ? SRGBColorSpace : LinearSRGBColorSpace;

		}

		const transform = binding.lightmapTexture.extensions?.KHR_texture_transform;
		if ( transform ) {

			const offset = transform.offset || [ 0, 0 ];
			const scale = transform.scale || [ 1, 1 ];
			material.lightMap.rotation = - ( transform.rotation || 0 );
			material.lightMap.matrixAutoUpdate = false;
			material.lightMap.matrix.copy( this.atlasMatrix( offset[ 0 ], offset[ 1 ], scale[ 0 ], scale[ 1 ], transform.rotation || 0 ) );

		}

		material.lightMapIntensity = intensity;
		const occlusion = materialDef?.occlusionTexture;
		if ( material.isMeshBasicMaterial && occlusion ) {

			await this.parser.assignTexture( material, 'aoMap', occlusion );
			material.aoMapIntensity = occlusion.strength ?? 1;

		}

	}

	/**
	 * Assigns the direction texture of its material binding to a material. This happens after
	 * GLTFLoader has cloned the materials for their meshes, e.g. to flip the normal scale for
	 * derivative tangents, since clones would lose it.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {Promise<void>} Resolves after the direction texture has been assigned.
	 */
	async resolveDirection( material ) {

		if ( ! material.lightMap || material.lightMapDirection !== undefined ) return;

		const index = this.parser.associations.get( material )?.materials;
		const binding = index !== undefined ? this.parser.json.materials[ index ].extensions?.[ this.name ] : undefined;

		if ( binding?.directionTexture !== undefined ) this.assignDirection( material, await this.parser.getDependency( 'texture', binding.directionTexture.index ) );

	}

	/**
	 * Assigns the direction texture of a directional light map to a material, with the UVs and the
	 * transform of its light map.
	 *
	 * @private
	 * @param {Material} material - The material with a light map.
	 * @param {Texture} source - The direction texture.
	 */
	assignDirection( material, source ) {

		const map = material.lightMap;
		const direction = source.clone();

		direction.colorSpace = NoColorSpace;
		direction.channel = map.channel;
		direction.offset.copy( map.offset );
		direction.repeat.copy( map.repeat );
		direction.center.copy( map.center );
		direction.rotation = map.rotation;
		direction.matrixAutoUpdate = map.matrixAutoUpdate;
		direction.matrix.copy( map.matrix );

		material.lightMapDirection = direction;
		if ( this.directionalLightMap !== null ) this.directionalLightMap( material, direction );

	}

	/**
	 * Decodes a 16-bit PNG light map into a linear half float texture, once per texture.
	 *
	 * @private
	 * @param {number} textureIndex - The glTF texture.
	 * @param {string} encoding - The transfer function of the samples, 'linear' or 'srgb'.
	 * @return {Promise<?DataTexture>} The texture, or null for other images, which the browser decodes.
	 */
	loadHighPrecisionTexture( textureIndex, encoding ) {

		const key = textureIndex + ':' + encoding;

		if ( ! this.textureCache.has( key ) ) {

			this.textureCache.set( key, this.decodeTexture( textureIndex, encoding ).catch( error => {

				console.warn( 'KHR_lightmap: Decoding the 16-bit light map failed, falling back to 8 bits.', error );
				return null;

			} ) );

		}

		return this.textureCache.get( key );

	}

	async decodeTexture( textureIndex, encoding ) {

		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[ textureIndex ];
		if ( textureDef.source === undefined || typeof DecompressionStream === 'undefined' ) return null;
		const imageDef = json.images[ textureDef.source ];
		if ( imageDef.mimeType !== undefined && imageDef.mimeType !== 'image/png' ) return null;

		let buffer;

		if ( imageDef.bufferView !== undefined ) {

			buffer = await parser.getDependency( 'bufferView', imageDef.bufferView );

		} else {

			const loader = new FileLoader( parser.options.manager );
			loader.setResponseType( 'arraybuffer' );
			loader.setRequestHeader( parser.options.requestHeader );
			loader.setWithCredentials( parser.options.crossOrigin === 'use-credentials' );
			buffer = await loader.loadAsync( LoaderUtils.resolveURL( imageDef.uri, parser.options.path ) );

		}

		const image = await decodePNG16( buffer );
		if ( image === null ) return null;

		// half floats of all 16-bit samples

		const table = new Uint16Array( 65536 );

		for ( let i = 0; i < 65536; i ++ ) {

			const value = i / 65535;
			table[ i ] = DataUtils.toHalfFloat( encoding === 'srgb' ? ( value < 0.04045 ? value * 0.0773993808 : ( value * 0.9478672986 + 0.0521327014 ) ** 2.4 ) : value );

		}

		const { width, height, channels, samples } = image;
		const data = new Uint16Array( width * height * 4 );
		const one = DataUtils.toHalfFloat( 1 );

		for ( let i = 0; i < width * height; i ++ ) {

			for ( let c = 0; c < 3; c ++ ) data[ i * 4 + c ] = table[ samples[ i * channels + ( channels < 3 ? 0 : c ) ] ];
			data[ i * 4 + 3 ] = one;

		}

		const sampler = json.samplers?.[ textureDef.sampler ] || {};
		const texture = new DataTexture( data, width, height, RGBAFormat, HalfFloatType );
		texture.name = textureDef.name || imageDef.name || '';
		texture.colorSpace = LinearSRGBColorSpace;
		texture.magFilter = filters[ sampler.magFilter ] || LinearFilter;
		texture.minFilter = filters[ sampler.minFilter ] || LinearMipmapLinearFilter;
		texture.wrapS = wrappings[ sampler.wrapS ] || RepeatWrapping;
		texture.wrapT = wrappings[ sampler.wrapT ] || RepeatWrapping;
		texture.generateMipmaps = texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
		texture.needsUpdate = true;
		parser.associations.set( texture, { textures: textureIndex } );
		return texture;

	}

	loadNode( nodeIndex ) {

		const parser = this.parser;
		const nodeDef = parser.json.nodes[ nodeIndex ];
		const bindings = nodeDef.extensions?.[ this.name ]?.lightmaps;
		const attributes = nodeDef.extensions?.EXT_mesh_gpu_instancing?.attributes;
		const hasAtlas = attributes && Object.keys( instanceAttributes ).some( name => attributes[ name ] !== undefined );
		if ( bindings !== undefined && ( ! Array.isArray( bindings ) || bindings.length === 0 ) ) throw new Error( 'KHR_lightmap: Node bindings must be nonempty.' );
		if ( ! bindings && ! hasAtlas ) return null;
		if ( nodeDef.mesh === undefined ) throw new Error( 'KHR_lightmap: Node bindings require a mesh.' );
		return parser.loadNode( nodeIndex ).then( async node => {

			const primitives = [];
			const collect = object => {

				// Mesh attachments can be nested under a group beside a camera/light.
				// Descendant glTF nodes have their own bindings and are excluded.
				if ( object !== node && parser.associations.get( object )?.nodes !== undefined ) return;
				if ( object.isMesh ) primitives.push( object );
				else for ( const child of object.children ) collect( child );

			};

			collect( node );
			const used = new Set();
			for ( const binding of bindings || [] ) {

				const mesh = primitives[ binding.primitive ];
				if ( ! Number.isInteger( binding.primitive ) || ! mesh || used.has( binding.primitive ) ) throw new Error( 'KHR_lightmap: Invalid or repeated primitive binding.' );
				used.add( binding.primitive );
				mesh.material = mesh.material.clone();
				const materialIndex = parser.json.meshes[ nodeDef.mesh ].primitives[ binding.primitive ].material;
				await this.assignBinding( mesh.material, binding, parser.json.materials?.[ materialIndex ] );
				if ( binding.directionTexture !== undefined ) this.assignDirection( mesh.material, await parser.getDependency( 'texture', binding.directionTexture.index ) );
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

							const value = accessor.getComponent( i, c );
							if ( ! Number.isFinite( value ) || ( name === '_LIGHTMAP_INTENSITY' && value < 0 ) ) throw new Error( 'KHR_lightmap: Invalid instance value.' );

						}

					}

					atlas[ name ] = accessor;

				}

				if ( counts.size !== 1 || ! primitives.some( mesh => mesh.material.lightMap ) ) throw new Error( 'KHR_lightmap: Invalid instance binding or count.' );
				for ( const mesh of primitives ) {

					if ( ! mesh.material.lightMap ) continue;
					await this.resolveDirection( mesh.material );
					if ( this.keepInstances ) continue;
					const replacement = this.expandInstances( mesh, atlas );
					if ( mesh === node ) {

						parser.associations.set( replacement, parser.associations.get( node ) );
						node = replacement;

					} else {

						const parent = mesh.parent;
						const index = parent.children.indexOf( mesh );
						parent.remove( mesh );
						parent.add( replacement );
						parent.children.splice( parent.children.indexOf( replacement ), 1 );
						parent.children.splice( index, 0, replacement );

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
			material.lightMapIntensity *= atlas._LIGHTMAP_INTENSITY ? atlas._LIGHTMAP_INTENSITY.getX( i ) : 1;
			material.lightMap.channel = channel;
			material.lightMap.offset.set( 0, 0 );
			material.lightMap.repeat.set( 1, 1 );
			material.lightMap.rotation = 0;
			material.lightMap.matrix.identity();
			material.lightMap.matrixAutoUpdate = true;
			if ( mesh.material.lightMapDirection ) this.assignDirection( material, mesh.material.lightMapDirection );
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

/**
 * Decodes a PNG with 16 bits per sample, as the browser decodes them with 8 bits.
 *
 * @private
 * @param {ArrayBuffer} buffer - The PNG file.
 * @return {Promise<?{width: number, height: number, channels: number, samples: Uint16Array}>} The samples,
 * or null for other PNGs.
 */
async function decodePNG16( buffer ) {

	const bytes = new Uint8Array( buffer );
	const view = new DataView( buffer );
	const signature = [ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a ];
	if ( bytes.length < 33 || signature.some( ( value, i ) => bytes[ i ] !== value ) ) return null;

	// the header is the first chunk

	const width = view.getUint32( 16 ), height = view.getUint32( 20 );
	const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[ bytes[ 25 ] ];
	if ( bytes[ 24 ] !== 16 || channels === undefined || bytes[ 28 ] !== 0 ) return null;

	const parts = [];

	for ( let offset = 8; offset + 8 <= bytes.length; ) {

		const length = view.getUint32( offset );
		const type = String.fromCharCode( ...bytes.subarray( offset + 4, offset + 8 ) );
		if ( type === 'IDAT' ) parts.push( bytes.subarray( offset + 8, offset + 8 + length ) );
		if ( type === 'IEND' ) break;
		offset += length + 12;

	}

	const stream = new Blob( parts ).stream().pipeThrough( new DecompressionStream( 'deflate' ) );
	const raw = new Uint8Array( await new Response( stream ).arrayBuffer() );
	const bytesPerPixel = channels * 2;
	const rowBytes = width * bytesPerPixel;
	if ( raw.length < height * ( rowBytes + 1 ) ) throw new Error( 'KHR_lightmap: Truncated PNG.' );

	const samples = new Uint16Array( width * height * channels );
	let row = new Uint8Array( rowBytes ), previous = new Uint8Array( rowBytes );

	for ( let y = 0; y < height; y ++ ) {

		const filter = raw[ y * ( rowBytes + 1 ) ];
		const line = raw.subarray( y * ( rowBytes + 1 ) + 1, ( y + 1 ) * ( rowBytes + 1 ) );

		for ( let i = 0; i < rowBytes; i ++ ) {

			const a = i >= bytesPerPixel ? row[ i - bytesPerPixel ] : 0;
			const b = previous[ i ];
			let predictor = 0;

			if ( filter === 1 ) predictor = a;
			else if ( filter === 2 ) predictor = b;
			else if ( filter === 3 ) predictor = ( a + b ) >> 1;
			else if ( filter === 4 ) {

				const c = i >= bytesPerPixel ? previous[ i - bytesPerPixel ] : 0;
				const p = a + b - c, pa = Math.abs( p - a ), pb = Math.abs( p - b ), pc = Math.abs( p - c );
				predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;

			}

			row[ i ] = line[ i ] + predictor;

		}

		for ( let i = 0, offset = y * width * channels; i < width * channels; i ++ ) samples[ offset + i ] = row[ i * 2 ] << 8 | row[ i * 2 + 1 ];

		[ row, previous ] = [ previous, row ];

	}

	return { width, height, channels, samples };

}

export { GLTFLightMapLoaderExtension };
