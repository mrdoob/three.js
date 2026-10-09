import { Color, FloatType, Matrix3, MirroredRepeatWrapping, NearestFilter, Raycaster, RepeatWrapping, SRGBColorSpace, Vector2, Vector3, Vector4 } from 'three';

import { emissiveSources, sampleEmission, luminance } from './VirtualPointLightSources.js';

/** Deterministic diffuse light paths with source-power sampling and optional flux-weighted compression.
 * Static visible meshes, point/directional lights and emissive triangles; no BVH dependency.
 * Instancing, skinning, normal maps and texture mip selection are not evaluated.
 * @three_import import { VirtualPointLightGenerator } from 'three/addons/lighting/VirtualPointLightGenerator.js';
 */
class VirtualPointLightGenerator {

	/** @param {number} [capacity=1024] Maximum GPU emitter count. */
	constructor( capacity = 1024 ) {

		if ( ! Number.isInteger( capacity ) || capacity < 1 ) throw new RangeError( 'Capacity must be a positive integer.' );
		this.capacity = capacity;
		this._textureSampler = new TextureSampler();
		this.count = 0;
		this.rayCount = 0;
		this.candidateCount = 0;
		this.positions = Array.from( { length: capacity }, () => new Vector3() );
		this.normals = Array.from( { length: capacity }, () => new Vector3() );
		this.flux = Array.from( { length: capacity }, () => new Vector3() );

	}

	/** `count` limits the GPU emitter count. `candidateMultiplier` traces additional CPU paths
	 * and compresses their flux into that same GPU budget. Misses retain their share of power.
	 * `bounces` limits diffuse reflections; an emissive surface also contributes its own emission.
	 * @param {Scene} scene
	 * @param {Array<PointLight|DirectionalLight>} lights
	 * @param {Object} [options={}]
	 * @param {number} [options.count=256] Maximum GPU emitter count.
	 * @param {number} [options.seed=1] Reproducible random seed.
	 * @param {?Box3} [options.bounds=null] World sampling bounds, required for directional lights.
	 * @param {number} [options.bounces=1] Maximum diffuse reflections, from 1 to 16.
	 * @param {number} [options.candidateMultiplier=1] CPU ray-budget multiplier, from 1 to 16.
	 * @param {boolean} [options.importanceSampling=true] Allocate paths by source luminance times power.
	 * @param {boolean} [options.emissive=true] Include emission from visible mesh surfaces.
	 * @param {boolean} [options.stratified=true] Stratify initial directions and emitter areas.
	 * @param {boolean} [options.spatialResampling=true] Spatially order candidates before flux resampling.
	 * @return {VirtualPointLightGenerator}
	 */
	generate( scene, lights, { count = 256, seed = 1, bounds = null, bounces = 1, candidateMultiplier = 1, importanceSampling = true, emissive = true, stratified = true, spatialResampling = true } = {} ) {

		if ( ! Number.isInteger( bounces ) || bounces < 1 || bounces > 16 ) throw new RangeError( 'Bounces must be an integer from 1 to 16.' );
		if ( ! Number.isInteger( candidateMultiplier ) || candidateMultiplier < 1 || candidateMultiplier > 16 ) throw new RangeError( 'Candidate multiplier must be an integer from 1 to 16.' );
		if ( ! Number.isInteger( count ) || count < Math.max( 1, lights.length ) * bounces || count > this.capacity ) throw new RangeError( 'Ray budget must cover every light and bounce depth, and fit the capacity.' );
		if ( lights.some( light => ! light.isDirectionalLight && ( ! light.isPointLight || light.decay !== 2 ) ) ) throw new Error( 'Virtual point lights require directional lights or inverse-square point lights.' );
		if ( lights.some( light => light.isDirectionalLight ) && ( bounds === null || bounds.isEmpty() ) ) throw new Error( 'Directional VPL sampling requires non-empty world-space bounds.' );
		scene.updateMatrixWorld( true );
		const surfaces = [];
		scene.traverseVisible( object => {

			if ( object.isMesh ) surfaces.push( object );

		} );
		const sources = [];
		const corner = new Vector3();
		for ( const light of lights ) {

			const origin = light.getWorldPosition( new Vector3() );
			const source = { light, origin, power: 4 * Math.PI * light.intensity, emission: light.color };
			if ( light.isDirectionalLight ) {

				const direction = light.target.getWorldPosition( new Vector3() ).sub( origin ).normalize();
				if ( direction.lengthSq() === 0 ) throw new Error( 'Directional light position and target must differ.' );
				const u = new Vector3( Math.abs( direction.y ) > 0.99 ? 1 : 0, Math.abs( direction.y ) > 0.99 ? 0 : 1, 0 ).cross( direction ).normalize();
				const v = new Vector3().crossVectors( direction, u );
				let minU = Infinity, maxU = - Infinity, minV = Infinity, maxV = - Infinity, minDepth = Infinity;
				for ( let j = 0; j < 8; j ++ ) {

					corner.set( j & 1 ? bounds.max.x : bounds.min.x, j & 2 ? bounds.max.y : bounds.min.y, j & 4 ? bounds.max.z : bounds.min.z );
					minU = Math.min( minU, corner.dot( u ) ); maxU = Math.max( maxU, corner.dot( u ) );
					minV = Math.min( minV, corner.dot( v ) ); maxV = Math.max( maxV, corner.dot( v ) );
					minDepth = Math.min( minDepth, corner.dot( direction ) );

				}

				Object.assign( source, { direction, u, v, minU, maxU, minV, maxV, minDepth } );
				source.power = light.intensity * ( maxU - minU ) * ( maxV - minV );

			}

			source.weight = source.power * luminance( source.emission );
			if ( source.weight > 0 ) sources.push( source );

		}

		if ( emissive ) sources.push( ...emissiveSources( surfaces ) );
		this.count = 0; this.rayCount = 0; this.candidateCount = 0;
		if ( sources.length === 0 ) return this;
		const paths = Math.floor( count * candidateMultiplier / bounces );
		if ( paths < sources.length ) throw new RangeError( 'Ray budget must cover every source, including emissive meshes.' );
		let state = seed >>> 0;
		const random = () => {

			state = state + 0x6D2B79F5 >>> 0;
			let t = Math.imul( state ^ state >>> 15, 1 | state );
			t = t + Math.imul( t ^ t >>> 7, 61 | t ) ^ t;
			return ( ( t ^ t >>> 14 ) >>> 0 ) / 4294967296;

		};

		const weightSum = sources.reduce( ( sum, source ) => sum + ( importanceSampling ? source.weight : 1 ), 0 );
		let allocated = 0;
		const allocations = sources.map( source => {

			const exact = ( paths - sources.length ) * ( importanceSampling ? source.weight : 1 ) / weightSum;
			const samples = 1 + Math.floor( exact );
			allocated += samples;
			return { source, samples, remainder: exact % 1 };

		} );
		const priority = allocations.slice().sort( ( a, b ) => b.remainder - a.remainder );
		for ( let i = 0; i < paths - allocated; i ++ ) priority[ i ].samples ++;
		const candidates = [];
		const record = ( position, normal, flux ) => {

			candidates.push( { position: position.clone(), normal: normal.clone(), flux: flux.clone() } );

		};

		const raycaster = new Raycaster();
		// Native Mesh.raycast ignores this hint. Preserve the existing opaque closest-hit
		// optimization for callers that already installed an accelerated mesh raycaster.
		// Alpha cutouts require considering later intersections.
		raycaster.firstHitOnly = ! surfaces.some( surface => ( Array.isArray( surface.material ) ? surface.material : [ surface.material ] ).some( material => material.alphaTest > 0 ) );
		const normalMatrix = new Matrix3();
		const throughput = new Color(), albedo = new Color();
		const origin = new Vector3(), direction = new Vector3(), u = new Vector3(), v = new Vector3();
		const cosineDirection = normal => {

			const radius = Math.sqrt( random() ), phi = 2 * Math.PI * random();
			u.set( Math.abs( normal.y ) > 0.99 ? 1 : 0, Math.abs( normal.y ) > 0.99 ? 0 : 1, 0 ).cross( normal ).normalize();
			v.crossVectors( normal, u );
			direction.copy( normal ).multiplyScalar( Math.sqrt( 1 - radius * radius ) ).addScaledVector( u, radius * Math.cos( phi ) ).addScaledVector( v, radius * Math.sin( phi ) );

		};

		for ( const { source, samples } of allocations ) {

			const shift = random(), azimuth = random();
			const power = source.power / samples;
			for ( let i = 0; i < samples; i ++ ) {

				throughput.copy( source.emission );
				if ( source.mesh ) {

					const sample = sampleEmission( source, stratified ? ( i + shift ) / samples : random(), random, this._textureSampler );
					throughput.copy( sample.emission );
					if ( luminance( throughput ) === 0 ) continue;
					record( sample.position, sample.normal, new Vector3( throughput.r, throughput.g, throughput.b ).multiplyScalar( power ) );
					cosineDirection( sample.normal );
					origin.copy( sample.position ).addScaledVector( sample.normal, 0.001 );

				} else if ( source.direction ) {

					direction.copy( source.direction );
					origin.copy( direction ).multiplyScalar( source.minDepth - 0.01 );
					origin.addScaledVector( source.u, source.minU + ( stratified ? ( i + shift ) / samples : random() ) * ( source.maxU - source.minU ) );
					origin.addScaledVector( source.v, source.minV + ( stratified ? ( i * 0.61803398875 + azimuth ) % 1 : random() ) * ( source.maxV - source.minV ) );

				} else {

					origin.copy( source.origin );
					const z = ( stratified ? ( i + shift ) / samples : random() ) * 2 - 1;
					const phi = 2 * Math.PI * ( stratified ? ( i * 0.61803398875 + azimuth ) % 1 : random() );
					const r = Math.sqrt( 1 - z * z );
					direction.set( r * Math.cos( phi ), z, r * Math.sin( phi ) );

				}

				for ( let depth = 0; depth < bounces; depth ++ ) {

					raycaster.set( origin, direction );
					this.rayCount ++;
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

						hit = candidate; material = candidateMaterial; break;

					}

					if ( ! hit ) break;
					albedo.copy( material.color || new Color( 0xffffff ) ).multiply( throughput );
					if ( material.map ) {

						const texel = this._textureSampler.sample( material.map, hit );
						albedo.r *= texel.x; albedo.g *= texel.y; albedo.b *= texel.z;

					}

					if ( depth === 0 && source.light?.isPointLight && source.light.distance > 0 ) albedo.multiplyScalar( Math.pow( Math.max( 0, 1 - Math.pow( hit.distance / source.light.distance, 4 ) ), 2 ) );
					albedo.multiplyScalar( 1 - ( material.metalness || 0 ) );
					normalMatrix.getNormalMatrix( hit.object.matrixWorld );
					const normal = hit.face.normal.clone().applyNormalMatrix( normalMatrix );
					if ( normal.dot( direction ) > 0 ) normal.negate();
					record( hit.point, normal, new Vector3( albedo.r, albedo.g, albedo.b ).multiplyScalar( power ) );
					throughput.copy( albedo );
					if ( depth + 1 === bounces || luminance( throughput ) === 0 ) break;
					cosineDirection( normal );
					origin.copy( hit.point ).addScaledVector( normal, 0.001 );

				}

			}

		}

		this.candidateCount = candidates.length;
		if ( candidates.length <= count ) {

			for ( const candidate of candidates ) this.store( this.count ++, candidate, 1 );

		} else {

			// Spatial ordering makes systematic importance samples cover the source
			// surfaces instead of following correlated vertices along each path.
			if ( spatialResampling ) {

				const lower = new Vector3( Infinity, Infinity, Infinity ), upper = new Vector3( - Infinity, - Infinity, - Infinity );
				for ( const candidate of candidates ) {

					lower.min( candidate.position ); upper.max( candidate.position );

				}

				const size = upper.sub( lower ).max( new Vector3( 1e-6, 1e-6, 1e-6 ) );
				const spread = value => {

					let bits = Math.min( 1023, Math.max( 0, Math.floor( value * 1024 ) ) );
					bits = ( bits | bits << 16 ) & 0x030000FF;
					bits = ( bits | bits << 8 ) & 0x0300F00F;
					bits = ( bits | bits << 4 ) & 0x030C30C3;
					return ( bits | bits << 2 ) & 0x09249249;

				};

				for ( const candidate of candidates ) {

					const p = candidate.position.clone().sub( lower ).divide( size );
					candidate.order = spread( p.x ) + 2 * spread( p.y ) + 4 * spread( p.z );

				}

				candidates.sort( ( a, b ) => a.order - b.order );

			}

			// Stratified flux importance resampling: E[sum selected flux] = sum candidate flux.
			// No PDF depends on visibility, so shadowing remains unbiased apart from the maps.
			let total = 0;
			const cumulative = candidates.map( candidate => {

				total += 0.2126 * candidate.flux.x + 0.7152 * candidate.flux.y + 0.0722 * candidate.flux.z;
				return total;

			} );
			if ( total > 0 ) {

				const offset = random();
				let selected = 0;
				for ( let i = 0; i < count; i ++ ) {

					const target = ( i + offset ) * total / count;
					while ( selected < cumulative.length - 1 && cumulative[ selected ] <= target ) selected ++;
					const weight = cumulative[ selected ] - ( selected === 0 ? 0 : cumulative[ selected - 1 ] );
					this.store( this.count ++, candidates[ selected ], total / ( count * weight ) );

				}

			}

		}

		return this;

	}

	store( index, candidate, weight ) {

		this.positions[ index ].copy( candidate.position );
		this.normals[ index ].copy( candidate.normal );
		this.flux[ index ].copy( candidate.flux ).multiplyScalar( weight );

	}

}

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
