export default /* glsl */`
#ifdef USE_TRANSMISSION

	#ifdef USE_TRANSMISSIONMAP

		totalTransmission *= texture2D( transmissionMap, vUv ).r;

	#endif

	#ifdef USE_THICKNESSNMAP

		thicknessFactor *= texture2D( thicknessMap, vUv ).g;

	#endif

	vec3 pos = vWorldPosition.xyz / vWorldPosition.w;
	vec3 v = normalize( cameraPosition - pos );
	vec3 viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
	float ior = ( 1.0 + 0.4 * reflectivity ) / ( 1.0 - 0.4 * reflectivity );

	// From https://google.github.io/filament/Filament.html#materialsystem/parameterization/remapping
	vec3 f0 = vec3( pow( ior - 1.0, 2.0 ) / pow( ior + 1.0, 2.0 ) );
	vec3 f90 = vec3( 1.0 );

	vec3 f_transmission = totalTransmission * getIBLVolumeRefraction(
		normal, v, viewDir, roughnessFactor, diffuseColor.rgb, f0, f90,
		pos, modelMatrix, viewMatrix, projectionMatrix, ior, thicknessFactor,
		attenuationColor, attenuationDistance);

	diffuseColor.rgb = mix( diffuseColor.rgb, f_transmission, totalTransmission );

#endif
`;
