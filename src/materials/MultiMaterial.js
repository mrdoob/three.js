/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MultiMaterial = function ( materials ) {

	THREE.Asset.call( this );

	if ( materials instanceof Array ) {

		var myMaterials = this.materials;
		myMaterials.push.apply( myMaterials, materials );
	
	}

};

THREE.Asset.assignPrototype( THREE.MultiMaterial, THREE.Asset, {

	type: 'MultiMaterial',

	DefaultState: {

		materials: []
		visible: true,

	},

	serialize: function () {

		var output = THREE.Material.prototype.serialize.call( this );

		output.materials = [];

		// TODO: could now properly serialize to UUID

		var materials = this.materials;
		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			var data = materials[ i ].serialize( meta );
			output.materials.push( data );

		}

		return output;

	}

	// TODO custom deserialization

} );
