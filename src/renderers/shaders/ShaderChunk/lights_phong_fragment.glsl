BlinnPhongMaterial material;
material.specularColor = specular;
material.specularShininess = shininess;
material.diffuseColor = diffuseColor.rgb;

#ifdef METAL

	material.diffuseColor = vec3( 0.0 );

#endif