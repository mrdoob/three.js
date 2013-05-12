/**
 * @author possan / http://possan.se/
 *
 * Oculus headtracking control
 * - use together with the oculus-rest project to get headtracking
 *   coordinates from the rift: http://github.com/possan/oculus-rest
 */

THREE.OculusControls = function ( object ) {
	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.headquat = new THREE.Quaternion();
	this.freeze = false;

	this.object.useQuaternion = true;

	this.loadAjaxJSON = function ( url, callback ) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === xhr.DONE ) {
				if ( xhr.status === 200 || xhr.status === 0 ) {
					if ( xhr.responseText ) {
						var json = JSON.parse( xhr.responseText );
						callback( json );
					}
				}
			}
		};
		xhr.open( "GET", url, true );
		xhr.withCredentials = false;
		xhr.send( null );
	};

	this.gotCoordinates = function( r ) {
		this.headquat.set(r.quat.x, r.quat.y, r.quat.z, r.quat.w);
		this.queuePoll();
	}

	this.pollOnce = function() {
		this.loadAjaxJSON('http://localhost:50000', bind(this, this.gotCoordinates));
	}

	this.queuePoll = function() {
		setTimeout(bind(this, this.pollOnce), 10);
	}

	this.update = function( delta ) {
		if ( this.freeze ) {
			return;
		}

		this.object.quaternion.multiply(this.headquat);
	};

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};

	this.connect = function() {
		this.queuePoll();
	};
};
