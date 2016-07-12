/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

THREE.Bone = function ( skin ) {

	THREE.Object3D.call( this );

	this.type = 'Bone';

	this.skin = skin;

};

THREE.Bone.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: THREE.Bone,

	copy: function ( source ) {

		THREE.Object3D.prototype.copy.call( this, source );

		this.skin = source.skin;

		return this;

	}

} );
