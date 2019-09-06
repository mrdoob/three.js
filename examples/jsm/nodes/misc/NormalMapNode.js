/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { Vector2Node } from '../inputs/Vector2Node.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';
import { NormalNode } from '../accessors/NormalNode.js';
import { PositionNode } from '../accessors/PositionNode.js';

function NormalMapNode( value, scale ) {

	TempNode.call( this, 'v3' );

	this.value = value;
	this.scale = scale || new Vector2Node( 1, 1 );

}

NormalMapNode.Nodes = ( function () {

	var perturbNormal2Arb = new FunctionNode( 

// Per-Pixel Tangent Space Normal Mapping
// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html
	
`vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 map, vec2 vUv, vec2 normalScale ) {

	// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

	vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
	vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
	vec2 st0 = dFdx( vUv.st );
	vec2 st1 = dFdy( vUv.st );

	float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude

	vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );
	vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );
	vec3 N = normalize( surf_norm );

	vec3 mapN = map * 2.0 - 1.0;

	mapN.xy *= normalScale;

	#ifdef DOUBLE_SIDED

		// Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331
		// http://hacksoflife.blogspot.com/2009/11/per-pixel-tangent-space-normal-mapping.html?showComment=1522254677437#c5087545147696715943
		vec3 NfromST = cross( S, T );
		if( dot( NfromST, N ) > 0.0 ) {

			S *= -1.0;
			T *= -1.0;

		}

	#else

		mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );

	#endif

	mat3 tsn = mat3( S, T, N );
	return normalize( tsn * mapN );

}`, null, { derivatives: true } );

	return {
		perturbNormal2Arb: perturbNormal2Arb
	};

} )();

NormalMapNode.prototype = Object.create( TempNode.prototype );
NormalMapNode.prototype.constructor = NormalMapNode;
NormalMapNode.prototype.nodeType = "NormalMap";

NormalMapNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		var perturbNormal2Arb = builder.include( NormalMapNode.Nodes.perturbNormal2Arb );

		this.normal = this.normal || new NormalNode();
		this.position = this.position || new PositionNode( PositionNode.VIEW );
		this.uv = this.uv || new UVNode();

		return builder.format( perturbNormal2Arb + '( -' + this.position.build( builder, 'v3' ) + ', ' +
			this.normal.build( builder, 'v3' ) + ', ' +
			this.value.build( builder, 'v3' ) + ', ' +
			this.uv.build( builder, 'v2' ) + ', ' +
			this.scale.build( builder, 'v2' ) + ' )', this.getType( builder ), output );

	} else {

		console.warn( "THREE.NormalMapNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};

NormalMapNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.value = source.value;
	this.scale = source.scale;

	return this;

};

NormalMapNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;
		data.scale = this.scale.toJSON( meta ).uuid;

	}

	return data;

};

export { NormalMapNode };
