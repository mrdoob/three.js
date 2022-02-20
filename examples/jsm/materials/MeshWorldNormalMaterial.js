import {
	Matrix4,
	ShaderLib,
	ShaderMaterial,
	TangentSpaceNormalMap,
	UniformsUtils,
	Vector2
} from "../../../build/three.module";

/**
 * @author Maxime Quiblier / http://github.com/maximeq
 *
 * This material will save world space normals in pixels, the way MeshNormalMaterial does for view space normals.
 * Use same parameters as for MeshNormalMaterial.
 *
 * You need to update the uniform viewMatrixInverse for this material to work properly.
 * If you don't want to do it by yourself, just call MeshWorldNormalMaterial.updateMeshOnBeforeRender on any mesh using this material.
 * see MeshWorldNormalMaterial.updateMeshOnBeforeRender for more details.
 */
export function MeshWorldNormalMaterial( parameters ) {

	parameters = parameters || {};

	parameters.uniforms = UniformsUtils.merge( [
		ShaderLib.normal.uniforms,
		{ viewMatrixInverse: { value: new Matrix4() } }
	] );
	parameters.vertexShader = ShaderLib.normal.vertexShader;
	parameters.fragmentShader =
		"uniform mat4 viewMatrixInverse;" + "\n" +
		ShaderLib.normal.fragmentShader.replace(
			"gl_FragColor = ",

			"normal = normalize(mat3(viewMatrixInverse) * normal);" + "\n" +
			"gl_FragColor = "
		);

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalMapType = TangentSpaceNormalMap;
	this.normalScale = new Vector2( 1, 1 );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false;
	this.lights = false;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.isMeshNormalMaterial = true;
	this.isMeshWorldNormalMaterial = true;

	ShaderMaterial.call( this, parameters );

}

MeshWorldNormalMaterial.prototype = Object.create( ShaderMaterial.prototype );
MeshWorldNormalMaterial.prototype.constructor = MeshWorldNormalMaterial;

/**
 *  Helper to update the mesh onBeforeRender function to update the vewMatrixInverse uniform.
 *  Call it only once on each mesh or it may impact performances.
 *  Note that previously set onBeforeRender will be preserved.
 */
MeshWorldNormalMaterial.updateMeshOnBeforeRender = function ( mesh ) {

	const oldOnBeforeRender = mesh.onBeforeRender;
	mesh.onBeforeRender = function ( renderer, scene, camera, geometry, material, group ) {

		oldOnBeforeRender.call( this, renderer, scene, camera, geometry, material, group );

		if ( this.material.isMeshWorldNormalMaterial )
			this.material.uniforms.viewMatrixInverse.value.copy( camera.matrixWorld );

	};

};
