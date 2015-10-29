PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.specularRoughness = roughnessFactor * 0.5 + 0.5; // disney's remapping of [ 0, 1 ] roughness to [ 0.5, 1 ]
material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
material.grazingColor = mix( vec3( 1.0 ), diffuseColor.rgb, metalnessFactor );
