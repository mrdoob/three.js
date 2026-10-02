import { Box3, Color, Matrix4, Vector2, Vector3, BackSide, DoubleSide, SRGBColorSpace } from 'three/webgpu';

const _matrix = /*@__PURE__*/ new Matrix4();
const _box = /*@__PURE__*/ new Box3();
const _va = /*@__PURE__*/ new Vector3();
const _vb = /*@__PURE__*/ new Vector3();
const _vc = /*@__PURE__*/ new Vector3();
const _uva = /*@__PURE__*/ new Vector2();
const _uvb = /*@__PURE__*/ new Vector2();
const _uvc = /*@__PURE__*/ new Vector2();
const _uv = /*@__PURE__*/ new Vector2();
const _color = /*@__PURE__*/ new Color();
const _albedo = /*@__PURE__*/ new Color();
const _emissive = /*@__PURE__*/ new Color();

const IMAGE_SAMPLE_SIZE = 64;

/**
 * Number of floats per triangle record: three positions (vec4 each, w unused),
 * albedo (rgb + side flag) and emissive (rgb + unused).
 */
export const TRIANGLE_STRIDE = 20;

const _srgbLUT = new Float32Array( 256 );

for ( let i = 0; i < 256; i ++ ) {

	const c = i / 255;
	_srgbLUT[ i ] = ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

class GrowableFloat32Array {

	constructor( initialSize ) {

		this.array = new Float32Array( initialSize );
		this.length = 0;

	}

	ensure( count ) {

		if ( this.length + count > this.array.length ) {

			let size = this.array.length * 2;
			while ( size < this.length + count ) size *= 2;

			const array = new Float32Array( size );
			array.set( this.array );
			this.array = array;

		}

	}

	push4( x, y, z, w ) {

		const a = this.array, i = this.length;
		a[ i ] = x; a[ i + 1 ] = y; a[ i + 2 ] = z; a[ i + 3 ] = w;
		this.length += 4;

	}

	result() {

		return this.array.slice( 0, this.length );

	}

}

/**
 * Downscales a texture image into a small pixel buffer so triangle colors can be
 * looked up on the CPU. Returns `null` for images that cannot be read.
 *
 * @private
 * @param {Texture} texture - The texture.
 * @param {Map<string, ?Object>} cache - Cache keyed by texture uuid.
 * @return {?{data: Uint8ClampedArray, width: number, height: number, srgb: boolean}} The image sampler.
 */
function getImageSampler( texture, cache ) {

	if ( cache.has( texture.uuid ) ) return cache.get( texture.uuid );

	let sampler = null;
	const image = texture.image;

	if ( image && texture.isCompressedTexture !== true ) {

		const srgb = texture.colorSpace === SRGBColorSpace;

		if ( image.data !== undefined && image.width !== undefined ) {

			// DataTexture (RGBA 8-bit only)

			if ( image.data.length === image.width * image.height * 4 && image.data.BYTES_PER_ELEMENT === 1 ) {

				sampler = { data: image.data, width: image.width, height: image.height, srgb };

			}

		} else if ( image.width > 0 && image.height > 0 ) {

			try {

				const size = IMAGE_SAMPLE_SIZE;
				const canvas = ( typeof OffscreenCanvas !== 'undefined' ) ? new OffscreenCanvas( size, size ) : document.createElement( 'canvas' );
				canvas.width = size;
				canvas.height = size;

				const context = canvas.getContext( '2d', { willReadFrequently: true } );
				context.imageSmoothingEnabled = true;
				context.imageSmoothingQuality = 'high';
				context.drawImage( image, 0, 0, size, size );

				sampler = { data: context.getImageData( 0, 0, size, size ).data, width: size, height: size, srgb };

			} catch ( e ) {

				sampler = null;

			}

		}

	}

	cache.set( texture.uuid, sampler );

	return sampler;

}

/**
 * Samples the given texture at the given uv coordinates. The result is written
 * into `target` (linear rgb) and the alpha is returned.
 *
 * @private
 */
function sampleTexture( texture, sampler, uv, target ) {

	_uv.copy( uv );
	texture.transformUv( _uv );

	const x = Math.min( sampler.width - 1, Math.max( 0, Math.floor( _uv.x * sampler.width ) ) );
	const y = Math.min( sampler.height - 1, Math.max( 0, Math.floor( _uv.y * sampler.height ) ) );
	const i = ( y * sampler.width + x ) * 4;
	const data = sampler.data;

	if ( sampler.srgb ) {

		target.setRGB( _srgbLUT[ data[ i ] ], _srgbLUT[ data[ i + 1 ] ], _srgbLUT[ data[ i + 2 ] ] );

	} else {

		target.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 );

	}

	return data[ i + 3 ] / 255;

}

function getMaterialInfo( material, cache, imageCache ) {

	if ( cache.has( material ) ) return cache.get( material );

	const unlit = material.isMeshBasicMaterial === true || material.isMeshBasicNodeMaterial === true;

	const info = {
		unlit,
		side: material.side === BackSide ? 1 : ( material.side === DoubleSide ? 2 : 0 ),
		opacity: material.transparent === true ? material.opacity : 1,
		alphaTest: material.alphaTest || 0,
		color: material.color ? material.color : null,
		emissive: ( ! unlit && material.emissive ) ? material.emissive : null,
		emissiveIntensity: material.emissiveIntensity !== undefined ? material.emissiveIntensity : 1,
		map: null,
		mapSampler: null,
		emissiveMap: null,
		emissiveMapSampler: null
	};

	if ( material.map && material.map.isTexture ) {

		info.mapSampler = getImageSampler( material.map, imageCache );
		if ( info.mapSampler !== null ) info.map = material.map;

	}

	if ( ! unlit && material.emissiveMap && material.emissiveMap.isTexture ) {

		info.emissiveMapSampler = getImageSampler( material.emissiveMap, imageCache );
		if ( info.emissiveMapSampler !== null ) info.emissiveMap = material.emissiveMap;

	}

	// the uv transform is normally updated by the renderer

	if ( info.map !== null && info.map.matrixAutoUpdate === true ) info.map.updateMatrix();
	if ( info.emissiveMap !== null && info.emissiveMap.matrixAutoUpdate === true ) info.emissiveMap.updateMatrix();

	cache.set( material, info );

	return info;

}

/**
 * Returns `true` if the object should contribute geometry to the voxel volume.
 *
 * @private
 */
function isVoxelizable( object, layers, exclude ) {

	return object.isMesh === true && object.isSkyMesh !== true && object.isBatchedMesh !== true &&
		layers.test( object.layers ) === true && exclude.has( object ) === false && object.geometry !== undefined;

}

/**
 * Computes the world-space bounding box of all voxelizable meshes.
 *
 * @param {Scene} scene - The scene.
 * @param {Layers} layers - Only objects that pass the layer test are considered.
 * @param {Set<Object3D>} exclude - Objects to skip.
 * @param {Box3} target - The target box.
 * @return {Box3} The bounding box.
 */
export function computeSceneBounds( scene, layers, exclude, target ) {

	target.makeEmpty();

	scene.traverseVisible( ( object ) => {

		if ( isVoxelizable( object, layers, exclude ) ) {

			target.expandByObject( object, true );

		}

	} );

	return target;

}

/**
 * Collects the triangles of all meshes in the scene as flat, world-space records suitable
 * for GPU voxelization. Per-triangle albedo and emissive colors are resolved on the CPU
 * (material color multiplied with a texture lookup at the triangle's centroid). Large
 * triangles are subdivided so every record covers a bounded number of voxels.
 *
 * @param {Scene} scene - The scene.
 * @param {Object} options - Options.
 * @param {Box3} options.bounds - Triangles outside these bounds are skipped.
 * @param {Layers} options.layers - Objects must pass this layer test.
 * @param {Set<Object3D>} options.exclude - Objects to skip.
 * @param {number} options.subVoxelSize - Size of a sub-voxel in world units.
 * @param {number} options.maxEdge - Maximum triangle edge length in sub-voxels before subdivision.
 * @param {number} options.minOpacity - Triangles with lower opacity are skipped.
 * @return {{data: Float32Array, count: number}} The triangle records and triangle count.
 */
export function collectSceneTriangles( scene, options ) {

	const { bounds, layers, exclude, subVoxelSize, maxEdge, minOpacity } = options;

	const materialCache = new Map();
	const imageCache = new Map();
	const buffer = new GrowableFloat32Array( 1024 * TRIANGLE_STRIDE );

	const maxEdgeSq = ( maxEdge * subVoxelSize ) * ( maxEdge * subVoxelSize );

	// triangle emission with subdivision of large triangles

	const stack = [];

	function emit( a, b, c, albedo, emissive, side ) {

		stack.push( a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z );

		while ( stack.length > 0 ) {

			const cz = stack.pop(), cy = stack.pop(), cx = stack.pop();
			const bz = stack.pop(), by = stack.pop(), bx = stack.pop();
			const az = stack.pop(), ay = stack.pop(), ax = stack.pop();

			const abSq = ( bx - ax ) ** 2 + ( by - ay ) ** 2 + ( bz - az ) ** 2;
			const bcSq = ( cx - bx ) ** 2 + ( cy - by ) ** 2 + ( cz - bz ) ** 2;
			const caSq = ( ax - cx ) ** 2 + ( ay - cy ) ** 2 + ( az - cz ) ** 2;
			const longest = Math.max( abSq, bcSq, caSq );

			if ( longest > maxEdgeSq ) {

				// split along the longest edge

				if ( longest === abSq ) {

					const mx = ( ax + bx ) * 0.5, my = ( ay + by ) * 0.5, mz = ( az + bz ) * 0.5;
					stack.push( ax, ay, az, mx, my, mz, cx, cy, cz );
					stack.push( mx, my, mz, bx, by, bz, cx, cy, cz );

				} else if ( longest === bcSq ) {

					const mx = ( bx + cx ) * 0.5, my = ( by + cy ) * 0.5, mz = ( bz + cz ) * 0.5;
					stack.push( ax, ay, az, bx, by, bz, mx, my, mz );
					stack.push( ax, ay, az, mx, my, mz, cx, cy, cz );

				} else {

					const mx = ( cx + ax ) * 0.5, my = ( cy + ay ) * 0.5, mz = ( cz + az ) * 0.5;
					stack.push( ax, ay, az, bx, by, bz, mx, my, mz );
					stack.push( mx, my, mz, bx, by, bz, cx, cy, cz );

				}

				continue;

			}

			buffer.ensure( TRIANGLE_STRIDE );
			buffer.push4( ax, ay, az, 0 );
			buffer.push4( bx, by, bz, 0 );
			buffer.push4( cx, cy, cz, 0 );
			buffer.push4( albedo.r, albedo.g, albedo.b, side );
			buffer.push4( emissive.r, emissive.g, emissive.b, 0 );

		}

	}

	function processMesh( mesh, matrixWorld ) {

		const geometry = mesh.geometry;
		const positionAttribute = geometry.getAttribute( 'position' );

		if ( positionAttribute === undefined ) return;

		const index = geometry.index;
		const materials = Array.isArray( mesh.material ) ? mesh.material : [ mesh.material ];
		const vertexCount = index !== null ? index.count : positionAttribute.count;

		let groups = geometry.groups;

		if ( Array.isArray( mesh.material ) === false || groups.length === 0 ) {

			groups = [ { start: 0, count: vertexCount, materialIndex: 0 } ];

		}

		const drawRange = geometry.drawRange;
		const rangeStart = drawRange.start;
		const rangeEnd = Math.min( vertexCount, drawRange.start + drawRange.count );

		for ( const group of groups ) {

			const material = materials[ group.materialIndex ];

			if ( material === undefined || material === null || material.visible === false ) continue;

			const info = getMaterialInfo( material, materialCache, imageCache );

			if ( info.opacity < minOpacity ) continue;

			const uvAttribute = info.map !== null ? geometry.getAttribute( info.map.channel > 0 ? 'uv' + info.map.channel : 'uv' ) : null;
			const emissiveUVAttribute = info.emissiveMap !== null ? geometry.getAttribute( info.emissiveMap.channel > 0 ? 'uv' + info.emissiveMap.channel : 'uv' ) : null;

			const start = Math.max( group.start, rangeStart );
			const end = Math.min( group.start + group.count, rangeEnd );

			for ( let i = start; i + 2 < end; i += 3 ) {

				const ia = index !== null ? index.getX( i ) : i;
				const ib = index !== null ? index.getX( i + 1 ) : i + 1;
				const ic = index !== null ? index.getX( i + 2 ) : i + 2;

				_va.fromBufferAttribute( positionAttribute, ia ).applyMatrix4( matrixWorld );
				_vb.fromBufferAttribute( positionAttribute, ib ).applyMatrix4( matrixWorld );
				_vc.fromBufferAttribute( positionAttribute, ic ).applyMatrix4( matrixWorld );

				// skip triangles outside the volume

				_box.makeEmpty().expandByPoint( _va ).expandByPoint( _vb ).expandByPoint( _vc );

				if ( bounds.intersectsBox( _box ) === false ) continue;

				// skip degenerate triangles

				if ( _box.min.distanceToSquared( _box.max ) < 1e-14 ) continue;

				// resolve colors

				let alpha = info.opacity;

				if ( info.color !== null ) _albedo.copy( info.color ); else _albedo.setRGB( 1, 1, 1 );

				if ( uvAttribute !== undefined && uvAttribute !== null ) {

					_uva.fromBufferAttribute( uvAttribute, ia );
					_uvb.fromBufferAttribute( uvAttribute, ib );
					_uvc.fromBufferAttribute( uvAttribute, ic );
					_uva.add( _uvb ).add( _uvc ).multiplyScalar( 1 / 3 );

					alpha *= sampleTexture( info.map, info.mapSampler, _uva, _color );
					_albedo.multiply( _color );

				}

				if ( info.alphaTest > 0 && alpha < info.alphaTest ) continue;
				if ( alpha < minOpacity ) continue;

				if ( info.unlit ) {

					_emissive.copy( _albedo );
					_albedo.setRGB( 0, 0, 0 );

				} else {

					if ( info.emissive !== null ) {

						_emissive.copy( info.emissive ).multiplyScalar( info.emissiveIntensity );

						if ( emissiveUVAttribute !== undefined && emissiveUVAttribute !== null ) {

							_uva.fromBufferAttribute( emissiveUVAttribute, ia );
							_uvb.fromBufferAttribute( emissiveUVAttribute, ib );
							_uvc.fromBufferAttribute( emissiveUVAttribute, ic );
							_uva.add( _uvb ).add( _uvc ).multiplyScalar( 1 / 3 );

							sampleTexture( info.emissiveMap, info.emissiveMapSampler, _uva, _color );
							_emissive.multiply( _color );

						}

					} else {

						_emissive.setRGB( 0, 0, 0 );

					}

				}

				emit( _va, _vb, _vc, _albedo, _emissive, info.side );

			}

		}

	}

	scene.traverseVisible( ( object ) => {

		if ( isVoxelizable( object, layers, exclude ) === false ) return;

		if ( object.isInstancedMesh === true ) {

			for ( let i = 0; i < object.count; i ++ ) {

				object.getMatrixAt( i, _matrix );
				_matrix.premultiply( object.matrixWorld );
				processMesh( object, _matrix );

			}

		} else {

			processMesh( object, object.matrixWorld );

		}

	} );

	const data = buffer.result();

	return { data, count: data.length / TRIANGLE_STRIDE };

}
