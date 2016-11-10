#ifdef USE_INSTANCING

	#ifdef USE_INSTANCING_TEXTURE

		uniform sampler2D instancingTexture;
		uniform int instancingTextureSize;

		mat4 getModelMatrix() {

			float dx = 1.0 / float( instancingTextureSize );
			float dy = 1.0 / float( instancingTextureSize );

			float j = instanceIndex * 4.0;
			float x = mod( j, float( instancingTextureSize ) );
			float y = floor( j * dy );

			y = dy * ( y + 0.5 );

			vec4 v1 = texture2D( instancingTexture, vec2( dx * ( x + 0.5 ), y ) );
			vec4 v2 = texture2D( instancingTexture, vec2( dx * ( x + 1.5 ), y ) );
			vec4 v3 = texture2D( instancingTexture, vec2( dx * ( x + 2.5 ), y ) );
			vec4 v4 = texture2D( instancingTexture, vec2( dx * ( x + 3.5 ), y ) );

			return mat4( v1, v2, v3, v4 );

		}

		mat3 getNormalMatrix() {

			float j = float( MAX_INSTANCES ) * 4.0 + instanceIndex * 3.0;

			float dx = 1.0 / float( instancingTextureSize );
			float dy = dx;

			vec2 coord;

			coord.x = dx * ( mod( j, float( instancingTextureSize ) ) + 0.5 );
			coord.y = dy * ( floor( j * dy ) + 0.5 );
			vec3 v1 = texture2D( instancingTexture, coord ).xyz;

			coord.x = dx * ( mod( j + 1.0, float( instancingTextureSize ) ) + 0.5 );
			coord.y = dy * ( floor( ( j + 1.0 ) * dy ) + 0.5 );
			vec3 v2 = texture2D( instancingTexture, coord ).xyz;

			coord.x = dx * ( mod( j + 2.0, float( instancingTextureSize ) ) + 0.5 );
			coord.y = dy * ( floor( ( j + 2.0 ) * dy ) + 0.5 );
			vec3 v3 = texture2D( instancingTexture, coord ).xyz;

			return mat3( v1, v2, v3 );

		}

	#elif defined USE_INSTANCING_ATTRIBUTES

		mat4 getModelMatrix() {

			return mat4( instanceWorld1, instanceWorld2, instanceWorld3, instanceWorld4 );

		}

		mat3 getNormalMatrix() {

			return mat3( instanceNormal1, instanceNormal2, instanceNormal3 );

		}

	#endif

#else

	uniform mat4 modelMatrix;
	uniform mat4 modelViewMatrix;
	uniform mat3 normalMatrix;

#endif
