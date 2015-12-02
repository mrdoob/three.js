StandardMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );
material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
