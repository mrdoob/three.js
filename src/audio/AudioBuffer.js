/**
 * @author mrdoob / http://mrdoob.com/
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */

THREE.AudioBuffer = function( context ) {

	console.warn( 'THREE.AudioBuffer has been deprecated. Please use THREE.AudioLoader.' );

	this.context = context;

};

THREE.AudioBuffer.prototype.load = function( file ) {

	console.warn( 'THREE.AudioBuffer: .load has been deprecated. Please use THREE.AudioLoader.' );

	var audioLoader = new THREE.AudioLoader( this.context );

	audioLoader.load( file, function( buffer ) {
		return buffer;
	});

};

THREE.AudioBuffer.prototype.onReady = function( callback ) {

	console.warn( 'THREE.AudioBuffer: .onReady has been deprecated. Please use THREE.AudioLoader.' );

};
