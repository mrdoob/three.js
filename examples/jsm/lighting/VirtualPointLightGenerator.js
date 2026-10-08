import { Color, FloatType, Matrix3, MirroredRepeatWrapping, NearestFilter, Raycaster, RepeatWrapping, SRGBColorSpace, Vector2, Vector3, Vector4 } from 'three';

const _white = /*@__PURE__*/ new Color( 0xffffff );

/**
 * Generates deterministic diffuse light paths from point or directional lights.
 * Samples visible, static meshes using CPU raycasting. Base-color maps and alpha cutouts use cached CPU texels.
 * Instancing, skinning, mip selection and specular transport are not evaluated.
 *
 * Source lights must be directional lights or point lights with `decay = 2` and `distance = 0`.
 * Material textures must be loaded and use UV channel 0 or 1. Data textures must be RGBA
 * unsigned-byte or float textures.
 *
 * @three_import import { VirtualPointLightGenerator } from 'three/addons/lighting/VirtualPointLightGenerator.js';
 */
class VirtualPointLightGenerator {

	/**
	 * Constructs a new virtual point light generator.
	 *
	 * @param {number} [capacity=1024] - Maximum number of samples.
	 */
	constructor( capacity = 1024 ) {

		/**
		 * The maximum sample count.
		 *
		 * @type {number}
		 * @default 1024
		 */
		this.capacity = capacity;

		/**
		 * The number of successful hits from the last generation.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.count = 0;

		/**
		 * World-space emitter positions.
		 *
		 * @type {Array<Vector3>}
		 */
		this.positions = Array.from( { length: capacity }, () => new Vector3() );

		/**
		 * World-space geometric emitter normals.
		 *
		 * @type {Array<Vector3>}
		 */
		this.normals = Array.from( { length: capacity }, () => new Vector3() );

		/**
		 * Reflected RGB radiant flux, before the emitter's Lambertian factor.
		 *
		 * @type {Array<Vector3>}
		 */
		this.flux = Array.from( { length: capacity }, () => new Vector3() );

		this._textureSampler = new TextureSampler();

	}

	/**
	 * Regenerate samples after changing geometry, materials or source lights.
	 * Escaped rays retain their share of the source power; misses are not renormalized.
	 *
	 * @param {Scene} scene - The static scene.
	 * @param {Array<PointLight|DirectionalLight>} lights - Source lights.
	 * @param {Object} [options={}] - Sampling options.
	 * @param {number} [options.count=256] - Total ray budget across all lights and bounce depths. Must be at least `lights.length * bounces` and at most `capacity`.
	 * @param {number} [options.bounces=1] - Maximum diffuse bounce depth, from 1 to 4.
	 * @param {number} [options.seed=1] - Random seed.
	 * @param {Box3} [options.bounds] - World-space sampling domain, required for directional lights.
	 * @return {VirtualPointLightGenerator} A reference to this generator.
	 */
	generate( scene, lights, { count = 256, seed = 1, bounds = null, bounces = 1 } = {} ) {

		scene.updateMatrixWorld( true );
		const surfaces = [];
		scene.traverseVisible( object => {

			if ( object.isMesh ) surfaces.push( object );

		} );

		const raycaster = new Raycaster();
		const hasCutouts = surfaces.some( surface => ( Array.isArray( surface.material ) ? surface.material : [ surface.material ] ).some( material => material.alphaTest > 0 ) );
		raycaster.firstHitOnly = ! hasCutouts; // Accelerated raycasting uses this; native raycasting ignores it.
		const origin = new Vector3();
		const direction = new Vector3();
		const u = new Vector3();
		const v = new Vector3();
		const corner = new Vector3();
		const normalMatrix = new Matrix3();
		const albedo = new Color();
		const throughput = new Color();
		const paths = Math.floor( count / bounces );
		let state = seed >>> 0;
		const random = () => {

			state = state + 0x6D2B79F5 >>> 0;
			let t = Math.imul( state ^ state >>> 15, 1 | state );
			t = t + Math.imul( t ^ t >>> 7, 61 | t ) ^ t;
			return ( ( t ^ t >>> 14 ) >>> 0 ) / 4294967296;

		};

		this.count = 0;

		for ( let l = 0; l < lights.length; l ++ ) {

			const light = lights[ l ];
			light.updateWorldMatrix( true, false );
			light.getWorldPosition( origin );
			const samples = Math.floor( paths / lights.length ) + ( l < paths % lights.length ? 1 : 0 );
			let power = 4 * Math.PI * light.intensity / samples;
			let minU = Infinity, maxU = - Infinity, minV = Infinity, maxV = - Infinity, minDepth = Infinity;

			if ( light.isDirectionalLight ) {

				light.target.updateWorldMatrix( true, false );
				light.target.getWorldPosition( direction ).sub( origin ).normalize();
				u.set( 0, 1, 0 );
				if ( Math.abs( direction.y ) > 0.99 ) u.set( 1, 0, 0 );
				u.cross( direction ).normalize();
				v.crossVectors( direction, u );

				for ( let j = 0; j < 8; j ++ ) {

					corner.set( j & 1 ? bounds.max.x : bounds.min.x, j & 2 ? bounds.max.y : bounds.min.y, j & 4 ? bounds.max.z : bounds.min.z );
					minU = Math.min( minU, corner.dot( u ) );
					maxU = Math.max( maxU, corner.dot( u ) );
					minV = Math.min( minV, corner.dot( v ) );
					maxV = Math.max( maxV, corner.dot( v ) );
					minDepth = Math.min( minDepth, corner.dot( direction ) );

				}

				// Parallel rays carry irradiance times projected area; no inverse-square falloff.

				power = light.intensity * ( maxU - minU ) * ( maxV - minV ) / samples;

			}

			const emissionOrigin = origin.clone();
			const emissionDirection = direction.clone();
			const emissionU = u.clone();
			const emissionV = v.clone();

			for ( let i = 0; i < samples; i ++ ) {

				throughput.copy( light.color );
				direction.copy( emissionDirection );
				u.copy( emissionU );
				v.copy( emissionV );
				origin.copy( emissionOrigin );

				if ( light.isDirectionalLight ) {

					origin.copy( direction ).multiplyScalar( minDepth - 0.01 );
					origin.addScaledVector( u, minU + random() * ( maxU - minU ) );
					origin.addScaledVector( v, minV + random() * ( maxV - minV ) );
					raycaster.set( origin, direction );

				} else {

					const z = random() * 2 - 1;
					const phi = random() * Math.PI * 2;
					const r = Math.sqrt( 1 - z * z );
					raycaster.set( origin, direction.set( r * Math.cos( phi ), z, r * Math.sin( phi ) ) );

				}

				for ( let depth = 0; depth < bounces; depth ++ ) {

					const hits = raycaster.intersectObjects( surfaces, false );
					let hit, material;

					for ( const candidate of hits ) {

						const candidateMaterial = Array.isArray( candidate.object.material ) ? candidate.object.material[ candidate.face.materialIndex ] : candidate.object.material;
						let alpha = candidateMaterial.opacity;
						if ( candidateMaterial.alphaTest > 0 ) {

							if ( candidateMaterial.map ) alpha *= this._textureSampler.sample( candidateMaterial.map, candidate ).w;
							if ( candidateMaterial.alphaMap ) alpha *= this._textureSampler.sample( candidateMaterial.alphaMap, candidate ).y;
							if ( alpha <= candidateMaterial.alphaTest ) continue;

						}

						hit = candidate;
						material = candidateMaterial;
						break;

					}

					if ( hit === undefined ) break;
					albedo.copy( material.color || _white ).multiply( throughput );
					if ( material.map ) {

						const texel = this._textureSampler.sample( material.map, hit );
						albedo.r *= texel.x;
						albedo.g *= texel.y;
						albedo.b *= texel.z;

					}

					albedo.multiplyScalar( 1 - ( material.metalness || 0 ) );
					const index = this.count ++;
					this.positions[ index ].copy( hit.point );
					normalMatrix.getNormalMatrix( hit.object.matrixWorld );
					const normal = this.normals[ index ].copy( hit.face.normal ).applyNormalMatrix( normalMatrix );
					if ( normal.dot( direction ) > 0 ) normal.negate();
					this.flux[ index ].set( albedo.r, albedo.g, albedo.b ).multiplyScalar( power );

					throughput.copy( albedo );
					if ( depth + 1 === bounces || Math.max( throughput.r, throughput.g, throughput.b ) === 0 ) break;

					// Cosine-weighted diffuse continuation cancels the BRDF cosine/PDF factors.

					const radius = Math.sqrt( random() );
					const phi = random() * Math.PI * 2;
					u.set( Math.abs( normal.y ) > 0.99 ? 1 : 0, Math.abs( normal.y ) > 0.99 ? 0 : 1, 0 ).cross( normal ).normalize();
					v.crossVectors( normal, u );
					direction.copy( normal ).multiplyScalar( Math.sqrt( 1 - radius * radius ) );
					direction.addScaledVector( u, radius * Math.cos( phi ) ).addScaledVector( v, radius * Math.sin( phi ) );
					origin.copy( hit.point ).addScaledVector( normal, 0.001 );
					raycaster.set( origin, direction );

				}

			}

		}

		return this;

	}

}

// CPU base-level texture sampling with cached texels.

class TextureSampler {

	constructor() {

		this.images = new WeakMap();
		this.uv = new Vector2();
		this.value = new Vector4();

	}

	sample( texture, hit ) {

		if ( texture.matrixAutoUpdate ) texture.updateMatrix();
		texture.transformUv( this.uv.copy( texture.channel === 1 ? hit.uv1 : hit.uv ) );

		let image = this.images.get( texture );
		if ( ! image || image.version !== texture.source.version ) {

			const source = texture.image;
			let data;
			let scale = 1 / 255;

			if ( source.data ) {

				data = source.data;
				if ( texture.type === FloatType ) scale = 1;

			} else {

				const canvas = document.createElement( 'canvas' );
				canvas.width = source.width;
				canvas.height = source.height;
				const context = canvas.getContext( '2d', { willReadFrequently: true } );
				context.drawImage( source, 0, 0 );
				data = context.getImageData( 0, 0, canvas.width, canvas.height ).data;

			}

			image = { data, width: source.width, height: source.height, scale, version: texture.source.version };
			this.images.set( texture, image );

		}

		const wrap = ( index, size, mode ) => {

			if ( mode === RepeatWrapping ) return ( index % size + size ) % size;
			if ( mode === MirroredRepeatWrapping ) {

				const mirrored = ( index % ( size * 2 ) + size * 2 ) % ( size * 2 );
				return mirrored < size ? mirrored : size * 2 - mirrored - 1;

			}

			return Math.min( size - 1, Math.max( 0, index ) );

		};

		const x = this.uv.x * image.width - 0.5;
		const y = this.uv.y * image.height - 0.5;
		const nearest = texture.magFilter === NearestFilter;
		const ix = nearest ? Math.round( x ) : Math.floor( x );
		const iy = nearest ? Math.round( y ) : Math.floor( y );
		const fx = nearest ? 0 : x - ix;
		const fy = nearest ? 0 : y - iy;
		this.value.set( 0, 0, 0, 0 );

		for ( let j = 0; j < 2; j ++ ) {

			for ( let i = 0; i < 2; i ++ ) {

				const weight = ( i ? fx : 1 - fx ) * ( j ? fy : 1 - fy );
				if ( weight === 0 ) continue;
				const offset = ( wrap( iy + j, image.height, texture.wrapT ) * image.width + wrap( ix + i, image.width, texture.wrapS ) ) * 4;

				for ( let c = 0; c < 4; c ++ ) {

					let value = image.data[ offset + c ] * image.scale;

					// decode sRGB before filtering, matching GPU sampling

					if ( c < 3 && texture.colorSpace === SRGBColorSpace ) value = value <= 0.04045 ? value / 12.92 : Math.pow( ( value + 0.055 ) / 1.055, 2.4 );
					this.value.setComponent( c, this.value.getComponent( c ) + value * weight );

				}

			}

		}

		return this.value;

	}

}

export { VirtualPointLightGenerator };
