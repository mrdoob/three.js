import { Vector2 } from '../../../../build/three.module.js';

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { Vector2Node } from '../inputs/Vector2Node.js';
import { UVNode } from '../accessors/UVNode.js';

class BlurNode extends TempNode {

	constructor( value, uv, radius, size ) {

		super( 'v4' );

		this.value = value;
		this.uv = uv || new UVNode();
		this.radius = radius || new Vector2Node( 1, 1 );

		this.size = size;

		this.blurX = true;
		this.blurY = true;

		this.horizontal = new FloatNode( 1 / 64 );
		this.vertical = new FloatNode( 1 / 64 );

	}

	updateFrame( /* frame */ ) {

		if ( this.size ) {

			this.horizontal.value = this.radius.x / this.size.x;
			this.vertical.value = this.radius.y / this.size.y;

		} else if ( this.value.value && this.value.value.image ) {

			const image = this.value.value.image;

			this.horizontal.value = this.radius.x / image.width;
			this.vertical.value = this.radius.y / image.height;

		}

	}

	generate( builder, output ) {

		if ( builder.isShader( 'fragment' ) ) {

			const blurCode = [];
			let code;

			const blurX = builder.include( BlurNode.Nodes.blurX ),
				blurY = builder.include( BlurNode.Nodes.blurY );

			if ( this.blurX ) {

				blurCode.push( blurX + '( ' + this.value.build( builder, 'sampler2D' ) + ', ' + this.uv.build( builder, 'v2' ) + ', ' + this.horizontal.build( builder, 'f' ) + ' )' );

			}

			if ( this.blurY ) {

				blurCode.push( blurY + '( ' + this.value.build( builder, 'sampler2D' ) + ', ' + this.uv.build( builder, 'v2' ) + ', ' + this.vertical.build( builder, 'f' ) + ' )' );

			}

			if ( blurCode.length == 2 ) code = '( ' + blurCode.join( ' + ' ) + ' / 2.0 )';
			else if ( blurCode.length ) code = '( ' + blurCode[ 0 ] + ' )';
			else code = 'vec4( 0.0 )';

			return builder.format( code, this.getType( builder ), output );

		} else {

			console.warn( 'THREE.BlurNode is not compatible with ' + builder.shader + ' shader.' );

			return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;
		this.uv = source.uv;
		this.radius = source.radius;

		if ( source.size !== undefined ) this.size = new Vector2( source.size.x, source.size.y );

		this.blurX = source.blurX;
		this.blurY = source.blurY;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;
			data.uv = this.uv.toJSON( meta ).uuid;
			data.radius = this.radius.toJSON( meta ).uuid;

			if ( this.size ) data.size = { x: this.size.x, y: this.size.y };

			data.blurX = this.blurX;
			data.blurY = this.blurY;

		}

		return data;

	}

}

BlurNode.Nodes = ( function () {

	const blurX = new FunctionNode( /* glsl */`
		vec4 blurX( sampler2D tex, vec2 uv, float s ) {
			vec4 sum = vec4( 0.0 );
			sum += texture2D( tex, vec2( uv.x - 4.0 * s, uv.y ) ) * 0.051;
			sum += texture2D( tex, vec2( uv.x - 3.0 * s, uv.y ) ) * 0.0918;
			sum += texture2D( tex, vec2( uv.x - 2.0 * s, uv.y ) ) * 0.12245;
			sum += texture2D( tex, vec2( uv.x - 1.0 * s, uv.y ) ) * 0.1531;
			sum += texture2D( tex, vec2( uv.x, uv.y ) ) * 0.1633;
			sum += texture2D( tex, vec2( uv.x + 1.0 * s, uv.y ) ) * 0.1531;
			sum += texture2D( tex, vec2( uv.x + 2.0 * s, uv.y ) ) * 0.12245;
			sum += texture2D( tex, vec2( uv.x + 3.0 * s, uv.y ) ) * 0.0918;
			sum += texture2D( tex, vec2( uv.x + 4.0 * s, uv.y ) ) * 0.051;
			return sum * .667;
		}`
	);

	const blurY = new FunctionNode( /* glsl */`
		vec4 blurY( sampler2D tex, vec2 uv, float s ) {
			vec4 sum = vec4( 0.0 );
			sum += texture2D( tex, vec2( uv.x, uv.y - 4.0 * s ) ) * 0.051;
			sum += texture2D( tex, vec2( uv.x, uv.y - 3.0 * s ) ) * 0.0918;
			sum += texture2D( tex, vec2( uv.x, uv.y - 2.0 * s ) ) * 0.12245;
			sum += texture2D( tex, vec2( uv.x, uv.y - 1.0 * s ) ) * 0.1531;
			sum += texture2D( tex, vec2( uv.x, uv.y ) ) * 0.1633;
			sum += texture2D( tex, vec2( uv.x, uv.y + 1.0 * s ) ) * 0.1531;
			sum += texture2D( tex, vec2( uv.x, uv.y + 2.0 * s ) ) * 0.12245;
			sum += texture2D( tex, vec2( uv.x, uv.y + 3.0 * s ) ) * 0.0918;
			sum += texture2D( tex, vec2( uv.x, uv.y + 4.0 * s ) ) * 0.051;
			return sum * .667;
		}`
	 );

	return {
		blurX: blurX,
		blurY: blurY
	};

} )();

BlurNode.prototype.nodeType = 'Blur';
BlurNode.prototype.hashProperties = [ 'blurX', 'blurY' ];

export { BlurNode };
