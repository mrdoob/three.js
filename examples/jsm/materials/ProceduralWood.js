import * as THREE from 'three';
import * as TSL from 'three/tsl';

// some helpers below are ported from Blender
const mapRange = TSL.wgslFn( `
    fn map_range(x: f32, fromMin: f32, fromMax: f32, toMin: f32, toMax: f32, clmp: bool) -> f32
    {
        let factor = (x - fromMin) / (fromMax - fromMin);
        var result = toMin + factor * (toMax - toMin);

        if (clmp && toMin < toMax)
        {
            result = clamp(result, toMin, toMax);
        }
        else if (clmp && toMin > toMax)
        {
            result = clamp(result, toMax, toMin);
        }

        return result;
    }
` );

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

const softLightMix = TSL.wgslFn( `
    fn node_mix_soft(t: f32, col1: vec3<f32>, col2: vec3<f32>) -> vec3<f32>
    {
        let tm = 1.0 - t;

        let one = vec3<f32>(1.0);
        let scr = one - (one - col2) * (one - col1);

        return tm * col1 + t * ((one - col1) * col2 * col1 + col1 * scr);
    }
` );

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

const woodRings = TSL.Fn( ( [ w, ringCount, ringBias, ringSizeVariance, ringVarianceScale, barkThickness ] ) => {

	const rings = noiseFbm( w.mul( ringVarianceScale ), TSL.float( 1 ), TSL.float( 0.5 ), TSL.float( 1 ), TSL.int( 1 ) ).mul( ringSizeVariance ).add( w ).mul( ringCount ).fract().mul( barkThickness );

	const sharpRings = TSL.min( mapRange( rings, 0, ringBias, 0, 1, TSL.bool( true ) ), mapRange( rings, ringBias, 1, 1, 0, TSL.bool( true ) ) );

	const blurAmount = TSL.max(TSL.positionView.length().div(10), 1);
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
	ringCount,
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
	const rings = woodRings( detailWarp.length(), ringCount, ringBias, ringSizeVariance, ringVarianceScale, barkThickness );
	const detail = woodDetail( detailWarp, p, detailWarp.length(), splotchScale );
	const cells = cellStructure( mainWarp, cellScale, cellSize.div(TSL.max(TSL.positionView.length().mul(10), 1)) );
	const baseColor = TSL.mix( darkGrainColor, lightGrainColor, rings );

	return softLightMix( splotchIntensity, softLightMix( 0.407, baseColor, cells ), detail );

} );

const woodParams = {
	teak: {
        originOffset: { x: -0.4, y: 0, z: 0 },
		centerSize: 1.11, largeWarpScale: 0.32, largeGrainStretch: 0.24, smallWarpStrength: 0.059,
		smallWarpScale: 2, fineWarpStrength: 0.006, fineWarpScale: 32.8, ringCount: 34,
		ringBias: 0.59, ringSizeVariance: 0.16, ringVarianceScale: 1.4, barkThickness: 0.61,
		splotchScale: 0.2, splotchIntensity: 0.541, cellScale: 910, cellSize: 0.1,
		darkGrainColor: '#0c0504', lightGrainColor: '#533319'
	},
	walnut: {
        originOffset: { x: -0.4, y: 0, z: 0 },
		centerSize: 1.07, largeWarpScale: 0.42, largeGrainStretch: 0.34, smallWarpStrength: 0.016,
		smallWarpScale: 10.3, fineWarpStrength: 0.028, fineWarpScale: 12.7, ringCount: 32,
		ringBias: 0.08, ringSizeVariance: 0.03, ringVarianceScale: 5.5, barkThickness: 0.98,
		splotchScale: 1.84, splotchIntensity: 0.97, cellScale: 710, cellSize: 0.31,
		darkGrainColor: '#311e13', lightGrainColor: '#523424'
	},
	white_oak: {
        originOffset: { x: -0.4, y: 0, z: 0 },
		centerSize: 1.23, largeWarpScale: 0.21, largeGrainStretch: 0.21, smallWarpStrength: 0.034,
		smallWarpScale: 2.44, fineWarpStrength: 0.01, fineWarpScale: 14.3, ringCount: 34,
		ringBias: 0.82, ringSizeVariance: 0.16, ringVarianceScale: 1.4, barkThickness: 0.7,
		splotchScale: 0.2, splotchIntensity: 0.541, cellScale: 800, cellSize: 0.28,
		darkGrainColor: '#8b4c21', lightGrainColor: '#c57e43'
	},
	pine: {
        originOffset: { x: -0.4, y: 0, z: -0.2 },
		centerSize: 1.23, largeWarpScale: 0.21, largeGrainStretch: 0.18, smallWarpStrength: 0.041,
		smallWarpScale: 2.44, fineWarpStrength: 0.006, fineWarpScale: 23.2, ringCount: 24,
		ringBias: 0.1, ringSizeVariance: 0.07, ringVarianceScale: 5, barkThickness: 0.35,
		splotchScale: 0.51, splotchIntensity: 3.32, cellScale: 1480, cellSize: 0.07,
		darkGrainColor: '#c58355', lightGrainColor: '#d19d61'
	},
	poplar: {
        originOffset: { x: -0.4, y: 0, z: 0.2 },
		centerSize: 1.43, largeWarpScale: 0.33, largeGrainStretch: 0.18, smallWarpStrength: 0.04,
		smallWarpScale: 4.3, fineWarpStrength: 0.004, fineWarpScale: 33.6, ringCount: 37,
		ringBias: 0.07, ringSizeVariance: 0.03, ringVarianceScale: 3.8, barkThickness: 0.3,
		splotchScale: 1.92, splotchIntensity: 0.71, cellScale: 830, cellSize: 0.04,
		darkGrainColor: '#716347', lightGrainColor: '#998966'
	},
	maple: {
        originOffset: { x: -0.4, y: 0.3, z: -0.2 },
		centerSize: 1.4, largeWarpScale: 0.38, largeGrainStretch: 0.25, smallWarpStrength: 0.067,
		smallWarpScale: 2.5, fineWarpStrength: 0.005, fineWarpScale: 33.6, ringCount: 35,
		ringBias: 0.1, ringSizeVariance: 0.07, ringVarianceScale: 4.6, barkThickness: 0.61,
		splotchScale: 0.46, splotchIntensity: 1.49, cellScale: 800, cellSize: 0.03,
		darkGrainColor: '#b08969', lightGrainColor: '#bc9d7d'
	},
	red_oak: {
        originOffset: { x: -0.4, y: 0, z: 0.4 },
		centerSize: 1.21, largeWarpScale: 0.24, largeGrainStretch: 0.25, smallWarpStrength: 0.044,
		smallWarpScale: 2.54, fineWarpStrength: 0.01, fineWarpScale: 14.5, ringCount: 34,
		ringBias: 0.92, ringSizeVariance: 0.03, ringVarianceScale: 5.6, barkThickness: 1.01,
		splotchScale: 0.28, splotchIntensity: 3.48, cellScale: 800, cellSize: 0.25,
		darkGrainColor: '#af613b', lightGrainColor: '#e0a27a'
	},
	cherry: {
        originOffset: { x: -0.4, y: 0.3, z: 0 },
		centerSize: 1.33, largeWarpScale: 0.11, largeGrainStretch: 0.33, smallWarpStrength: 0.024,
		smallWarpScale: 2.48, fineWarpStrength: 0.01, fineWarpScale: 15.3, ringCount: 36,
		ringBias: 0.02, ringSizeVariance: 0.04, ringVarianceScale: 6.5, barkThickness: 0.09,
		splotchScale: 1.27, splotchIntensity: 1.24, cellScale: 1530, cellSize: 0.15,
		darkGrainColor: '#913f27', lightGrainColor: '#b45837'
	},
	cedar: {
        originOffset: { x: -0.4, y: 0.1, z: 0.1 },
		centerSize: 1.11, largeWarpScale: 0.39, largeGrainStretch: 0.12, smallWarpStrength: 0.061,
		smallWarpScale: 1.9, fineWarpStrength: 0.006, fineWarpScale: 4.8, ringCount: 25,
		ringBias: 0.01, ringSizeVariance: 0.07, ringVarianceScale: 6.7, barkThickness: 0.1,
		splotchScale: 0.61, splotchIntensity: 2.54, cellScale: 630, cellSize: 0.19,
		darkGrainColor: '#9a5b49', lightGrainColor: '#ae745e'
	},
	mahogany: {
        originOffset: { x: -0.4, y: 0.2, z: 0 },
		centerSize: 1.25, largeWarpScale: 0.26, largeGrainStretch: 0.29, smallWarpStrength: 0.044,
		smallWarpScale: 2.54, fineWarpStrength: 0.01, fineWarpScale: 15.3, ringCount: 38,
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

	return { ...params, genus, finish, clearcoat, clearcoatRoughness, clearcoatDarken };

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
uniforms.ringCount = TSL.uniform( params.ringCount ).onObjectUpdate( ( { material } ) => material.ringCount );
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

const colorNode = wood(
	TSL.positionLocal.add( TSL.vec3( params.originOffset.x, params.originOffset.y, params.originOffset.z ) ),
	uniforms.centerSize,
	uniforms.largeWarpScale,
	uniforms.largeGrainStretch,
	uniforms.smallWarpStrength,
	uniforms.smallWarpScale,
	uniforms.fineWarpStrength,
	uniforms.fineWarpScale,
	uniforms.ringCount,
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

export function GenerateWoodMaterial( params ) {

	const material = new THREE.MeshPhysicalNodeMaterial();

	Object.assign( material, params );

	material.colorNode = colorNode;
	material.clearcoatNode = params.clearcoat;
	material.clearcoatRoughness = params.clearcoatRoughness;

	return material;

}
