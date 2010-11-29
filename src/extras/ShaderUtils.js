var ShaderUtils = {

	lib: { 'fresnel': {
		
			uniforms: { 
			
			"mRefractionRatio": { type: "f", value: 1.02 },
			"mFresnelBias": 	{ type: "f", value: 0.1 },
			"mFresnelPower":    { type: "f", value: 2.0 },
			"mFresnelScale":    { type: "f", value: 1.0 },
			"tCube":			{ type: "t", value: 1, texture: null }
			
			},
			
			fragment_shader: [
			
			"uniform samplerCube tCube;",
			
			"varying vec3 vReflect;",
			"varying vec3 vRefract[3];",
			"varying float vReflectionFactor;",
			
			"void main() {",
				"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
				"vec4 refractedColor = vec4( 1.0, 1.0, 1.0, 1.0 );",
				
				"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
				"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
				"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",
				"refractedColor.a = 1.0;",
				
				"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",
			"}"	
			].join("\n"),
				
			vertex_shader: [
			
			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec3 uv;",
			
			"uniform mat4 objMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			
			"uniform vec3 cameraPosition;",
			
			"uniform float mRefractionRatio;",
			"uniform float mFresnelBias;",
			"uniform float mFresnelScale;",
			"uniform float mFresnelPower;",

			"varying vec3 vReflect;",
			"varying vec3 vRefract[3];",
			"varying float vReflectionFactor;",

			"void main(void) {",
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec4 mPosition = objMatrix * vec4( position, 1.0 );",
				
				"vec3 nWorld = normalize ( mat3( objMatrix[0].xyz, objMatrix[1].xyz, objMatrix[2].xyz ) * normal );",
				
				"vec3 I = mPosition.xyz - cameraPosition;",
				
				"vReflect = reflect( I, nWorld );",
				"vRefract[0] = refract( normalize( I ), nWorld, mRefractionRatio );",
				"vRefract[1] = refract( normalize( I ), nWorld, mRefractionRatio * 0.99 );",
				"vRefract[2] = refract( normalize( I ), nWorld, mRefractionRatio * 0.98 );",
				"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), nWorld ), mFresnelPower );",
				
				"gl_Position = projectionMatrix * mvPosition;",
			"}"	
			].join("\n")
			
		}
	}

};
