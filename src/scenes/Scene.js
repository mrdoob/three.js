/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	this.objects = [];
	// this.lights = [];

	this.addObject = function ( object ) {

		this.objects.push(object);

	};

	this.removeObject = function ( object ) {

		for ( var i = 0, l = this.objects.length; i < l; i++ ) {

			if ( object == this.objects[ i ] ) {

				this.objects.splice( i, 1 );
				return;

			}
		}
	}

	// Deprecated
	this.add = function ( object ) {

		this.addObject( object );

	};

	this.toString = function () {

		return 'THREE.Scene ( ' + this.objects + ' )';
	};

};
