/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *
 *  scale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>
 * }
 */

THREE.LineDashedMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.LineDashedMaterial, THREE.Material, {

	type: 'LineDashedMaterial',

	DefaultState: {
		color: new THREE.Color( 0xffffff ),

		linewidth: 1,

		scale: 1,
		dashSize: 3,
		gapSize: 1,

		lights: false,
	}

} );
