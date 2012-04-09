/**
 * @author huwb / http://huwbowles.com/
 *
 */
 
 THREE.ShaderGodRays = {
	/* -------------------------------------------------------------------------
	//	God-rays
	//	Possibly the same as the implementation in CryEngine 2 (Sousa2008).
	//	http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
	 ------------------------------------------------------------------------- */

	'godrays_fake_sun'	: {

	    uniforms: { vSunPositionScreenSpace:  { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
				    fAspect:     { type: "f", value: 1.0 },
			      },

	    vertexShader: [

	        "varying vec2 vUv;",
        	
	        "void main() {",
		        "vUv = vec2( uv.x, 1.0 - uv.y );",
		        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	        "}"

	    ].join("\n"),

	    fragmentShader: [

	        "varying vec2 vUv;",

            "uniform vec2 vSunPositionScreenSpace;",
            "uniform float fAspect;",
            
	        "void main() {",
	            "vec2 diff = vUv-vSunPositionScreenSpace;",
	            "diff.x *= fAspect;",
	            "float prop = clamp(length(diff)/.5,0.,1.);",
    	        "prop = .35*pow( 1.0 - prop, 3. ) ;",
                "gl_FragColor = vec4(prop,prop,0.2,1.);",
	        "}"

	    ].join("\n")

	},
	
	'godrays_generate'	: {

	    uniforms: { tInput:   { type: "t", value: 0, texture: null },
				    fStepSize:     { type: "f", value: 1.0 },
    			    vSunPositionScreenSpace:  { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
			      },

	    vertexShader: [

	        "varying vec2 vUv;",
        	
	        "void main() {",

		        "vUv = vec2( uv.x, 1.0 - uv.y );",
        		
		        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	        "}"

	    ].join("\n"),

	    fragmentShader: [

	        "varying vec2 vUv;",

	        "uniform sampler2D tInput;",
        	
            "uniform vec2 vSunPositionScreenSpace;",
	        "uniform float fStepSize;",  	// filter step size
            
            "#define TAPS_PER_PASS 6.0",
            
	        "void main() {",
                
		        "vec2 delta = (vSunPositionScreenSpace - vUv);",
		        "vec2 uv = vUv.xy;",
        		
		        "float dist = length(delta);",
		        "vec2 stepv = fStepSize*delta/dist;",
		        "float iters = dist/fStepSize;", // floor unnecessary
        		
		        "float col = 0.0;",
		        
                //unrolling didnt do much on my hardware so i've just left the loop
		        "for (float i = 0.0; i < TAPS_PER_PASS; i+=1.0 ) {",
        		    
    		        // accumulate samples, making sure we dont walk past the light source
		            "col += (i <= iters && uv.y<1. ? texture2D( tInput, uv ).r : .0) ;",
		            "uv += stepv;",
		        "}",
        		
		        // should technically be dividing by iters but TAPS_PER_PASS smooths out
		        // objectionable artifacts in particular near the sun position.
		        "gl_FragColor = vec4( col/TAPS_PER_PASS );",
		        "gl_FragColor.a = 1.;",
		        /*
		        */
	        "}"

	    ].join("\n")

	},

	'godrays_combine'	: {

	    uniforms: { tColors:   { type: "t", value: 0, texture: null },
	                tGodRays:   { type: "t", value: 1, texture: null },
				    fGodRayIntensity:     { type: "f", value: 0.69 },
    			    vSunPositionScreenSpace:  { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
			      },

	    vertexShader: [

	    "varying vec2 vUv;",
    	
	    "void main() {",

		    "vUv = vec2( uv.x, 1.0 - uv.y );",
    		
		    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	    "}"

	    ].join("\n"),

	    fragmentShader: [

	    "varying vec2 vUv;",

	    "uniform sampler2D tColors;",
	    "uniform sampler2D tGodRays;",
    	
        "uniform vec2 vSunPositionScreenSpace;",
	    "uniform float fGodRayIntensity;",  	// filter step size
        
	    "void main() {",
            "gl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity*vec4( 1.-texture2D( tGodRays, vUv ).r );",
            "gl_FragColor.a = 1.;",
	    "}"

	    ].join("\n")

	}
 };
 