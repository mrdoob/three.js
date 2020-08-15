import { TempNode } from '../core/TempNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { NormalNode } from '../accessors/NormalNode.js';
import { PositionNode } from '../accessors/PositionNode.js';

function BumpMapNode( value, scale ) {

	TempNode.call( this, 'v3' );

	this.value = value;
	this.scale = scale || new FloatNode( 1 );

	this.toNormalMap = false;

}

BumpMapNode.Nodes = ( function () {

	var dHdxy_fwd = new FunctionNode( [

		// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
		// http://api.unrealengine.com/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf

		// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

		"vec2 dHdxy_fwd( sampler2D bumpMap, vec2 vUv, float bumpScale ) {",

		// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

		"	vec2 dSTdx = dFdx( vUv );",
		"	vec2 dSTdy = dFdy( vUv );",

		"	float Hll = bumpScale * texture2D( bumpMap, vUv ).x;",
		"	float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;",
		"	float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;",

		"	return vec2( dBx, dBy );",

		"}"

	].join( "\n" ), null, { derivatives: true } );

	var perturbNormalArb = new FunctionNode( [

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

	].join( "\n" ), [ dHdxy_fwd ], { derivatives: true } );

	var bumpToNormal = new FunctionNode( [
		"vec3 bumpToNormal( sampler2D bumpMap, vec2 uv, float scale ) {",

		"	vec2 dSTdx = dFdx( uv );",
		"	vec2 dSTdy = dFdy( uv );",

		"	float Hll = texture2D( bumpMap, uv ).x;",
		"	float dBx = texture2D( bumpMap, uv + dSTdx ).x - Hll;",
		"	float dBy = texture2D( bumpMap, uv + dSTdy ).x - Hll;",

		"	return vec3( .5 - ( dBx * scale ), .5 - ( dBy * scale ), 1.0 );",

		"}"
	].join( "\n" ), null, { derivatives: true } );

	return {
		dHdxy_fwd: dHdxy_fwd,
		perturbNormalArb: perturbNormalArb,
		bumpToNormal: bumpToNormal
	};

} )();

BumpMapNode.prototype = Object.create( TempNode.prototype );
BumpMapNode.prototype.constructor = BumpMapNode;
BumpMapNode.prototype.nodeType = "BumpMap";
BumpMapNode.prototype.hashProperties = [ "toNormalMap" ];

BumpMapNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		if ( this.toNormalMap ) {

			var bumpToNormal = builder.include( BumpMapNode.Nodes.bumpToNormal );

			return builder.format( bumpToNormal + '( ' + this.value.build( builder, 'sampler2D' ) + ', ' +
				this.value.uv.build( builder, 'v2' ) + ', ' +
				this.scale.build( builder, 'f' ) + ' )', this.getType( builder ), output );

		} else {

			var derivativeHeight = builder.include( BumpMapNode.Nodes.dHdxy_fwd ),
				perturbNormalArb = builder.include( BumpMapNode.Nodes.perturbNormalArb );

			this.normal = this.normal || new NormalNode();
			this.position = this.position || new PositionNode( PositionNode.VIEW );

			var derivativeHeightCode = derivativeHeight + '( ' + this.value.build( builder, 'sampler2D' ) + ', ' +
				this.value.uv.build( builder, 'v2' ) + ', ' +
				this.scale.build( builder, 'f' ) + ' )';

			return builder.format( perturbNormalArb + '( -' + this.position.build( builder, 'v3' ) + ', ' +
				this.normal.build( builder, 'v3' ) + ', ' +
				derivativeHeightCode + ' )', this.getType( builder ), output );

		}

	} else {

		console.warn( "THREE.BumpMapNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};

BumpMapNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.value = source.value;
	this.scale = source.scale;

	return this;

};

BumpMapNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;
		data.scale = this.scale.toJSON( meta ).uuid;

	}

	return data;

};

export { BumpMapNode };
