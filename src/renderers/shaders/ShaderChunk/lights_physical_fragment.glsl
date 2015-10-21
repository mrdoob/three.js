PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.specularRoughness = roughnessFactor * 0.5 + 0.5; // disney's remapping of [ 0, 1 ] roughness to [ 0.5, 1 ]
material.specularColor = mix( vec3( 0.04 ) * reflectivity, diffuseColor.rgb, metalnessFactor );

#if defined( ENERGY_PRESERVING_RGB )

	material.diffuseColor *= whiteCompliment( specularColor );

#elif defined( ENERGY_PRESERVING_MONOCHROME )

	material.diffuseColor *= whiteCompliment( luminance( specularColor ) );

#endif