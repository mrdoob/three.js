import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { FunctionCallNode } from '../core/FunctionCallNode.js';
import { IntNode } from '../inputs/IntNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { PositionNode } from '../accessors/PositionNode.js';
import { Noise3DNode } from './Noise3DNode.js';

const FRACTAL3D_SRC = `
float fractal3d( vec3 p, float amplitude, int octaves, float lacunarity, float diminish ) {

	float result = 0.0;

	for (int i = 0;  i < octaves; ++i) {

		result += noise3d(p, amplitude, 0.0);
		amplitude *= diminish;
		p *= lacunarity;

	}

	return result;

}
`.trim();

/** Fractional Brownian motion. */
class Fractal3DNode extends TempNode {

	constructor( position = new PositionNode(), amplitude = new FloatNode( 1.0 ), octaves = 3.0, lacunarity = 2.0, diminish = 0.5 ) {

		super( 'f' );

		this.position = position;
		this.amplitude = amplitude;
		this.octaves = new IntNode( octaves ).setReadonly( true );
		this.lacunarity = new FloatNode( lacunarity ).setReadonly( true );
		this.diminish = new FloatNode( diminish ).setReadonly( true );

	}

	generate( builder, output ) {

		const fractal3d = new FunctionCallNode( Fractal3DNode.Nodes.fractal3d, [

			this.position,
			this.amplitude,
			this.octaves,
			this.lacunarity,
			this.diminish,

		] );

		return builder.format( fractal3d.generate( builder, output ), this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.position = source.position;
		this.amplitude = source.amplitude;
		this.octaves = source.octaves;
		this.lacunarity = source.lacunarity;
		this.diminish = source.diminish;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.position = this.position.toJSON( meta ).uuid;
			data.amplitude = this.amplitude.toJSON( meta ).uuid;
			data.octaves = this.octaves.toJSON( meta ).uuid;
			data.lacunarity = this.lacunarity.toJSON( meta ).uuid;
			data.diminish = this.diminish.toJSON( meta ).uuid;

		}

		return data;

	}

}

Fractal3DNode.prototype.nodeType = 'Fractal3D';

Fractal3DNode.Nodes = ( function () {

	const fractal3d = new FunctionNode( FRACTAL3D_SRC );

	fractal3d.includes = [ Noise3DNode.Nodes.noise3d ];

	return { fractal3d };

} )();

export { Fractal3DNode };
