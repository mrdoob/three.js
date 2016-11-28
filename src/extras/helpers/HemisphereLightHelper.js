import { Vector3 } from '../../math/Vector3';
import { Color } from '../../math/Color';
import { Object3D } from '../../core/Object3D';
import { Mesh } from '../../objects/Mesh';
import { VertexColors } from '../../constants';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial';
import { OctahedronBufferGeometry } from '../../geometries/OctahedronBufferGeometry';
import { BufferAttribute } from '../../core/BufferAttribute';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

function HemisphereLightHelper( light, size ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	var geometry = new OctahedronBufferGeometry( size );
	geometry.rotateY( Math.PI * 0.5 );

	var material = new MeshBasicMaterial( { vertexColors: VertexColors, wireframe: true } );

	var position = geometry.getAttribute( 'position' );
	var colors = new Float32Array( position.count * 3 );

	geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) );

	this.add( new Mesh( geometry, material ) );

	this.update();

}

HemisphereLightHelper.prototype = Object.create( Object3D.prototype );
HemisphereLightHelper.prototype.constructor = HemisphereLightHelper;

HemisphereLightHelper.prototype.dispose = function () {

	this.children[ 0 ].geometry.dispose();
	this.children[ 0 ].material.dispose();

};

HemisphereLightHelper.prototype.update = function () {

	var vector = new Vector3();

	var color1 = new Color();
	var color2 = new Color();

	return function update() {

		var mesh = this.children[ 0 ];

		var colors = mesh.geometry.getAttribute( 'color' );

		color1.copy( this.light.color ).multiplyScalar( this.light.intensity );
		color2.copy( this.light.groundColor ).multiplyScalar( this.light.intensity );

		for ( var i = 0, l = colors.count; i < l; i ++ ) {

			var color = ( i < ( l / 2 ) ) ? color1 : color2;

			colors.setXYZ( i, color.r, color.g, color.b );

		}

		mesh.lookAt( vector.setFromMatrixPosition( this.light.matrixWorld ).negate() );

		colors.needsUpdate = true;

	};

}();


export { HemisphereLightHelper };
