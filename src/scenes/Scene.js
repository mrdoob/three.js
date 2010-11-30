/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	this.objects = [];
	this.lights = [];

	this.addObject = function ( object ) {

		this.objects.push( object );

	};

	this.removeObject = function ( object ) {

		var i = this.objects.indexOf( object );

		if ( i !== -1 ) {

			this.objects.splice( i, 1 );

		}
		
	};

	this.addLight = function ( light ) {

		this.lights.push( light );

	};

	this.removeLight = function ( light ) {

		var i = this.lights.indexOf( light );

		if ( i !== -1 ) {

			this.lights.splice( i, 1 );

		}

	};

	this.toString = function () {

		return 'THREE.Scene ( ' + this.objects + ' )';
	};

};
