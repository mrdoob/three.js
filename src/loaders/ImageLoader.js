/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function () {

	THREE.EventTarget.call( this );

	var _this = this;

	this.crossOrigin = 'anonymous';

	this.load = function ( url ) {

		var image = new Image();
		image.addEventListener( 'load', function () {

			_this.dispatchEvent( { type: 'complete', image: image } );

		}, false );
		image.addEventListener( 'error', function () {
		
			_this.dispatchEvent( { type: 'error', image: image } ); 
		
		}, false );
		image.crossOrigin = this.crossOrigin;
		image.src = url;

	};

};
