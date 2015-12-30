/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ScreenUVNode = function( resolution ) {

	THREE.TempNode.call( this, 'v2' );

	this.resolution = resolution;

};

THREE.ScreenUVNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.ScreenUVNode.prototype.constructor = THREE.ScreenUVNode;

THREE.ScreenUVNode.prototype.generate = function( builder, output ) {

	var material = builder.material;
	var result;

	if ( builder.isShader( 'fragment' ) ) {

		result = '(gl_FragCoord.xy/' + this.resolution.build( builder, 'v2' ) + ')';

	}
	else {

		console.warn( "THREE.ScreenUVNode is not compatible with " + builder.shader + " shader." );

		result = 'vec2( 0.0 )';

	}

	return builder.format( result, this.getType( builder ), output );

};
