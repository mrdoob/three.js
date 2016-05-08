/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *  linecap: "round",
 *  linejoin: "round"
 * }
 */

THREE.LineBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.LineBasicMaterial, THREE.Material, {

	type: 'LineBasicMaterial',

	DefaultState: {

		color: new THREE.Color( 0xffffff ),

		linewidth: 1,
		linecap: 'round',
		linejoin: 'round',

		lights: false

	}

} );
