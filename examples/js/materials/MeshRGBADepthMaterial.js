( function () {

	/**
	 * @author Maxime Quiblier / http://github.com/maximeq
	 * Material packing depth as rgba values.
	 * It is basically just MeshDepthMaterial with depthPacking at THREE.RGBADepthPacking
	 */
	class MeshRGBADepthMaterial extends THREE.MeshDepthMaterial {

		constructor( parameters ) {

			parameters = parameters || {};
			parameters.depthPacking = THREE.RGBADepthPacking;
			super( parameters );

		}

	}

	THREE.MeshRGBADepthMaterial = MeshRGBADepthMaterial;

} )();
