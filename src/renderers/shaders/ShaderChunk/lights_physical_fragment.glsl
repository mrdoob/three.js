PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );
#ifdef STANDARD
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.16 * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );
#endif
