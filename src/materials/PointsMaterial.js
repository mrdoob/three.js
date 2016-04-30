/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>
 * }
 */

THREE.PointsMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.PointsMaterial, THREE.Material, {

	type: 'PointsMaterial',

	DefaultState: {

		color: new THREE.Color( 0xffffff ),

		map: null,

		size: 1,
		sizeAttenuation: true,

		lights: false

	}

} );
