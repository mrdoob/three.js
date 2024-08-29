import { Fn, int, float, vec2, vec3, vec4, If } from '../tsl/TSLBase.js';
import { cos, sin, abs, max, exp2, log2, clamp, fract, mix, floor, normalize, cross, all } from '../math/MathNode.js';
import { mul } from '../math/OperatorNode.js';
import { select } from '../math/ConditionalNode.js';
import { Loop, Break } from '../utils/LoopNode.js';

// These defines must match with PMREMGenerator

const cubeUV_r0 = /*@__PURE__*/ float( 1.0 );
const cubeUV_m0 = /*@__PURE__*/ float( - 2.0 );
const cubeUV_r1 = /*@__PURE__*/ float( 0.8 );
const cubeUV_m1 = /*@__PURE__*/ float( - 1.0 );
const cubeUV_r4 = /*@__PURE__*/ float( 0.4 );
const cubeUV_m4 = /*@__PURE__*/ float( 2.0 );
const cubeUV_r5 = /*@__PURE__*/ float( 0.305 );
const cubeUV_m5 = /*@__PURE__*/ float( 3.0 );
const cubeUV_r6 = /*@__PURE__*/ float( 0.21 );
const cubeUV_m6 = /*@__PURE__*/ float( 4.0 );

const cubeUV_minMipLevel = /*@__PURE__*/ float( 4.0 );
const cubeUV_minTileSize = /*@__PURE__*/ float( 16.0 );

// These shader functions convert between the UV coordinates of a single face of
// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
// sampling a textureCube (not generally normalized ).

const getFace = /*@__PURE__*/ Fn( ( [ direction ] ) => {

	const absDirection = vec3( abs( direction ) ).toVar();
	const face = float( - 1.0 ).toVar();

	If( absDirection.x.greaterThan( absDirection.z ), () => {

		If( absDirection.x.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.x.greaterThan( 0.0 ), 0.0, 3.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} ).Else( () => {

		If( absDirection.z.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.z.greaterThan( 0.0 ), 2.0, 5.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} );

	return face;

} ).setLayout( {
	name: 'getFace',
	type: 'float',
	inputs: [
		{ name: 'direction', type: 'vec3' }
	]
} );

// RH coordinate system; PMREM face-indexing convention
const getUV = /*@__PURE__*/ Fn( ( [ direction, face ] ) => {

	const uv = vec2().toVar();

	If( face.equal( 0.0 ), () => {

		uv.assign( vec2( direction.z, direction.y ).div( abs( direction.x ) ) ); // pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z.negate() ).div( abs( direction.y ) ) ); // pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.y ).div( abs( direction.z ) ) ); // pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		uv.assign( vec2( direction.z.negate(), direction.y ).div( abs( direction.x ) ) ); // neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z ).div( abs( direction.y ) ) ); // neg y

	} ).Else( () => {

		uv.assign( vec2( direction.x, direction.y ).div( abs( direction.z ) ) ); // neg z

	} );

	return mul( 0.5, uv.add( 1.0 ) );

} ).setLayout( {
	name: 'getUV',
	type: 'vec2',
	inputs: [
		{ name: 'direction', type: 'vec3' },
		{ name: 'face', type: 'float' }
	]
} );

const roughnessToMip = /*@__PURE__*/ Fn( ( [ roughness ] ) => {

	const mip = float( 0.0 ).toVar();

	If( roughness.greaterThanEqual( cubeUV_r1 ), () => {

		mip.assign( cubeUV_r0.sub( roughness ).mul( cubeUV_m1.sub( cubeUV_m0 ) ).div( cubeUV_r0.sub( cubeUV_r1 ) ).add( cubeUV_m0 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r4 ), () => {

		mip.assign( cubeUV_r1.sub( roughness ).mul( cubeUV_m4.sub( cubeUV_m1 ) ).div( cubeUV_r1.sub( cubeUV_r4 ) ).add( cubeUV_m1 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r5 ), () => {

		mip.assign( cubeUV_r4.sub( roughness ).mul( cubeUV_m5.sub( cubeUV_m4 ) ).div( cubeUV_r4.sub( cubeUV_r5 ) ).add( cubeUV_m4 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r6 ), () => {

		mip.assign( cubeUV_r5.sub( roughness ).mul( cubeUV_m6.sub( cubeUV_m5 ) ).div( cubeUV_r5.sub( cubeUV_r6 ) ).add( cubeUV_m5 ) );

	} ).Else( () => {

		mip.assign( float( - 2.0 ).mul( log2( mul( 1.16, roughness ) ) ) ); // 1.16 = 1.79^0.25

	} );

	return mip;

} ).setLayout( {
	name: 'roughnessToMip',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' }
	]
} );

// RH coordinate system; PMREM face-indexing convention
export const getDirection = /*@__PURE__*/ Fn( ( [ uv_immutable, face ] ) => {

	const uv = uv_immutable.toVar();
	uv.assign( mul( 2.0, uv ).sub( 1.0 ) );
	const direction = vec3( uv, 1.0 ).toVar();

	If( face.equal( 0.0 ), () => {

		direction.assign( direction.zyx ); // ( 1, v, u ) pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		direction.assign( direction.xzy );
		direction.xz.mulAssign( - 1.0 ); // ( -u, 1, -v ) pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		direction.x.mulAssign( - 1.0 ); // ( -u, v, 1 ) pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		direction.assign( direction.zyx );
		direction.xz.mulAssign( - 1.0 ); // ( -1, v, -u ) neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		direction.assign( direction.xzy );
		direction.xy.mulAssign( - 1.0 ); // ( -u, -1, v ) neg y

	} ).ElseIf( face.equal( 5.0 ), () => {

		direction.z.mulAssign( - 1.0 ); // ( u, v, -1 ) neg zS

	} );

	return direction;

} ).setLayout( {
	name: 'getDirection',
	type: 'vec3',
	inputs: [
		{ name: 'uv', type: 'vec2' },
		{ name: 'face', type: 'float' }
	]
} );

//

export const textureCubeUV = /*@__PURE__*/ Fn( ( [ envMap, sampleDir_immutable, roughness_immutable, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ] ) => {

	const roughness = float( roughness_immutable );
	const sampleDir = vec3( sampleDir_immutable );

	const mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
	const mipF = fract( mip );
	const mipInt = floor( mip );
	const color0 = vec3( bilinearCubeUV( envMap, sampleDir, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) ).toVar();

	If( mipF.notEqual( 0.0 ), () => {

		const color1 = vec3( bilinearCubeUV( envMap, sampleDir, mipInt.add( 1.0 ), CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) ).toVar();

		color0.assign( mix( color0, color1, mipF ) );

	} );

	return color0;

} );

const bilinearCubeUV = /*@__PURE__*/ Fn( ( [ envMap, direction_immutable, mipInt_immutable, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ] ) => {

	const mipInt = float( mipInt_immutable ).toVar();
	const direction = vec3( direction_immutable );
	const face = float( getFace( direction ) ).toVar();
	const filterInt = float( max( cubeUV_minMipLevel.sub( mipInt ), 0.0 ) ).toVar();
	mipInt.assign( max( mipInt, cubeUV_minMipLevel ) );
	const faceSize = float( exp2( mipInt ) ).toVar();
	const uv = vec2( getUV( direction, face ).mul( faceSize.sub( 2.0 ) ).add( 1.0 ) ).toVar();

	If( face.greaterThan( 2.0 ), () => {

		uv.y.addAssign( faceSize );
		face.subAssign( 3.0 );

	} );

	uv.x.addAssign( face.mul( faceSize ) );
	uv.x.addAssign( filterInt.mul( mul( 3.0, cubeUV_minTileSize ) ) );
	uv.y.addAssign( mul( 4.0, exp2( CUBEUV_MAX_MIP ).sub( faceSize ) ) );
	uv.x.mulAssign( CUBEUV_TEXEL_WIDTH );
	uv.y.mulAssign( CUBEUV_TEXEL_HEIGHT );

	return envMap.uv( uv ).grad( vec2(), vec2() ); // disable anisotropic filtering

} );

const getSample = /*@__PURE__*/ Fn( ( { envMap, mipInt, outputDirection, theta, axis, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const cosTheta = cos( theta );

	// Rodrigues' axis-angle rotation
	const sampleDirection = outputDirection.mul( cosTheta )
		.add( axis.cross( outputDirection ).mul( sin( theta ) ) )
		.add( axis.mul( axis.dot( outputDirection ).mul( cosTheta.oneMinus() ) ) );

	return bilinearCubeUV( envMap, sampleDirection, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP );

} );

export const blur = /*@__PURE__*/ Fn( ( { n, latitudinal, poleAxis, outputDirection, weights, samples, dTheta, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const axis = vec3( select( latitudinal, poleAxis, cross( poleAxis, outputDirection ) ) ).toVar();

	If( all( axis.equals( vec3( 0.0 ) ) ), () => {

		axis.assign( vec3( outputDirection.z, 0.0, outputDirection.x.negate() ) );

	} );

	axis.assign( normalize( axis ) );

	const gl_FragColor = vec3().toVar();
	gl_FragColor.addAssign( weights.element( int( 0 ) ).mul( getSample( { theta: 0.0, axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );

	Loop( { start: int( 1 ), end: n }, ( { i } ) => {

		If( i.greaterThanEqual( samples ), () => {

			Break();

		} );

		const theta = float( dTheta.mul( float( i ) ) ).toVar();
		gl_FragColor.addAssign( weights.element( i ).mul( getSample( { theta: theta.mul( - 1.0 ), axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );
		gl_FragColor.addAssign( weights.element( i ).mul( getSample( { theta, axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );

	} );

	return vec4( gl_FragColor, 1 );

} );
