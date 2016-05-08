/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *	uvOffset: new THREE.Vector2(),
 *	uvScale: new THREE.Vector2()
 * }
 */

THREE.SpriteMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.SpriteMaterial, THREE.Material, {

	type: 'SpriteMaterial',

	DefaultState: {

		color: new THREE.Color( 0xffffff ),
		map: null,

		rotation: 0,

		fog: false,
		lights: false
	}

} );
