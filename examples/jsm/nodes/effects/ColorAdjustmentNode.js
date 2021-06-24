import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { LuminanceNode } from './LuminanceNode.js';

class ColorAdjustmentNode extends TempNode {

	constructor( rgb, adjustment, method ) {

		super( 'v3' );

		this.rgb = rgb;
		this.adjustment = adjustment;

		this.method = method || ColorAdjustmentNode.SATURATION;

	}

	generate( builder, output ) {

		const rgb = this.rgb.build( builder, 'v3' ),
			adjustment = this.adjustment.build( builder, 'f' );

		switch ( this.method ) {

			case ColorAdjustmentNode.BRIGHTNESS:

				return builder.format( '( ' + rgb + ' + ' + adjustment + ' )', this.getType( builder ), output );

				break;

			case ColorAdjustmentNode.CONTRAST:

				return builder.format( '( ' + rgb + ' * ' + adjustment + ' )', this.getType( builder ), output );

				break;

		}

		const method = builder.include( ColorAdjustmentNode.Nodes[ this.method ] );

		return builder.format( method + '( ' + rgb + ', ' + adjustment + ' )', this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.rgb = source.rgb;
		this.adjustment = source.adjustment;
		this.method = source.method;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.rgb = this.rgb.toJSON( meta ).uuid;
			data.adjustment = this.adjustment.toJSON( meta ).uuid;
			data.method = this.method;

		}

		return data;

	}

}

ColorAdjustmentNode.Nodes = ( function () {

	const hue = new FunctionNode( /* glsl */`
		vec3 hue(vec3 rgb, float adjustment) {

			const mat3 RGBtoYIQ = mat3(0.299, 0.587, 0.114, 0.595716, -0.274453, -0.321263, 0.211456, -0.522591, 0.311135);
			const mat3 YIQtoRGB = mat3(1.0, 0.9563, 0.6210, 1.0, -0.2721, -0.6474, 1.0, -1.107, 1.7046);

			vec3 yiq = RGBtoYIQ * rgb;

			float hue = atan(yiq.z, yiq.y) + adjustment;
			float chroma = sqrt(yiq.z * yiq.z + yiq.y * yiq.y);

			return YIQtoRGB * vec3(yiq.x, chroma * cos(hue), chroma * sin(hue));

		}`
	);

	// Algorithm from Chapter 16 of OpenGL Shading Language

	const saturation = new FunctionNode( /* glsl */`
		vec3 saturation(vec3 rgb, float adjustment) {

			vec3 intensity = vec3( luminance( rgb ) );

			return mix( intensity, rgb, adjustment );

		}`
	, [ LuminanceNode.Nodes.luminance ] ); // include LuminanceNode function

	// Shader by Evan Wallace adapted by @lo-th

	const vibrance = new FunctionNode( /* glsl */`

		vec3 vibrance(vec3 rgb, float adjustment) {

			float average = (rgb.r + rgb.g + rgb.b) / 3.0;

			float mx = max(rgb.r, max(rgb.g, rgb.b));
			float amt = (mx - average) * (-3.0 * adjustment);

			return mix(rgb.rgb, vec3(mx), amt);

		}`
	);

	return {
		hue: hue,
		saturation: saturation,
		vibrance: vibrance
	};

} )();

ColorAdjustmentNode.SATURATION = 'saturation';
ColorAdjustmentNode.HUE = 'hue';
ColorAdjustmentNode.VIBRANCE = 'vibrance';
ColorAdjustmentNode.BRIGHTNESS = 'brightness';
ColorAdjustmentNode.CONTRAST = 'contrast';

ColorAdjustmentNode.prototype.nodeType = 'ColorAdjustment';
ColorAdjustmentNode.prototype.hashProperties = [ 'method' ];

export { ColorAdjustmentNode };
