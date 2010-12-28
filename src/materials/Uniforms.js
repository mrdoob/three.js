var Uniforms = {
	
	clone: function( uniforms_src ) {
		
		var u, p, parameter, uniforms_dst = {};
		
		for ( u in uniforms_src ) {
			
			uniforms_dst[ u ] = {};
			
			for ( p in uniforms_src[ u ] ) {
				
				parameter_src = uniforms_src[ u ][ p ];
				
				if ( parameter_src instanceof THREE.Color ||
					 parameter_src instanceof THREE.Vector3 ||
					 parameter_src instanceof THREE.Texture ) {
				
					uniforms_dst[ u ][ p ] = parameter_src.clone();
					
				} else {
					
					uniforms_dst[ u ][ p ] = parameter_src;
					
				}
				
			}
			
		}
		
		return uniforms_dst;
		
	}
	
}
