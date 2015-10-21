BlinnPhongMaterial material;
material.specularColor = specular;
material.specularShininess = shininess;
material.diffuseColor = diffuseColor.rgb;

#ifdef METAL

	material.diffuseColor = vec3( 0.0 );

#endif

#if defined( ENERGY_PRESERVING_RGB )

	material.diffuseColor *= whiteCompliment( specular );

#elif defined( ENERGY_PRESERVING_MONOCHROME )

	material.diffuseColor *= whiteCompliment( luminance( specular ) );

#endif
