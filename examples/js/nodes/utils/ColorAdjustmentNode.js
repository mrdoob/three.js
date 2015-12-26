/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ColorAdjustmentNode = function( rgb, adjustment, method ) {

	THREE.TempNode.call( this, 'v3' );

	this.rgb = rgb;
	this.adjustment = adjustment;

	this.method = method || THREE.ColorAdjustmentNode.SATURATION;

};

THREE.ColorAdjustmentNode.SATURATION = 'saturation';
THREE.ColorAdjustmentNode.HUE = 'hue';
THREE.ColorAdjustmentNode.VIBRANCE = 'vibrance';
THREE.ColorAdjustmentNode.BRIGHTNESS = 'brightness';
THREE.ColorAdjustmentNode.CONTRAST = 'contrast';

THREE.ColorAdjustmentNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.ColorAdjustmentNode.prototype.constructor = THREE.ColorAdjustmentNode;

THREE.ColorAdjustmentNode.prototype.generate = function( builder, output ) {

	var rgb = this.rgb.build( builder, 'v3' );
	var adjustment = this.adjustment.build( builder, 'fv1' );

	var name;

	switch ( this.method ) {

		case THREE.ColorAdjustmentNode.SATURATION:

			name = 'saturation_rgb';

			break;

		case THREE.ColorAdjustmentNode.HUE:

			name = 'hue_rgb';

			break;

		case THREE.ColorAdjustmentNode.VIBRANCE:

			name = 'vibrance_rgb';

			break;

		case THREE.ColorAdjustmentNode.BRIGHTNESS:

			return builder.format( '(' + rgb + '+' + adjustment + ')', this.getType( builder ), output );

			break;

		case THREE.ColorAdjustmentNode.CONTRAST:

			return builder.format( '(' + rgb + '*' + adjustment + ')', this.getType( builder ), output );

			break;

	}

	builder.include( name );

	return builder.format( name + '(' + rgb + ',' + adjustment + ')', this.getType( builder ), output );

};
