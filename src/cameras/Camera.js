/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
*/

import { Matrix4 } from '../math/Matrix4.js';
import { Quaternion } from '../math/Quaternion.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';

function Camera() {

	Object3D.call( this );

	this.type = 'Camera';

	this.matrixWorldInverse = new Matrix4();
	this.projectionMatrix = new Matrix4();

}

Camera.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Camera,

	isCamera: true,

	copy: function ( source, recursive ) {

		Object3D.prototype.copy.call( this, source, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );
		this.projectionMatrix.copy( source.projectionMatrix );

		return this;

	},

	getWorldDirection: function () {

		var quaternion = new Quaternion();

		return function getWorldDirection( target ) {

			if ( target === undefined ) {

				console.warn( 'THREE.Camera: .getWorldDirection() target is now required' );
				target = new Vector3();

			}

			this.getWorldQuaternion( quaternion );

			return target.set( 0, 0, - 1 ).applyQuaternion( quaternion );

		};

	}(),

	updateMatrixWorld: function ( force ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		this.matrixWorldInverse.getInverse( this.matrixWorld );

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

} );

export { Camera };
