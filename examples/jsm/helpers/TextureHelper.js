import {
	BoxGeometry,
	BufferAttribute,
	DoubleSide,
	Mesh,
	PlaneGeometry,
	ShaderMaterial,
	Vector3,
} from 'three';
import { mergeGeometries } from '../utils/BufferGeometryUtils.js';

/**
 * A helper that can be used to display any type of texture for
 * debugging purposes. Depending on the type of texture (2D, 3D, Array),
 * the helper becomes a plane or box mesh.
 *
 * This helper can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, import from `TextureHelperGPU.js`.
 *
 * @augments Mesh
 */
class TextureHelper extends Mesh {

	/**
	 * Constructs a new texture helper.
	 *
	 * @param {Texture} texture - The texture to visualize.
	 * @param {number} [width=1] - The helper's width.
	 * @param {number} [height=1] - The helper's height.
	 * @param {number} [depth=1] - The helper's depth.
	 */
	constructor( texture, width = 1, height = 1, depth = 1 ) {

		const material = new ShaderMaterial( {

			type: 'TextureHelperMaterial',

			side: DoubleSide,
			transparent: true,

			uniforms: {

				map: { value: texture },
				alpha: { value: getAlpha( texture ) },

			},

			vertexShader: [

				'attribute vec3 uvw;',

				'varying vec3 vUvw;',

				'void main() {',

				'	vUvw = uvw;',

				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

				'}',

			].join( '\n' ),

			fragmentShader: [

				'precision highp float;',

				'precision highp sampler2DArray;',

				'precision highp sampler3D;',

				'uniform {samplerType} map;',

				'uniform float alpha;',

				'varying vec3 vUvw;',

				'vec4 textureHelper( in sampler2D map ) { return texture( map, vUvw.xy ); }',

				'vec4 textureHelper( in sampler2DArray map ) { return texture( map, vUvw ); }',

				'vec4 textureHelper( in sampler3D map ) { return texture( map, vUvw ); }',

				'vec4 textureHelper( in samplerCube map ) { return texture( map, vUvw ); }',

				'void main() {',

				'	gl_FragColor = linearToOutputTexel( vec4( textureHelper( map ).xyz, alpha ) );',

				'}'

			].join( '\n' ).replace( '{samplerType}', getSamplerType( texture ) )

		} );

		const geometry = texture.isCubeTexture
			? createCubeGeometry( width, height, depth )
			: createSliceGeometry( texture, width, height, depth );

		super( geometry, material );

		/**
		 * The texture to visualize.
		 *
		 * @type {Texture}
		 */
		this.texture = texture;
		this.type = 'TextureHelper';

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

function getSamplerType( texture ) {

	if ( texture.isCubeTexture ) {

		return 'samplerCube';

	} else if ( texture.isDataArrayTexture || texture.isCompressedArrayTexture ) {

		return 'sampler2DArray';

	} else if ( texture.isData3DTexture || texture.isCompressed3DTexture ) {

		return 'sampler3D';

	} else {

		return 'sampler2D';

	}

}

function getImageCount( texture ) {

	if ( texture.isCubeTexture ) {

		return 6;

	} else if ( texture.isDataArrayTexture || texture.isCompressedArrayTexture ) {

		return texture.image.depth;

	} else if ( texture.isData3DTexture || texture.isCompressed3DTexture ) {

		return texture.image.depth;

	} else {

		return 1;

	}

}

function getAlpha( texture ) {

	if ( texture.isCubeTexture ) {

		return 1;

	} else if ( texture.isDataArrayTexture || texture.isCompressedArrayTexture ) {

		return Math.max( 1 / texture.image.depth, 0.25 );

	} else if ( texture.isData3DTexture || texture.isCompressed3DTexture ) {

		return Math.max( 1 / texture.image.depth, 0.25 );

	} else {

		return 1;

	}

}

function createCubeGeometry( width, height, depth ) {

	const geometry = new BoxGeometry( width, height, depth );

	const position = geometry.attributes.position;
	const uv = geometry.attributes.uv;
	const uvw = new BufferAttribute( new Float32Array( uv.count * 3 ), 3 );

	const _direction = new Vector3();

	for ( let j = 0, jl = uv.count; j < jl; ++ j ) {

		_direction.fromBufferAttribute( position, j ).normalize();

		const u = _direction.x;
		const v = _direction.y;
		const w = _direction.z;

		uvw.setXYZ( j, u, v, w );

	}

	geometry.deleteAttribute( 'uv' );
	geometry.setAttribute( 'uvw', uvw );

	return geometry;

}

function createSliceGeometry( texture, width, height, depth ) {

	const sliceCount = getImageCount( texture );

	const geometries = [];

	for ( let i = 0; i < sliceCount; ++ i ) {

		const geometry = new PlaneGeometry( width, height );

		if ( sliceCount > 1 ) {

			geometry.translate( 0, 0, depth * ( i / ( sliceCount - 1 ) - 0.5 ) );

		}

		const uv = geometry.attributes.uv;
		const uvw = new BufferAttribute( new Float32Array( uv.count * 3 ), 3 );

		for ( let j = 0, jl = uv.count; j < jl; ++ j ) {

			const u = uv.getX( j );
			const v = texture.flipY ? uv.getY( j ) : 1 - uv.getY( j );
			const w = sliceCount === 1
				? 1
				: texture.isDataArrayTexture || texture.isCompressedArrayTexture
					? i
					: i / ( sliceCount - 1 );

			uvw.setXYZ( j, u, v, w );

		}

		geometry.deleteAttribute( 'uv' );
		geometry.setAttribute( 'uvw', uvw );

		geometries.push( geometry );

	}

	return mergeGeometries( geometries );

}

export { TextureHelper };
