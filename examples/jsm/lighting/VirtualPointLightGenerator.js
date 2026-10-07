import { Color, Matrix3, Raycaster, Vector3 } from 'three';
import { VirtualPointLightTextureSampler } from './VirtualPointLightTextureSampler.js';

/**
 * Generates a deterministic, single diffuse bounce from point or directional lights.
 * Samples visible, static meshes using CPU raycasting. Base-color maps and alpha cutouts use cached CPU texels.
 * Instancing, skinning, mip selection and specular transport are not evaluated.
 *
 * @three_import import { VirtualPointLightGenerator } from 'three/addons/lighting/VirtualPointLightGenerator.js';
 */
class VirtualPointLightGenerator {

	/**
	 * @param {number} [capacity=1024] - Maximum number of samples.
	 */
	constructor( capacity = 1024 ) {

		if ( ! Number.isInteger( capacity ) || capacity < 1 ) throw new RangeError( 'Capacity must be a positive integer.' );

		/** @type {number} The maximum sample count. */
		this.capacity = capacity;
		this.textureSampler = new VirtualPointLightTextureSampler();
		/** @type {number} The number of successful hits from the last generation. */
		this.count = 0;
		/** @type {Array<Vector3>} World-space emitter positions. */
		this.positions = Array.from( { length: capacity }, () => new Vector3() );
		/** @type {Array<Vector3>} World-space geometric emitter normals. */
		this.normals = Array.from( { length: capacity }, () => new Vector3() );
		/** @type {Array<Vector3>} Reflected RGB radiant flux, before the emitter's Lambertian factor. */
		this.flux = Array.from( { length: capacity }, () => new Vector3() );

	}

	/**
	 * Regenerate samples after changing geometry, materials or source lights.
	 * Escaped rays retain their share of the source power; misses are not renormalized.
	 *
	 * @param {Scene} scene - The static scene.
	 * @param {Array<PointLight|DirectionalLight>} lights - Source lights.
	 * @param {Object} [options={}] - Sampling options.
	 * @param {number} [options.count=256] - Total ray budget across all lights.
	 * @param {number} [options.seed=1] - Random seed.
	 * @param {Box3} [options.bounds] - World-space sampling domain, required for directional lights.
	 * @return {VirtualPointLightGenerator} This generator.
	 */
	generate( scene, lights, { count = 256, seed = 1, bounds = null } = {} ) {

		if ( ! Number.isInteger( count ) || count < Math.max( 1, lights.length ) || count > this.capacity ) {

			throw new RangeError( 'Sample count must cover all lights and fit the capacity.' );

		}

		if ( lights.some( light => ! light.isDirectionalLight && ( ! light.isPointLight || light.decay !== 2 || light.distance !== 0 ) ) ) {

			throw new Error( 'Virtual point lights require directional lights or inverse-square point lights without a distance cutoff.' );

		}

		if ( lights.some( light => light.isDirectionalLight ) && ( bounds === null || bounds.isEmpty() ) ) {

			throw new Error( 'Directional VPL sampling requires non-empty world-space bounds.' );

		}

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
			const samples = Math.floor( count / lights.length ) + ( l < count % lights.length ? 1 : 0 );
			let power = 4 * Math.PI * light.intensity / samples;
			let minU = Infinity, maxU = - Infinity, minV = Infinity, maxV = - Infinity, minDepth = Infinity;

			if ( light.isDirectionalLight ) {

				light.target.updateWorldMatrix( true, false );
				light.target.getWorldPosition( direction ).sub( origin ).normalize();
				if ( direction.lengthSq() === 0 ) throw new Error( 'Directional light position and target must differ.' );
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

			for ( let i = 0; i < samples; i ++ ) {

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

				const hits = raycaster.intersectObjects( surfaces, false );
				let hit, material;

				for ( const candidate of hits ) {

					const candidateMaterial = Array.isArray( candidate.object.material ) ? candidate.object.material[ candidate.face.materialIndex ] : candidate.object.material;
					let alpha = candidateMaterial.opacity;
					if ( candidateMaterial.alphaTest > 0 ) {

						if ( candidateMaterial.map ) alpha *= this.textureSampler.sample( candidateMaterial.map, candidate ).w;
						if ( candidateMaterial.alphaMap ) alpha *= this.textureSampler.sample( candidateMaterial.alphaMap, candidate ).y;
						if ( alpha <= candidateMaterial.alphaTest ) continue;

					}

					hit = candidate;
					material = candidateMaterial;
					break;

				}

				if ( hit === undefined ) continue;
				albedo.copy( material.color || new Color( 0xffffff ) ).multiply( light.color );
				if ( material.map ) {

					const texel = this.textureSampler.sample( material.map, hit );
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

			}

		}

		return this;

	}

}

export { VirtualPointLightGenerator };
