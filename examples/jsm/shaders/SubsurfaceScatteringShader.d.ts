import {
	Uniform
} from '../../../src/Three';

export const SubsurfaceScatteringShader: {
	uniforms: {
		alphaMap: Uniform;
		ambientLightColor: Uniform;
		color: Uniform;
		diffuse: Uniform;
		directionalLights: Uniform;
		directionalShadowMap: Uniform;
		directionalShadowMatrix: Uniform;
		emissive: Uniform;
		hemisphereLights: Uniform;
		lightProbe: Uniform;
		map: Uniform;
		opacity: Uniform;
		pointLights: Uniform;
		pointShadowMap: Uniform;
		pointShadowMatrix: Uniform;
		rectAreaLights: Uniform;
		shininess: Uniform;
		specular: Uniform;
		spotLights: Uniform;
		spotShadowMap: Uniform;
		spotShadowMatrix: Uniform;
		thicknessAmbient: Uniform;
		thicknessAttenuation: Uniform;
		thicknessColor: Uniform;
		thicknessDistortion: Uniform;
		thicknessMap: Uniform;
		thicknessPower: Uniform;
		thicknessScale: Uniform;
		uvTransform: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
