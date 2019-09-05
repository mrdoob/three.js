/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeContext } from '../core/NodeContext.js'
import { ExpressionNode } from '../core/ExpressionNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { NormalNode } from '../accessors/NormalNode.js';
import { PositionNode } from '../accessors/PositionNode.js';
import { UVNode } from '../accessors/UVNode.js';

export const PERTURB_NORMAL_ARB = new FunctionNode( [

	"vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {",

	// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

	"	vec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );",
	"	vec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );",
	"	vec3 vN = surf_norm;", // normalized

	"	vec3 R1 = cross( vSigmaY, vN );",
	"	vec3 R2 = cross( vN, vSigmaX );",

	"	float fDet = dot( vSigmaX, R1 );",

	"	fDet *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );",

	"	vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );",

	"	return normalize( abs( fDet ) * surf_norm - vGrad );",

	"}"

].join( "\n" ), undefined, { derivatives: true } );

export const BUMP_TO_NORMAL = new FunctionNode( [
	"vec3 bumpToNormal( sampler2D bumpMap, vec2 uv, float scale ) {",

	"	vec2 dSTdx = dFdx( uv );",
	"	vec2 dSTdy = dFdy( uv );",

	"	float Hll = texture2D( bumpMap, uv ).x;",
	"	float dBx = texture2D( bumpMap, uv + dSTdx ).x - Hll;",
	"	float dBy = texture2D( bumpMap, uv + dSTdy ).x - Hll;",

	"	return vec3( .5 - ( dBx * scale ), .5 - ( dBy * scale ), 1.0 );",

	"}"
].join( "\n" ), null, { derivatives: true } );

export class BumpMapNode extends TempNode {

	constructor( value, scale ) {

		super( 'v3' );

		this.value = value;
		this.scale = scale || new FloatNode( 1 );

		this.normal = undefined;
		this.position = undefined;

		this.toNormalMap = false;

		this.nodeType = "BumpMap";

	}

	generate( builder, output ) {

		if ( builder.isShader( 'fragment' ) ) {

			if ( this.toNormalMap ) {

				var bumpToNormal = builder.include( BUMP_TO_NORMAL );

				return builder.format( bumpToNormal + '( ' + this.value.build( builder, 'sampler2D' ) + ', ' +
					this.value.uv.build( builder, 'v2' ) + ', ' +
					this.scale.build( builder, 'f' ) + ' )', this.getType( builder ), output );

			} else {

				var perturbNormalArb = builder.include( PERTURB_NORMAL_ARB );

				// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
				// http://api.unrealengine.com/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf

				// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

				// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

				var extensions = { derivatives: true };

				this.HllContext = this.HllContext || new NodeContext().setSampler( new ExpressionNode( 'texture.uv', 'v2' ) );
				this.dSTdxContext = this.dSTdxContext || new NodeContext().setSampler( new ExpressionNode( 'texture.uv + dFdx( texture.uv )', 'v2', undefined, extensions ) );
				this.dSTdyContext = this.dSTdyContext || new NodeContext().setSampler( new ExpressionNode( 'texture.uv + dFdy( texture.uv )', 'v2', undefined, extensions ) );

				// Hll is used two times, is necessary to cache, calls the same count
				var HllA = this.value.buildContext( this.HllContext, builder, 'f' );
				var HllB = this.value.buildContext( this.HllContext, builder, 'f' );
				
				var dBx = this.value.buildContext( this.dSTdxContext, builder, 'f' );
				var dBy = this.value.buildContext( this.dSTdyContext, builder, 'f' );
				var scale = this.scale.build( builder, 'f' );

				this.dHdxy_fwd = this.dHdxy_fwd || new ExpressionNode( '', 'v2' );
				this.dHdxy_fwd.parse( `vec2( ${dBx} - ${HllA}, ${dBy} - ${HllB} ) * ${scale}` );

				var derivativeHeightCode = this.dHdxy_fwd.build( builder, 'v2' );

				this.normal = this.normal || new NormalNode( NormalNode.VIEW );
				this.position = this.position || new PositionNode( PositionNode.VIEW );

				return builder.format( perturbNormalArb + '( -' + this.position.build( builder, 'v3' ) + ', ' +
					this.normal.build( builder, 'v3' ) + ', ' +
					derivativeHeightCode + ' )', this.getType( builder ), output );

			}

		} else {

			console.warn( "THREE.BumpMapNode is not compatible with " + builder.shader + " shader." );

			return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;
		this.scale = source.scale;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;
			data.scale = this.scale.toJSON( meta ).uuid;

		}

		return data;

	}

}
