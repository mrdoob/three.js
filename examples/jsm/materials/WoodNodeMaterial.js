import * as THREE from 'three';
import * as TSL from 'three/tsl';

// some helpers below are ported from Blender and converted to TSL

const mapRange = TSL.Fn( ( [ x, fromMin, fromMax, toMin, toMax, clmp ] ) => {

	const factor = x.sub( fromMin ).div( fromMax.sub( fromMin ) );
	const result = toMin.add( factor.mul( toMax.sub( toMin ) ) );

	return TSL.select( clmp, TSL.max( TSL.min( result, toMax ), toMin ), result );

} );

const voronoi3d = TSL.wgslFn( `
    fn voronoi3d(x: vec3<f32>, smoothness: f32, randomness: f32) -> f32
    {
        let p = floor(x);
        let f = fract(x);

        var res = 0.0;
        var totalWeight = 0.0;
        
        for (var k = -1; k <= 1; k++)
        {
            for (var j = -1; j <= 1; j++)
            {
                for (var i = -1; i <= 1; i++)
                {
                    let b = vec3<f32>(f32(i), f32(j), f32(k));
                    let hashOffset = hash3d(p + b) * randomness;
                    let r = b - f + hashOffset;
                    let d = length(r);
                    
                    let weight = exp(-d * d / max(smoothness * smoothness, 0.001));
                    res += d * weight;
                    totalWeight += weight;
                }
            }
        }
        
        if (totalWeight > 0.0)
        {
            res /= totalWeight;
        }
        
        return smoothstep(0.0, 1.0, res);
    }

    fn hash3d(p: vec3<f32>) -> vec3<f32>
    {
        var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xxy + p3.yzz) * p3.zyx);
    }
` );

// const hash3d = TSL.Fn( ( [ p ] ) => {

// 	const p3 = p.mul( TSL.vec3( 0.1031, 0.1030, 0.0973 ) ).fract();
// 	const dotProduct = p3.dot( p3.yzx.add( 33.33 ) );
// 	p3.addAssign( dotProduct );

// 	return p3.xxy.add( p3.yzz ).mul( p3.zyx ).fract();

// } );

// const voronoi3d = TSL.Fn( ( [ x, smoothness, randomness ] ) => {
// 	let p = TSL.floor(x);
// 	let f = TSL.fract(x);

// 	var res = TSL.float(0.0);
// 	var totalWeight = TSL.float(0.0);

// 	TSL.Loop( 3, 3, 3, ( { k, j, i } ) => {
// 		let b = TSL.vec3(TSL.float(i).sub(1), TSL.float(j).sub(1), TSL.float(k).sub(1));
// 		let hashOffset = hash3d(p.add(b)).mul(randomness);
// 		let r = b.sub(f).add(hashOffset);
// 		let d = TSL.length(r);

// 		let weight = TSL.exp(d.negate().mul(d).div(TSL.max(smoothness.mul(smoothness), 0.001)));
// 		res.addAssign(d.mul(weight));
// 		totalWeight.addAssign(weight);
// 	} );

// 	res.assign(TSL.select(totalWeight.greaterThan(0.0), res.div(totalWeight), res));

// 	return TSL.smoothstep(0.0, 1.0, res);
// } );

const softLightMix = TSL.Fn( ( [ t, col1, col2 ] ) => {

	const tm = TSL.float( 1.0 ).sub( t );

	const one = TSL.vec3( 1.0 );
	const scr = one.sub( one.sub( col2 ).mul( one.sub( col1 ) ) );

	return tm.mul( col1 ).add( t.mul( one.sub( col1 ).mul( col2 ).mul( col1 ).add( col1.mul( scr ) ) ) );

} );

const noiseFbm = TSL.Fn( ( [ p, detail, roughness, lacunarity, useNormalize ] ) => {

	const fscale = TSL.float( 1.0 ).toVar();
	const amp = TSL.float( 1.0 ).toVar();
	const maxamp = TSL.float( 0.0 ).toVar();
	const sum = TSL.float( 0.0 ).toVar();

	const iterations = detail.floor();

	TSL.Loop( iterations, () => {

		const t = TSL.mx_noise_float( p.mul( fscale ) );
		sum.addAssign( t.mul( amp ) );
		maxamp.addAssign( amp );
		amp.mulAssign( roughness );
		fscale.mulAssign( lacunarity );

	} );

	const rmd = detail.sub( iterations );
	const hasRemainder = rmd.greaterThan( 0.001 );

	return TSL.select(
		hasRemainder,
		TSL.select(
			useNormalize.equal( 1 ),
			( () => {

				const t = TSL.mx_noise_float( p.mul( fscale ) );
				const sum2 = sum.add( t.mul( amp ) );
				const maxamp2 = maxamp.add( amp );
				const normalizedSum = sum.div( maxamp ).mul( 0.5 ).add( 0.5 );
				const normalizedSum2 = sum2.div( maxamp2 ).mul( 0.5 ).add( 0.5 );
				return TSL.mix( normalizedSum, normalizedSum2, rmd );

			} )(),
			( () => {

				const t = TSL.mx_noise_float( p.mul( fscale ) );
				const sum2 = sum.add( t.mul( amp ) );
				return TSL.mix( sum, sum2, rmd );

			} )()
		),
		TSL.select(
			useNormalize.equal( 1 ),
			sum.div( maxamp ).mul( 0.5 ).add( 0.5 ),
			sum
		)
	);

} );

const noiseFbm3d = TSL.Fn( ( [ p, detail, roughness, lacunarity, useNormalize ] ) => {

	const fscale = TSL.float( 1.0 ).toVar();

	const amp = TSL.float( 1.0 ).toVar();
	const maxamp = TSL.float( 0.0 ).toVar();
	const sum = TSL.vec3( 0.0 ).toVar();

	const iterations = detail.floor();

	TSL.Loop( iterations, () => {

		const t = TSL.mx_noise_vec3( p.mul( fscale ) );
		sum.addAssign( t.mul( amp ) );
		maxamp.addAssign( amp );
		amp.mulAssign( roughness );
		fscale.mulAssign( lacunarity );

	} );

	const rmd = detail.sub( iterations );
	const hasRemainder = rmd.greaterThan( 0.001 );

	return TSL.select(
		hasRemainder,
		TSL.select(
			useNormalize.equal( 1 ),
			( () => {

				const t = TSL.mx_noise_vec3( p.mul( fscale ) );
				const sum2 = sum.add( t.mul( amp ) );
				const maxamp2 = maxamp.add( amp );
				const normalizedSum = sum.div( maxamp ).mul( 0.5 ).add( 0.5 );
				const normalizedSum2 = sum2.div( maxamp2 ).mul( 0.5 ).add( 0.5 );
				return TSL.mix( normalizedSum, normalizedSum2, rmd );

			} )(),
			( () => {

				const t = TSL.mx_noise_vec3( p.mul( fscale ) );
				const sum2 = sum.add( t.mul( amp ) );
				return TSL.mix( sum, sum2, rmd );

			} )()
		),
		TSL.select(
			useNormalize.equal( 1 ),
			sum.div( maxamp ).mul( 0.5 ).add( 0.5 ),
			sum
		)
	);

} );

const woodCenter = TSL.Fn( ( [ p, centerSize ] ) => {

	const pxyCenter = p.mul( TSL.vec3( 1, 1, 0 ) ).length();
	const center = mapRange( pxyCenter, 0, 1, 0, centerSize, true );

	return center;

} );

const spaceWarp = TSL.Fn( ( [ p, warpStrength, xyScale, zScale ] ) => {

	const combinedXyz = TSL.vec3( xyScale, xyScale, zScale ).mul( p );
	const noise = noiseFbm3d( combinedXyz.mul( 1.6 * 1.5 ), TSL.float( 1 ), TSL.float( 0.5 ), TSL.float( 2 ), TSL.int( 1 ) ).sub( 0.5 ).mul( warpStrength );
	const pXy = p.mul( TSL.vec3( 1, 1, 0 ) );
	const normalizedXy = pXy.normalize();
	const warp = noise.mul( normalizedXy ).add( pXy );

	return warp;

} );

const woodRings = TSL.Fn( ( [ w, ringThickness, ringBias, ringSizeVariance, ringVarianceScale, barkThickness ] ) => {

	const rings = noiseFbm( w.mul( ringVarianceScale ), TSL.float( 1 ), TSL.float( 0.5 ), TSL.float( 1 ), TSL.int( 1 ) ).mul( ringSizeVariance ).add( w ).mul( ringThickness ).fract().mul( barkThickness );

	const sharpRings = TSL.min( mapRange( rings, 0, ringBias, 0, 1, TSL.bool( true ) ), mapRange( rings, ringBias, 1, 1, 0, TSL.bool( true ) ) );

	const blurAmount = TSL.max( TSL.positionView.length().div( 10 ), 1 );
	const blurredRings = TSL.smoothstep( blurAmount.negate(), blurAmount, sharpRings.sub( 0.5 ) ).mul( 0.5 ).add( 0.5 );

	return blurredRings;

} );

const woodDetail = TSL.Fn( ( [ warp, p, y, splotchScale ] ) => {

	const radialCoords = TSL.clamp( TSL.atan( warp.y, warp.x ).div( TSL.PI2 ).add( 0.5 ), 0, 1 ).mul( TSL.PI2.mul( 3 ) );
	const combinedXyz = TSL.vec3( radialCoords.sin(), y, radialCoords.cos().mul( p.z ) );
	const scaled = TSL.vec3( 0.1, 1.19, 0.05 ).mul( combinedXyz );

	return noiseFbm( scaled.mul( splotchScale ), TSL.float( 1 ), TSL.float( 0.5 ), TSL.float( 2 ), TSL.bool( true ) );

} );

const cellStructure = TSL.Fn( ( [ p, cellScale, cellSize ] ) => {

	const warp = spaceWarp( p.mul( cellScale.div( 50 ) ), cellScale.div( 1000 ), 0.1, 1.77 );
	const cells = voronoi3d( warp.xy.mul( 75 ), 0.5, 1 );

	return mapRange( cells, cellSize, cellSize.add( 0.21 ), 0, 1, TSL.bool( true ) );

} );

const wood = TSL.Fn( ( [
	p,
	centerSize,
	largeWarpScale,
	largeGrainStretch,
	smallWarpStrength,
	smallWarpScale,
	fineWarpStrength,
	fineWarpScale,
	ringThickness,
	ringBias,
	ringSizeVariance,
	ringVarianceScale,
	barkThickness,
	splotchScale,
	splotchIntensity,
	cellScale,
	cellSize,
	darkGrainColor,
	lightGrainColor
] ) => {

	const center = woodCenter( p, centerSize );
	const mainWarp = spaceWarp( spaceWarp( p, center, largeWarpScale, largeGrainStretch ), smallWarpStrength, smallWarpScale, 0.17 );
	const detailWarp = spaceWarp( mainWarp, fineWarpStrength, fineWarpScale, 0.17 );
	const rings = woodRings( detailWarp.length(), TSL.float( 1 ).div( ringThickness ), ringBias, ringSizeVariance, ringVarianceScale, barkThickness );
	const detail = woodDetail( detailWarp, p, detailWarp.length(), splotchScale );
	const cells = cellStructure( mainWarp, cellScale, cellSize.div( TSL.max( TSL.positionView.length().mul( 10 ), 1 ) ) );
	const baseColor = TSL.mix( darkGrainColor, lightGrainColor, rings );

	return softLightMix( splotchIntensity, softLightMix( 0.407, baseColor, cells ), detail );

} );

const woodParams = {
	teak: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.11, largeWarpScale: 0.32, largeGrainStretch: 0.24, smallWarpStrength: 0.059,
		smallWarpScale: 2, fineWarpStrength: 0.006, fineWarpScale: 32.8, ringThickness: 1 / 34,
		ringBias: 0.03, ringSizeVariance: 0.03, ringVarianceScale: 4.4, barkThickness: 0.3,
		splotchScale: 0.2, splotchIntensity: 0.541, cellScale: 910, cellSize: 0.1,
		darkGrainColor: '#0c0504', lightGrainColor: '#926c50'
	},
	walnut: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.07, largeWarpScale: 0.42, largeGrainStretch: 0.34, smallWarpStrength: 0.016,
		smallWarpScale: 10.3, fineWarpStrength: 0.028, fineWarpScale: 12.7, ringThickness: 1 / 32,
		ringBias: 0.08, ringSizeVariance: 0.03, ringVarianceScale: 5.5, barkThickness: 0.98,
		splotchScale: 1.84, splotchIntensity: 0.97, cellScale: 710, cellSize: 0.31,
		darkGrainColor: '#311e13', lightGrainColor: '#523424'
	},
	white_oak: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.23, largeWarpScale: 0.21, largeGrainStretch: 0.21, smallWarpStrength: 0.034,
		smallWarpScale: 2.44, fineWarpStrength: 0.01, fineWarpScale: 14.3, ringThickness: 1 / 34,
		ringBias: 0.82, ringSizeVariance: 0.16, ringVarianceScale: 1.4, barkThickness: 0.7,
		splotchScale: 0.2, splotchIntensity: 0.541, cellScale: 800, cellSize: 0.28,
		darkGrainColor: '#8b4c21', lightGrainColor: '#c57e43'
	},
	pine: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.23, largeWarpScale: 0.21, largeGrainStretch: 0.18, smallWarpStrength: 0.041,
		smallWarpScale: 2.44, fineWarpStrength: 0.006, fineWarpScale: 23.2, ringThickness: 1 / 24,
		ringBias: 0.1, ringSizeVariance: 0.07, ringVarianceScale: 5, barkThickness: 0.35,
		splotchScale: 0.51, splotchIntensity: 3.32, cellScale: 1480, cellSize: 0.07,
		darkGrainColor: '#c58355', lightGrainColor: '#d19d61'
	},
	poplar: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.43, largeWarpScale: 0.33, largeGrainStretch: 0.18, smallWarpStrength: 0.04,
		smallWarpScale: 4.3, fineWarpStrength: 0.004, fineWarpScale: 33.6, ringThickness: 1 / 37,
		ringBias: 0.07, ringSizeVariance: 0.03, ringVarianceScale: 3.8, barkThickness: 0.3,
		splotchScale: 1.92, splotchIntensity: 0.71, cellScale: 830, cellSize: 0.04,
		darkGrainColor: '#716347', lightGrainColor: '#998966'
	},
	maple: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.4, largeWarpScale: 0.38, largeGrainStretch: 0.25, smallWarpStrength: 0.067,
		smallWarpScale: 2.5, fineWarpStrength: 0.005, fineWarpScale: 33.6, ringThickness: 1 / 35,
		ringBias: 0.1, ringSizeVariance: 0.07, ringVarianceScale: 4.6, barkThickness: 0.61,
		splotchScale: 0.46, splotchIntensity: 1.49, cellScale: 800, cellSize: 0.03,
		darkGrainColor: '#b08969', lightGrainColor: '#bc9d7d'
	},
	red_oak: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.21, largeWarpScale: 0.24, largeGrainStretch: 0.25, smallWarpStrength: 0.044,
		smallWarpScale: 2.54, fineWarpStrength: 0.01, fineWarpScale: 14.5, ringThickness: 1 / 34,
		ringBias: 0.92, ringSizeVariance: 0.03, ringVarianceScale: 5.6, barkThickness: 1.01,
		splotchScale: 0.28, splotchIntensity: 3.48, cellScale: 800, cellSize: 0.25,
		darkGrainColor: '#af613b', lightGrainColor: '#e0a27a'
	},
	cherry: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.33, largeWarpScale: 0.11, largeGrainStretch: 0.33, smallWarpStrength: 0.024,
		smallWarpScale: 2.48, fineWarpStrength: 0.01, fineWarpScale: 15.3, ringThickness: 1 / 36,
		ringBias: 0.02, ringSizeVariance: 0.04, ringVarianceScale: 6.5, barkThickness: 0.09,
		splotchScale: 1.27, splotchIntensity: 1.24, cellScale: 1530, cellSize: 0.15,
		darkGrainColor: '#913f27', lightGrainColor: '#b45837'
	},
	cedar: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.11, largeWarpScale: 0.39, largeGrainStretch: 0.12, smallWarpStrength: 0.061,
		smallWarpScale: 1.9, fineWarpStrength: 0.006, fineWarpScale: 4.8, ringThickness: 1 / 25,
		ringBias: 0.01, ringSizeVariance: 0.07, ringVarianceScale: 6.7, barkThickness: 0.1,
		splotchScale: 0.61, splotchIntensity: 2.54, cellScale: 630, cellSize: 0.19,
		darkGrainColor: '#9a5b49', lightGrainColor: '#ae745e'
	},
	mahogany: {
		transformationMatrix: new THREE.Matrix4().identity(),
		centerSize: 1.25, largeWarpScale: 0.26, largeGrainStretch: 0.29, smallWarpStrength: 0.044,
		smallWarpScale: 2.54, fineWarpStrength: 0.01, fineWarpScale: 15.3, ringThickness: 1 / 38,
		ringBias: 0.01, ringSizeVariance: 0.33, ringVarianceScale: 1.2, barkThickness: 0.07,
		splotchScale: 0.77, splotchIntensity: 1.39, cellScale: 1400, cellSize: 0.23,
		darkGrainColor: '#501d12', lightGrainColor: '#6d3722'
	}
};

export const WoodGenuses = [ 'teak', 'walnut', 'white_oak', 'pine', 'poplar', 'maple', 'red_oak', 'cherry', 'cedar', 'mahogany' ];
export const Finishes = [ 'raw', 'matte', 'semigloss', 'gloss' ];

export function GetWoodPreset( genus, finish ) {

	const params = woodParams[ genus ];

	let clearcoat, clearcoatRoughness, clearcoatDarken;

	switch ( finish ) {

		case 'gloss':
			clearcoatDarken = 0.2; clearcoatRoughness = 0.1; clearcoat = 1;
			break;

		case 'semigloss':
			clearcoatDarken = 0.4; clearcoatRoughness = 0.4; clearcoat = 1;
			break;

		case 'matte':
			clearcoatDarken = 0.6; clearcoatRoughness = 1; clearcoat = 1;
			break;

		case 'raw':
		default:
			clearcoatDarken = 1; clearcoatRoughness = 0; clearcoat = 0;

	}

	return { ...params, transformationMatrix: new THREE.Matrix4().copy( params.transformationMatrix ), genus, finish, clearcoat, clearcoatRoughness, clearcoatDarken };

}

const params = GetWoodPreset( WoodGenuses[ 0 ], Finishes[ 0 ] );
const uniforms = {};

uniforms.centerSize = TSL.uniform( params.centerSize ).onObjectUpdate( ( { material } ) => material.centerSize );
uniforms.largeWarpScale = TSL.uniform( params.largeWarpScale ).onObjectUpdate( ( { material } ) => material.largeWarpScale );
uniforms.largeGrainStretch = TSL.uniform( params.largeGrainStretch ).onObjectUpdate( ( { material } ) => material.largeGrainStretch );
uniforms.smallWarpStrength = TSL.uniform( params.smallWarpStrength ).onObjectUpdate( ( { material } ) => material.smallWarpStrength );
uniforms.smallWarpScale = TSL.uniform( params.smallWarpScale ).onObjectUpdate( ( { material } ) => material.smallWarpScale );
uniforms.fineWarpStrength = TSL.uniform( params.fineWarpStrength ).onObjectUpdate( ( { material } ) => material.fineWarpStrength );
uniforms.fineWarpScale = TSL.uniform( params.fineWarpScale ).onObjectUpdate( ( { material } ) => material.fineWarpScale );
uniforms.ringThickness = TSL.uniform( params.ringThickness ).onObjectUpdate( ( { material } ) => material.ringThickness );
uniforms.ringBias = TSL.uniform( params.ringBias ).onObjectUpdate( ( { material } ) => material.ringBias );
uniforms.ringSizeVariance = TSL.uniform( params.ringSizeVariance ).onObjectUpdate( ( { material } ) => material.ringSizeVariance );
uniforms.ringVarianceScale = TSL.uniform( params.ringVarianceScale ).onObjectUpdate( ( { material } ) => material.ringVarianceScale );
uniforms.barkThickness = TSL.uniform( params.barkThickness ).onObjectUpdate( ( { material } ) => material.barkThickness );
uniforms.splotchScale = TSL.uniform( params.splotchScale ).onObjectUpdate( ( { material } ) => material.splotchScale );
uniforms.splotchIntensity = TSL.uniform( params.splotchIntensity ).onObjectUpdate( ( { material } ) => material.splotchIntensity );
uniforms.cellScale = TSL.uniform( params.cellScale ).onObjectUpdate( ( { material } ) => material.cellScale );
uniforms.cellSize = TSL.uniform( params.cellSize ).onObjectUpdate( ( { material } ) => material.cellSize );
uniforms.darkGrainColor = TSL.uniform( new THREE.Color( params.darkGrainColor ) ).onObjectUpdate( ( { material }, self ) => self.value.set( material.darkGrainColor ) );
uniforms.lightGrainColor = TSL.uniform( new THREE.Color( params.lightGrainColor ) ).onObjectUpdate( ( { material }, self ) => self.value.set( material.lightGrainColor ) );
uniforms.transformationMatrix = TSL.uniform( new THREE.Matrix4().copy( params.transformationMatrix ) ).onObjectUpdate( ( { material } ) => material.transformationMatrix );

const colorNode = wood(
	uniforms.transformationMatrix.mul( TSL.vec4( TSL.positionLocal, 1 ) ).xyz,
	uniforms.centerSize,
	uniforms.largeWarpScale,
	uniforms.largeGrainStretch,
	uniforms.smallWarpStrength,
	uniforms.smallWarpScale,
	uniforms.fineWarpStrength,
	uniforms.fineWarpScale,
	uniforms.ringThickness,
	uniforms.ringBias,
	uniforms.ringSizeVariance,
	uniforms.ringVarianceScale,
	uniforms.barkThickness,
	uniforms.splotchScale,
	uniforms.splotchIntensity,
	uniforms.cellScale,
	uniforms.cellSize,
	uniforms.darkGrainColor,
	uniforms.lightGrainColor
).mul( params.clearcoatDarken );

/**
 * Procedural wood material using TSL (Three.js Shading Language).
 *
 * Usage examples:
 *
 * // Using presets (recommended for common wood types)
 * const material = WoodNodeMaterial.fromPreset('walnut', 'gloss');
 *
 * // Using custom parameters (for advanced customization)
 * const material = new WoodNodeMaterial({
 *   centerSize: 1.2,
 *   ringThickness: 1/40,
 *   darkGrainColor: new THREE.Color('#2a1a0a'),
 *   lightGrainColor: new THREE.Color('#8b4513'),
 *   clearcoat: 1,
 *   clearcoatRoughness: 0.3
 * });
 *
 * // Mixing presets with custom overrides
 * const walnutParams = GetWoodPreset('walnut', 'raw');
 * const material = new WoodNodeMaterial({
 *   ...walnutParams,
 *   ringThickness: 1/50,  // Override specific parameter
 *   clearcoat: 1    // Add finish
 * });
 */
export class WoodNodeMaterial extends THREE.MeshPhysicalMaterial {

	static get type() {

		return 'WoodNodeMaterial';

	}

	constructor( params = {} ) {

		super();

		this.isWoodNodeMaterial = true;

		// Get default parameters from teak/raw preset
		const defaultParams = GetWoodPreset( 'teak', 'raw' );

		// Merge default params with provided params
		const finalParams = { ...defaultParams, ...params };

		for ( const key in finalParams ) {

			if ( key === 'genus' || key === 'finish' ) continue;

			if ( typeof finalParams[ key ] === 'string' ) {

				this[ key ] = new THREE.Color( finalParams[ key ] );

			} else {

				this[ key ] = finalParams[ key ];

			}

		}

		this.colorNode = colorNode;
		this.clearcoatNode = finalParams.clearcoat;
		this.clearcoatRoughness = finalParams.clearcoatRoughness;

	}

	// Static method to create material from preset
	static fromPreset( genus = 'teak', finish = 'raw' ) {

		const params = GetWoodPreset( genus, finish );
		return new WoodNodeMaterial( params );

	}

}
