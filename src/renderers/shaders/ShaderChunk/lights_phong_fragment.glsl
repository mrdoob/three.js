BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;

#ifdef METAL

	material.diffuseColor = vec3( 0.0 );

#endif