/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 */

THREE.Mesh = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = ( material !== undefined ) ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, wireframe: true } );

	if ( this.geometry ) {

		// calc bound radius

		if ( this.geometry.boundingSphere === null ) {

			this.geometry.computeBoundingSphere();

		}

		this.updateMorphTargets();

	}

};

THREE.Mesh.prototype = Object.create( THREE.Object3D.prototype );

THREE.Mesh.prototype.updateMorphTargets = function() {

	// setup morph targets

	var morphTargetAmount = this.geometry.morphTargets.length;

	if (!!morphTargetAmount) {

		// Initialize variables for morph targets if they don't exist.

		if ( !this.morphTargetInfluences ) {

			this.morphTargetBase = -1;
			this.morphTargetForcedOrder = [];
			this.morphTargetInfluences = [];
			this.morphTargetDictionary = {};

		}

		// Make sure that the influences amount is identical to geometry's
		// morph target amount.

		if ( this.morphTargetInfluences.length !== morphTargetAmount ) {
			this.morphTargetInfluences.length = morphTargetAmount;
		}

		for ( var m = 0; m < morphTargetAmount; m++ ) {

			this.morphTargetInfluences[ m ] = this.morphTargetInfluences[ m ] || 0;
			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

		}

	}

};

THREE.Mesh.prototype.getMorphTargetIndexByName = function ( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];

	}

	console.log( "THREE.Mesh.getMorphTargetIndexByName: morph target " + name + " does not exist. Returning -1." );

	return -1;	// Easier comparator similar to ecmascript 5 indexOf.

};

THREE.Mesh.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Mesh( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};
