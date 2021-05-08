import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';

const REMAP_SRC = `
float remap( float value, float inLow, float inHigh, float outLow, float outHigh ) {

	float x = ( value - inLow ) / ( inHigh - inLow );
	return outLow + ( outHigh - outLow ) * x;

}

vec2 remap( vec2 value, vec2 inLow, vec2 inHigh, vec2 outLow, vec2 outHigh ) {

	return vec2(
		remap( value.x, inLow.x, inHigh.x, outLow.x, outHigh.x ),
		remap( value.y, inLow.y, inHigh.y, outLow.y, outHigh.y )
	);

}

vec2 remap( vec2 value, float inLow, float inHigh, float outLow, float outHigh ) {

	return vec2(
		remap( value.x, inLow, inHigh, outLow, outHigh ),
		remap( value.y, inLow, inHigh, outLow, outHigh )
	);

}

vec3 remap( vec3 value, vec3 inLow, vec3 inHigh, vec3 outLow, vec3 outHigh ) {

	return vec3(
		remap( value.x, inLow.x, inHigh.x, outLow.x, outHigh.x ),
		remap( value.y, inLow.y, inHigh.y, outLow.y, outHigh.y ),
		remap( value.z, inLow.z, inHigh.z, outLow.z, outHigh.z )
	);

}

vec3 remap( vec3 value, float inLow, float inHigh, float outLow, float outHigh ) {

	return vec3(
		remap( value.x, inLow, inHigh, outLow, outHigh ),
		remap( value.y, inLow, inHigh, outLow, outHigh ),
		remap( value.z, inLow, inHigh, outLow, outHigh )
	);

}

vec4 remap( vec4 value, vec4 inLow, vec4 inHigh, vec4 outLow, vec4 outHigh ) {

	return vec4(
		remap( value.x, inLow.x, inHigh.x, outLow.x, outHigh.x ),
		remap( value.y, inLow.y, inHigh.y, outLow.y, outHigh.y ),
		remap( value.z, inLow.z, inHigh.z, outLow.z, outHigh.z ),
		remap( value.w, inLow.w, inHigh.w, outLow.w, outHigh.w )
	);

}

vec4 remap( vec4 value, float inLow, float inHigh, float outLow, float outHigh ) {

	return vec4(
		remap( value.x, inLow, inHigh, outLow, outHigh ),
		remap( value.y, inLow, inHigh, outLow, outHigh ),
		remap( value.z, inLow, inHigh, outLow, outHigh ),
		remap( value.w, inLow, inHigh, outLow, outHigh )
	);

}
`.trim();

class RemapNode extends TempNode {

	constructor( value, inLow, inHigh, outLow, outHigh ) {

		super( 'f' );

		this.value = value;
		this.inLow = inLow;
		this.inHigh = inHigh;
		this.outLow = outLow;
		this.outHigh = outHigh;

	}

	generate( builder, output ) {

		const remap = builder.include( RemapNode.Nodes.remap );

		return builder.format( remap + '( ' + [

			this.value.build( builder ),
			this.inLow.build( builder ),
			this.inHigh.build( builder ),
			this.outLow.build( builder ),
			this.outHigh.build( builder ),

		].join( ', ' ) + ' )', this.getType( builder ), output );

	}

	getType( builder ) {

		return this.value.getType( builder );

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;
		this.inLow = source.inLow;
		this.inHigh = source.inHigh;
		this.outLow = source.outLow;
		this.outHigh = source.outHigh;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;
			data.inLow = this.inLow.toJSON( meta ).uuid;
			data.inHigh = this.inHigh.toJSON( meta ).uuid;
			data.outLow = this.outLow.toJSON( meta ).uuid;
			data.outHigh = this.outHigh.toJSON( meta ).uuid;

		}

		return data;

	}

}

RemapNode.prototype.nodeType = 'Remap';

RemapNode.Nodes = ( function () {

	return {

		remap: new FunctionNode( REMAP_SRC )

	};

} )();

export { RemapNode };
