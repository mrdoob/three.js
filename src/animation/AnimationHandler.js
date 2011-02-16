/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.AnimationHandler = (function() {
	
	var playing = [];
	var that    = {};
	
	
	//--- update ---
	
	that.update = function( time ) {
		
		for( var i = 0; i < playing.length; i++ )
			playing[ i ].update( time );

	};
	
	
	//--- add ---
	
	that.add = function( animation ) {
		
		if( playing.indexOf( animation ) === -1 )
			playing.push( animation );

	};
	
	
	//--- remove ---
	
	that.remove = function( animation ) {
		
		var index = playing.indexOf( animation ); 
		
		if( index !== -1 )
			playing.splice( childIndex, 1 );

	};
	
	
	//--- init data ---
	
	that.initData = function( data ) {
		
		if( data.initialized === true )
			return;
		
		// loop through all keys		
		
		for( var h = 0; h < data.hierarchy.length; h++ ) {
			
			for( var k = 0; k < data.hierarchy[ h ].keys.length; k++ ) {
			
				// remove minus times
				
				if( data.hierarchy[ h ].keys[ k ].time < 0 )
					data.hierarchy[ h ].keys[ k ].time = 0;
			
			
				// set index
				
				data.hierarchy[ h ].keys[ k ].index = k;
		
			
				// create quaternions
			
				if( data.hierarchy[ h ].keys[ k ].rot !== undefined &&
				  !(data.hierarchy[ h ].keys[ k ].rot instanceof THREE.Quaternion )) {
					
					var quat = data.hierarchy[ h ].keys[ k ].rot;
					data.hierarchy[ h ].keys[ k ].rot = new THREE.Quaternion( quat[0], quat[1], quat[2], quat[3] ); 
				}	
			}
		}
		
		
		// JIT

		var lengthInFrames = parseInt( data.length * data.fps, 10 );
		
		data.JIT = {};
		data.JIT.hierarchy = [];
		
		for( var h = 0; h < data.hierarchy.length; h++ )
			data.JIT.hierarchy.push( new Array( lengthInFrames ));
		
		
		// done
		
		data.initialized = true;

	};
	
	return that;
}());
