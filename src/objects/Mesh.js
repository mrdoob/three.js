/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 */

THREE.Mesh = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.updateMorphTargets();

};

THREE.Mesh.prototype = Object.create( THREE.Object3D.prototype );

THREE.Mesh.prototype.updateMorphTargets = function () {

	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {

		this.morphTargetBase = -1;
		this.morphTargetForcedOrder = [];
		this.morphTargetInfluences = [];
		this.morphTargetDictionary = {};

		for ( var m = 0, ml = this.geometry.morphTargets.length; m < ml; m ++ ) {

			this.morphTargetInfluences.push( 0 );
			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

		}

	}

};

THREE.Mesh.prototype.getMorphTargetIndexByName = function ( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];

	}

	console.log( "THREE.Mesh.getMorphTargetIndexByName: morph target " + name + " does not exist. Returning 0." );

	return 0;

};

THREE.Mesh.prototype.clone = function ( object, recursive ) {

	if ( object === undefined ) object = new THREE.Mesh( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object, recursive );

	return object;

};

THREE.Mesh.prototype.toJSON = function( exporters ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, exporters )
	
	data.type = 'Mesh';
	data.geometry = exporters.parseGeometry( this.geometry );
	data.material = exporters.parseMaterial( this.material );

	return data;

};

THREE.Mesh.fromJSON = function( data, geometries, materials ) {

	var geometry = geometries[ data.geometry ];
	var material = materials[ data.material ];

	if ( geometry === undefined ) {

		throw new Error( 'THREE.Mesh.fromJSON: Undefined geometry ' + data.geometry );

	}

	if ( material === undefined ) {

		throw new Error( 'THREE.Mesh.fromJSON: Undefined material ' + data.material );

	}

	var object = new THREE.Mesh( geometry, material );
	THREE.Object3D.fromJSONCommon.call( object, data, geometries, materials );
	return object;

};