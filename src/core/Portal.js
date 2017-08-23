import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
import { Object3D } from '../core/Object3D';
import { Vector3 } from '../math/Vector3';

function Portal( parameters ) {

	this.scene = parameters.scene;
	this.target = parameters.target;
	this.mirror = parameters.mirror || false;

}

Object.assign( Portal.prototype, {

	constructor: Portal,

	clone: function ( recursive ) {

		return new this.constructor().copy( this, recursive );

	},

	copy: function ( source, recursive ) {

		this.scene = source.scene;
		this.target = source.target;
		this.mirror = source.mirror;

		return this;

	},

} );

export { Portal };
