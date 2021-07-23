import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { FunctionCallNode } from '../core/FunctionCallNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { UVNode } from '../accessors/UVNode.js';

const NOISE_COMMON_SRC = `
vec3 mod289( vec3 x ) {

	return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0;

}

vec4 mod289( vec4 x ) {

	return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0;

}

vec4 permute( vec4 x ) {

	return mod289( ( ( x * 34.0 ) + 1.0 ) * x );

}

vec4 taylorInvSqrt( vec4 r ) {

	return 1.79284291400159 - 0.85373472095314 * r;

}

vec2 fade( vec2 t ) {

	return t * t * t * ( t * ( t * 6.0 - 15.0 ) + 10.0 );

}

vec3 fade( vec3 t ) {

	return t * t * t * ( t * ( t * 6.0 - 15.0 ) + 10.0 );

}
`.trim();

const NOISE2D_SRC = `
float noise2d( vec2 P, float amplitude, float pivot ) {

	vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
	vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
	Pi = mod289(Pi); // To avoid truncation effects in permutation
	vec4 ix = Pi.xzxz;
	vec4 iy = Pi.yyww;
	vec4 fx = Pf.xzxz;
	vec4 fy = Pf.yyww;

	vec4 i = permute(permute(ix) + iy);

	vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
	vec4 gy = abs(gx) - 0.5 ;
	vec4 tx = floor(gx + 0.5);
	gx = gx - tx;

	vec2 g00 = vec2(gx.x,gy.x);
	vec2 g10 = vec2(gx.y,gy.y);
	vec2 g01 = vec2(gx.z,gy.z);
	vec2 g11 = vec2(gx.w,gy.w);

	vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
	g00 *= norm.x;
	g01 *= norm.y;
	g10 *= norm.z;
	g11 *= norm.w;

	float n00 = dot(g00, vec2(fx.x, fy.x));
	float n10 = dot(g10, vec2(fx.y, fy.y));
	float n01 = dot(g01, vec2(fx.z, fy.z));
	float n11 = dot(g11, vec2(fx.w, fy.w));

	vec2 fade_xy = fade(Pf.xy);
	vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
	float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
	return 2.3 * n_xy * amplitude + pivot;

}
`.trim();

class Noise2DNode extends TempNode {

	constructor( uv = new UVNode(), amplitude = new FloatNode( 1.0 ), pivot = new FloatNode( 0.0 ) ) {

		super( 'f' );

		this.uv = uv;
		this.amplitude = amplitude;
		this.pivot = pivot;

	}

	generate( builder, output ) {

		const noise2d = new FunctionCallNode( Noise2DNode.Nodes.noise2d, [ this.uv, this.amplitude, this.pivot ] );
		return builder.format( noise2d.generate( builder, output ), this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.uv = source.uv;
		this.amplitude = source.amplitude;
		this.pivot = source.pivot;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.uv = this.uv.toJSON( meta ).uuid;
			data.amplitude = this.amplitude.toJSON( meta ).uuid;
			data.pivot = this.pivot.toJSON( meta ).uuid;

		}

		return data;

	}

}

Noise2DNode.prototype.nodeType = 'Noise2D';

Noise2DNode.Nodes = ( function () {

	const noiseCommon = new FunctionNode( NOISE_COMMON_SRC );
	const noise2d = new FunctionNode( NOISE2D_SRC );

	noise2d.includes = [ noiseCommon ];

	return { noiseCommon, noise2d };

} )();

export { Noise2DNode };
