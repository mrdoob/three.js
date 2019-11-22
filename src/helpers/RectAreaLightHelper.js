/**
 * @author abelnation / http://github.com/abelnation
 * @author Mugen87 / http://github.com/Mugen87
 * @author WestLangley / http://github.com/WestLangley
 *
 *  This helper must be added as a child of the light
 */

import { Line } from '../objects/Line.js';
import { Mesh } from '../objects/Mesh.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { BackSide } from '../constants.js';

function RectAreaLightHelper( light, color ) {

	this.type = 'RectAreaLightHelper';

	this.light = light;

	this.color = color; // optional hardwired color for the helper

	var positions = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, - 1, 0, 1, 1, 0 ];

	var geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
	geometry.computeBoundingSphere();

	var material = new LineBasicMaterial( { fog: false } );

	Line.call( this, geometry, material );

	//

	var positions2 = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, - 1, 0, 1, - 1, 0 ];

	var geometry2 = new BufferGeometry();
	geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
	geometry2.computeBoundingSphere();

	this.add( new Mesh( geometry2, new MeshBasicMaterial( { side: BackSide, fog: false } ) ) );

	this.update();

}

RectAreaLightHelper.prototype = Object.create( Line.prototype );
RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;

RectAreaLightHelper.prototype.update = function () {

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

};

RectAreaLightHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();
	this.children[ 0 ].geometry.dispose();
	this.children[ 0 ].material.dispose();

};

export { RectAreaLightHelper };
