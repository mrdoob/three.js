/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';
import { Object3D } from '../core/Object3D.js';
import { Mesh } from '../objects/Mesh.js';
import { VertexColors } from '../constants.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { OctahedronBufferGeometry } from '../geometries/OctahedronGeometry.js';
import { BufferAttribute } from '../core/BufferAttribute.js';

var _vector = new Vector3();
var _color1 = new Color();
var _color2 = new Color();

function HemisphereLightHelper( light, size, color ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	this.color = color;

	var geometry = new OctahedronBufferGeometry( size );
	geometry.rotateY( Math.PI * 0.5 );

	this.material = new MeshBasicMaterial( { wireframe: true, fog: false } );
	if ( this.color === undefined ) this.material.vertexColors = VertexColors;

	var position = geometry.getAttribute( 'position' );
	var colors = new Float32Array( position.count * 3 );

	geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) );

	this.add( new Mesh( geometry, this.material ) );

	this.update();

}

HemisphereLightHelper.prototype = Object.create( Object3D.prototype );
HemisphereLightHelper.prototype.constructor = HemisphereLightHelper;

HemisphereLightHelper.prototype.dispose = function () {

	this.children[ 0 ].geometry.dispose();
	this.children[ 0 ].material.dispose();

};

HemisphereLightHelper.prototype.update = function () {

	var mesh = this.children[ 0 ];

	if ( this.color !== undefined ) {

		this.material.color.set( this.color );

	} else {

		var colors = mesh.geometry.getAttribute( 'color' );

		_color1.copy( this.light.color );
		_color2.copy( this.light.groundColor );

		for ( var i = 0, l = colors.count; i < l; i ++ ) {

			var color = ( i < ( l / 2 ) ) ? _color1 : _color2;

			colors.setXYZ( i, color.r, color.g, color.b );

		}

		colors.needsUpdate = true;

	}

	mesh.lookAt( _vector.setFromMatrixPosition( this.light.matrixWorld ).negate() );

};


export { HemisphereLightHelper };
