/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Sprite = ( function () {

	var indices = new Uint16Array( [ 0, 1, 2,  0, 2, 3 ] );
	var vertices = new Float32Array( [ - 0.5, - 0.5, 0,   0.5, - 0.5, 0,   0.5, 0.5, 0,   - 0.5, 0.5, 0 ] );
	var uvs = new Float32Array( [ 0, 0,   1, 0,   1, 1,   0, 1 ] );

	var geometry = new THREE.BufferGeometry();
	geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	return function Sprite( material ) {

		THREE.Object3D.call( this );

		this.type = 'Sprite';

		this.geometry = geometry;
		this.material = ( material !== undefined ) ? material : new THREE.SpriteMaterial();

	};

} )();

THREE.Sprite.prototype = Object.create( THREE.Object3D.prototype );
THREE.Sprite.prototype.constructor = THREE.Sprite;

THREE.Sprite.prototype.raycast = ( function () {

	var matrixPosition = new THREE.Vector3();

	return function raycast( raycaster, intersects ) {

		matrixPosition.setFromMatrixPosition( this.matrixWorld );

		var distanceSq = raycaster.ray.distanceSqToPoint( matrixPosition );
		var guessSizeSq = this.scale.x * this.scale.y;

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

}() );

THREE.Sprite.prototype.clone = function () {

	return new this.constructor( this.material ).copy( this );

};

// Backwards compatibility

THREE.Particle = THREE.Sprite;
