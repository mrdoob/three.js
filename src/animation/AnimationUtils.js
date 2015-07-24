/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

 THREE.AnimationUtils = {

 	lerp: function( a, b, alpha ) {

		if( a.lerp ) {

			return a.clone().lerp( b, alpha );

		}
		else if( a.slerp ) {

			return a.clone().lerp( b, alpha );

		}
		else {

			return a * ( 1 - alpha ) + b * alpha;
			
		}
	}
	
};