PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );// * 0.5 + 0.5; // disney's remapping of [ 0, 1 ] roughness to [ 0.5, 1 ]
material.specularColor = mix( vec3( 0.04 ) * reflectivity, diffuseColor.rgb, metalnessFactor );
