import { Vector3 } from '../../math/Vector3';
import { Object3D } from '../../core/Object3D';
import { Mesh } from '../../objects/Mesh';
import { FaceColors } from '../../constants';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial';
import { SphereGeometry } from '../../geometries/SphereGeometry';
import { Color } from '../../math/Color';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

function HemisphereLightHelper( light, sphereSize ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	this.colors = [ new Color(), new Color() ];

	var geometry = new SphereGeometry( sphereSize, 4, 2 );
	geometry.rotateX( - Math.PI / 2 );

	for ( var i = 0, il = 8; i < il; i ++ ) {

		geometry.faces[ i ].color = this.colors[ i < 4 ? 0 : 1 ];

	}

	var material = new MeshBasicMaterial( { vertexColors: FaceColors, wireframe: true } );

	this.lightSphere = new Mesh( geometry, material );
	this.add( this.lightSphere );

	this.update();

}

HemisphereLightHelper.prototype = Object.create( Object3D.prototype );
HemisphereLightHelper.prototype.constructor = HemisphereLightHelper;

HemisphereLightHelper.prototype.dispose = function () {

	this.lightSphere.geometry.dispose();
	this.lightSphere.material.dispose();

};

HemisphereLightHelper.prototype.update = function () {

	var vector = new Vector3();

	return function update() {

		this.colors[ 0 ].copy( this.light.color ).multiplyScalar( this.light.intensity );
		this.colors[ 1 ].copy( this.light.groundColor ).multiplyScalar( this.light.intensity );

		this.lightSphere.lookAt( vector.setFromMatrixPosition( this.light.matrixWorld ).negate() );
		this.lightSphere.geometry.colorsNeedUpdate = true;

	};

}();


export { HemisphereLightHelper };
