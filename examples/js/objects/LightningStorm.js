/**
 * @author yomboprime https://github.com/yomboprime
 *
 * @fileoverview Lightning strike object generator
 *
 *
 * Usage
 *
 * var myStorm = new THREE.LightningStorm( paramsObject );
 * myStorm.position.set( ... );
 * scene.add( myStorm );
 * ...
 * myStorm.update( currentTime );
 *
 * The "currentTime" can only go forwards or be stopped.
 *
 *
 * LightningStorm parameters:
 *
 * @param {double} size Size of the storm. If no 'onRayPosition' parameter is defined, it means the side of the rectangle the storm covers.
 *
 * @param {double} minHeight Minimum height a ray can start at. If no 'onRayPosition' parameter is defined, it means the height above plane y = 0.
 *
 * @param {double} maxHeight Maximum height a ray can start at. If no 'onRayPosition' parameter is defined, it means the height above plane y = 0.
 *
 * @param {double} maxSlope The maximum inclination slope of a ray. If no 'onRayPosition' parameter is defined, it means the slope relative to plane y = 0.
 *
 * @param {integer} maxLightnings Greater than 0. The maximum number of simultaneous rays.
 *
 * @param {double} lightningMinPeriod minimum time between two consecutive rays.
 *
 * @param {double} lightningMaxPeriod maximum time between two consecutive rays.
 *
 * @param {double} lightningMinDuration The minimum time a ray can last.
 *
 * @param {double} lightningMaxDuration The maximum time a ray can last.
 *
 * @param {Object} lightningParameters The parameters for created rays. See THREE.LightningStrike (geometry)
 *
 * @param {Material} lightningMaterial The THREE.Material used for the created rays.
 *
 * @param {function} onRayPosition Optional callback with two Vector3 parameters (source, dest). You can set here the start and end points for each created ray, using the standard size, minHeight, etc parameters and other values in your algorithm.
 *
 * @param {function} onLightningDown This optional callback is called with one parameter (lightningStrike) when a ray ends propagating, so it has hit the ground.
 *
 *
*/

THREE.LightningStorm = function ( stormParams ) {

	THREE.Object3D.call( this );

	// Parameters

	stormParams = stormParams || {};
	this.stormParams = stormParams;

	stormParams.size = stormParams.size !== undefined ? stormParams.size : 1000.0;
	stormParams.minHeight = stormParams.minHeight !== undefined ? stormParams.minHeight : 80.0;
	stormParams.maxHeight = stormParams.maxHeight !== undefined ? stormParams.maxHeight : 100.0;
	stormParams.maxSlope = stormParams.maxSlope !== undefined ? stormParams.maxSlope : 1.1;

	stormParams.maxLightnings = stormParams.maxLightnings !== undefined ? stormParams.maxLightnings : 3;

	stormParams.lightningMinPeriod = stormParams.lightningMinPeriod !== undefined ? stormParams.lightningMinPeriod : 3.0;
	stormParams.lightningMaxPeriod = stormParams.lightningMaxPeriod !== undefined ? stormParams.lightningMaxPeriod : 7.0;

	stormParams.lightningMinDuration = stormParams.lightningMinDuration !== undefined ? stormParams.lightningMinDuration : 1.0;
	stormParams.lightningMaxDuration = stormParams.lightningMaxDuration !== undefined ? stormParams.lightningMaxDuration : 2.5;

	this.lightningParameters = THREE.LightningStrike.copyParameters( stormParams.lightningParameters, stormParams.lightningParameters );

	this.lightningParameters.isEternal = false;

	this.lightningMaterial = stormParams.lightningMaterial !== undefined ? stormParams.lightningMaterial : new THREE.MeshBasicMaterial( { color: 0xB0FFFF } );

	if ( stormParams.onRayPosition !== undefined ) {

		this.onRayPosition = stormParams.onRayPosition;

	} else {

		this.onRayPosition = function ( source, dest ) {

			dest.set( ( Math.random() - 0.5 ) * stormParams.size, 0, ( Math.random() - 0.5 ) * stormParams.size );

			var height = THREE.Math.lerp( stormParams.minHeight, stormParams.maxHeight, Math.random() );

			source.set( stormParams.maxSlope * ( 2 * Math.random() - 1 ), 1, stormParams.maxSlope * ( 2 * Math.random() - 1 ) ).multiplyScalar( height ).add( dest );

		};

	}

	this.onLightningDown = stormParams.onLightningDown;

	// Internal state

	this.inited = false;
	this.nextLightningTime = 0;
	this.lightningsMeshes = [];
	this.deadLightningsMeshes = [];

	for ( var i = 0; i < this.stormParams.maxLightnings; i ++ ) {

		var lightning = new THREE.LightningStrike( THREE.LightningStrike.copyParameters( {}, this.lightningParameters ) );
		var mesh = new THREE.Mesh( lightning, this.lightningMaterial );
		this.deadLightningsMeshes.push( mesh );

	}

};

THREE.LightningStorm.prototype = Object.create( THREE.Object3D.prototype );

THREE.LightningStorm.prototype.constructor = THREE.LightningStorm;

THREE.LightningStorm.prototype.isLightningStorm = true;

THREE.LightningStorm.prototype.update = function ( time ) {

	if ( ! this.inited ) {

		this.nextLightningTime = this.getNextLightningTime( time ) * Math.random();
		this.inited = true;

	}

	if ( time >= this.nextLightningTime ) {

		// Lightning creation

		var lightningMesh = this.deadLightningsMeshes.pop();

		if ( lightningMesh ) {

			var lightningParams1 = THREE.LightningStrike.copyParameters( lightningMesh.geometry.rayParameters, this.lightningParameters );

			lightningParams1.birthTime = time;
			lightningParams1.deathTime = time + THREE.Math.lerp( this.stormParams.lightningMinDuration, this.stormParams.lightningMaxDuration, Math.random() );

			this.onRayPosition( lightningParams1.sourceOffset, lightningParams1.destOffset );

			lightningParams1.noiseSeed = Math.random();

			this.add( lightningMesh );

			this.lightningsMeshes.push( lightningMesh );

		}

		// Schedule next lightning
		this.nextLightningTime = this.getNextLightningTime( time );

	}

	var i = 0, il = this.lightningsMeshes.length;

	while ( i < il ) {

		var mesh = this.lightningsMeshes[ i ];

		var lightning = mesh.geometry;

		var prevState = lightning.state;

		lightning.update( time );

		if ( prevState === THREE.LightningStrike.RAY_PROPAGATING && lightning.state > prevState ) {

			if ( this.onLightningDown ) {

				this.onLightningDown( lightning );

			}

		}

		if ( lightning.state === THREE.LightningStrike.RAY_EXTINGUISHED ) {

			// Lightning is to be destroyed

			this.lightningsMeshes.splice( this.lightningsMeshes.indexOf( mesh ), 1 );

			this.deadLightningsMeshes.push( mesh );

			this.remove( mesh );

			il --;

		} else {

			i ++;

		}

	}

};

THREE.LightningStorm.prototype.getNextLightningTime = function ( currentTime ) {

	return currentTime + THREE.Math.lerp( this.stormParams.lightningMinPeriod, this.stormParams.lightningMaxPeriod, Math.random() ) / ( this.stormParams.maxLightnings + 1 );

};

THREE.LightningStorm.prototype.copy = function ( source ) {

	THREE.Object3D.prototype.copy.call( this, source );

	this.stormParams.size = source.stormParams.size;
	this.stormParams.minHeight = source.stormParams.minHeight;
	this.stormParams.maxHeight = source.stormParams.maxHeight;
	this.stormParams.maxSlope = source.stormParams.maxSlope;

	this.stormParams.maxLightnings = source.stormParams.maxLightnings;

	this.stormParams.lightningMinPeriod = source.stormParams.lightningMinPeriod;
	this.stormParams.lightningMaxPeriod = source.stormParams.lightningMaxPeriod;

	this.stormParams.lightningMinDuration = source.stormParams.lightningMinDuration;
	this.stormParams.lightningMaxDuration = source.stormParams.lightningMaxDuration;

	this.lightningParameters = THREE.LightningStrike.copyParameters( {}, source.lightningParameters );

	this.lightningMaterial = source.stormParams.lightningMaterial;

	this.onLightningDown = source.onLightningDown;

	return this;

};

THREE.LightningStrike.prototype.clone = function () {

	return new this.constructor( this.stormParams ).copy( this );

};
