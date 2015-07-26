/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

 THREE.AnimationUtils = {

 	// TODO/OPTIMIZATION: do the switch statement once per user of this and cache the resulting function and call it directly.
 	// TODO/OPTIMIZATION: Accumulator should be writable and it will get rid of the *.clone() calls that are likely slow.
 	lerp: function( accumulator, b, alpha, interTrack ) {

		var typeName = typeof accumulator;
		switch( typeName ) {
		 	case "object": {

				if( accumulator.lerp ) {

					return accumulator.clone().lerp( b, alpha );

				}
				if( accumulator.slerp ) {

					return accumulator.clone().slerp( b, alpha );

				}
				break;
			}
		 	case "number": {
				return accumulator * ( 1 - alpha ) + b * alpha;
		 	}	
		 	case "boolean": {
		 		if( interTrack ) {
		 			return ( alpha < 0.5 ) ? accumulator : b;
		 		}
		 		else {
		 			return accumulator;
		 		}
		 	}
		 	case "string": {
		 		if( interTrack ) {
		 			return ( alpha < 0.5 ) ? accumulator : b;
		 		}
		 		else {
			 		return accumulator;		 		
			 	}
		 	}
		};

	}
	
};