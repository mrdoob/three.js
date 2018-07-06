/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { PositionNode } from '../accessors/PositionNode.js';
import { OperatorNode } from '../math/OperatorNode.js';
import { TextureNode } from './TextureNode.js';
import { Matrix4Node } from './Matrix4Node.js';

function ReflectorNode( mirror ) {

	TempNode.call( this, 'v4' );

	if ( mirror ) this.setMirror( mirror );

};

ReflectorNode.prototype = Object.create( TempNode.prototype );
ReflectorNode.prototype.constructor = ReflectorNode;
ReflectorNode.prototype.nodeType = "Reflector";

ReflectorNode.prototype.setMirror = function ( mirror ) {

	this.mirror = mirror;

	this.textureMatrix = new Matrix4Node( this.mirror.material.uniforms.textureMatrix.value );

	this.localPosition = new PositionNode( PositionNode.LOCAL );

	this.uv = new OperatorNode( this.textureMatrix, this.localPosition, OperatorNode.MUL );
	this.uvResult = new OperatorNode( null, this.uv, OperatorNode.ADD );

	this.texture = new TextureNode( this.mirror.material.uniforms.tDiffuse.value, this.uv, null, true );

};

ReflectorNode.prototype.generate = function ( builder, output ) {
	
	if ( builder.isShader( 'fragment' ) ) {

		this.uvResult.a = this.offset;
		this.texture.uv = this.offset ? this.uvResult : this.uv;

		if ( output === 'sampler2D' ) {

			return this.texture.build( builder, output );

		}

		return builder.format( this.texture.build( builder, this.type ), this.type, output );

	} else {

		console.warn( "THREE.ReflectorNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4( 0.0 )', this.type, output );

	}

};

ReflectorNode.prototype.copy = function ( source ) {
			
	InputNode.prototype.copy.call( this, source );
	
	this.scope.mirror = source.mirror;

};

ReflectorNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.mirror = this.mirror.uuid;

		if ( this.offset ) data.offset = this.offset.toJSON( meta ).uuid;

	}

	return data;

};

export { ReflectorNode };
