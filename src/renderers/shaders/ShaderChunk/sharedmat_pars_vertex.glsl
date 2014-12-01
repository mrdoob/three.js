#ifdef USE_SHAREDMATERIAL

	attribute float sharedMaterialMatrixIndex;

	uniform float sharedMaterialMatricesTextureWidth;
	uniform sampler2D sharedMaterialMatricesTexture;

	mat4 getMatrixFromTexture( const in float i ) {

		float j = i * 4.0;
		float x = mod( j, float( sharedMaterialMatricesTextureWidth ) );
		float y = floor( j / float( sharedMaterialMatricesTextureWidth ) );

		float dx = 1.0 / float( sharedMaterialMatricesTextureWidth );
		float dy = 1.0 / float( sharedMaterialMatricesTextureWidth );

		y = dy * ( y + 0.5 );

		vec4 v1 = texture2D( sharedMaterialMatricesTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( sharedMaterialMatricesTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( sharedMaterialMatricesTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( sharedMaterialMatricesTexture, vec2( dx * ( x + 3.5 ), y ) );

		return mat4( v1, v2, v3, v4 );
		
	}

#endif
