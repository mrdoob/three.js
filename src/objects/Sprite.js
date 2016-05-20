/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Sprite = function ( material ) {

	THREE.Object3D.call( this );

	this.type = 'Sprite';

	this.material = ( material !== undefined ) ? material : new THREE.SpriteMaterial();

};

THREE.Sprite.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: THREE.Sprite,

	raycast: ( function () {

		var matrixPosition = new THREE.Vector3();

		return function raycast( raycaster, intersects ) {

			matrixPosition.setFromMatrixPosition( this.matrixWorld );

			var distanceSq = raycaster.ray.distanceSqToPoint( matrixPosition );
			var guessSizeSq = this.scale.x * this.scale.y / 4;

			if ( distanceSq > guessSizeSq ) {

				return;

			}

			intersects.push( {

				distance: Math.sqrt( distanceSq ),
				point: this.position,
				face: null,
				object: this

			} );

		};

	}() ),

	clone: function () {

		return new this.constructor( this.material ).copy( this );

	}

} );
