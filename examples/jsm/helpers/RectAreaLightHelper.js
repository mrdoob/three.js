import {
	BackSide,
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial
} from '../../../build/three.module.js';

/**
 *  This helper must be added as a child of the light
 */

function RectAreaLightHelper( light, color ) {

	this.light = light;

	this.color = color; // optional hardwired color for the helper

	var positions = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, - 1, 0, 1, 1, 0 ];

	var geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
	geometry.computeBoundingSphere();

	var material = new LineBasicMaterial( { fog: false } );

	Line.call( this, geometry, material );

	this.type = 'RectAreaLightHelper';

	//

	var positions2 = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, - 1, 0, 1, - 1, 0 ];

	var geometry2 = new BufferGeometry();
	geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
	geometry2.computeBoundingSphere();

	this.add( new Mesh( geometry2, new MeshBasicMaterial( { side: BackSide, fog: false } ) ) );

}

RectAreaLightHelper.prototype = Object.create( Line.prototype );
RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;

RectAreaLightHelper.prototype.updateMatrixWorld = function () {

	this.scale.set( 0.5 * this.light.width, 0.5 * this.light.height, 1 );

	if ( this.color !== undefined ) {

		this.material.color.set( this.color );
		this.children[ 0 ].material.color.set( this.color );

	} else {

		this.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

		// prevent hue shift
		var c = this.material.color;
		var max = Math.max( c.r, c.g, c.b );
		if ( max > 1 ) c.multiplyScalar( 1 / max );

		this.children[ 0 ].material.color.copy( this.material.color );

	}

	this.matrixWorld.copy( this.light.matrixWorld ).scale( this.scale );
	this.children[ 0 ].matrixWorld.copy( this.matrixWorld );

};

RectAreaLightHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();
	this.children[ 0 ].geometry.dispose();
	this.children[ 0 ].material.dispose();

};

export { RectAreaLightHelper };
