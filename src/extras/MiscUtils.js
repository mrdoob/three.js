/**
 * @author greggman / http://greggman.com/
 */
 
THREE.requestAnimationFrame = function( element, callback ) {

	if ( ! THREE.requestAnimationFrameImpl_ ) {
	
		THREE.requestAnimationFrameImpl_ = function() {
	  
			var objects = [ element, window ];
			
			var functionNames = [
				"requestAnimationFrame",
				"webkitRequestAnimationFrame",
				"mozRequestAnimationFrame",
				"operaRequestAnimationFrame",
				"requestAnimationFrame"
			];
	  
			var functions = [
			
				function ( name ) {
				
					return function( element, callback ) {
						
								element[ name ].call( element, callback );
						
							};

				},
				
			
				function ( name ) {
			  
					return function( element, callback ) {
						
						window[ name ].call( window, callback );

					};

				}

			];
		  
			for ( var ii = 0; ii < objects.length; ++ii ) {
			
				var obj = objects[ ii ];
				for ( var jj = 0; jj < functionNames.length; ++jj ) {
				
					var functionName = functionNames[ jj ];
					if ( obj[ functionName ] ) {
				
						console.log( "using ", functionName );
						return functions[ ii ]( functionName );

					}
					
				}

			}
			
			console.log( "using window.setTimeout" );
			
			return function( element, callback ) {
			
			   window.setTimeout(callback, 1000 / 70);
			   
			};
		
		}();
	}

	THREE.requestAnimationFrameImpl_( element, callback );

};
