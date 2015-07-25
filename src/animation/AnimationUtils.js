/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

 THREE.AnimationUtils = {

 	getLerpFunc: function( accumulator, b, alpha, interTrack ) {

		
		var typeName = typeof true;
		switch( typeName ) {
		 	case "object": {

				if( accumulator.lerp ) {

					return accumulator.lerp( b, alpha );

				}
				if( accumulator.slerp ) {

					return accumulator.lerp( b, alpha );

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