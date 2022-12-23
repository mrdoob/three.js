( function () {
/**
     * @author Maxime Quiblier / http://github.com/maximeq
     *
     * This material will save view space normals in pixels inside rbg channels as well as Depth inside the alpha channel 
     * Use same parameters as for MeshNormalMaterial.
     * 
     *
     */

class MeshNormalDepthMaterial extends THREE.ShaderMaterial {
  constructor(parameters) {
    parameters = parameters || {};
    parameters.uniforms = THREE.UniformsUtils.merge([THREE.ShaderLib.normal.uniforms, {
      linearize_depth: {
        value: parameters.linearize_depth ?? true
      }
    }]);
    parameters.vertexShader = 'varying mat4 vProjectionMatrix;' + '\n' + THREE.ShaderLib.normal.vertexShader.replace('#include <uv_vertex>', 'vProjectionMatrix = projectionMatrix;' + '\n' + '#include <uv_vertex>');
    parameters.fragmentShader = 'varying mat4 vProjectionMatrix;' + '\n' + 'uniform bool linearize_depth;' + '\n' + THREE.ShaderLib.normal.fragmentShader.replace('gl_FragColor = vec4( packNormalToRGB( normal ), opacity );', 'float zN = 2.0*gl_FragCoord.z - 1.0;' + '\n' + 'float p23 = vProjectionMatrix[3][2];' + '\n' + 'float k = (vProjectionMatrix[2][2] - 1.0f)/(vProjectionMatrix[2][2] + 1.0f);' + '\n' + 'float inK = vProjectionMatrix[2][2] / p23;' + '\n' + 'float zFar =  p23/(1.0f + p23*inK);' + '\n' + 'float zNear =  1.0f/(inK - 1.0/p23);' + '\n' + 'float linearizedDepth =  2.0 * zNear * zFar / (zFar  + zNear - zN * (zFar - zNear));' + '\n' + 'float depth_e = linearize_depth ? linearizedDepth : zN;' + '\n' + 'gl_FragColor = vec4( packNormalToRGB( normal ), depth_e );');
    super(parameters);
    this.bumpMap = null;
    this.bumpScale = 1;
    this.normalMap = null;
    this.normalMapType = THREE.TangentSpaceNormalMap;
    this.normalScale = new THREE.Vector2(1, 1);
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
    this.isMeshNormalDepthMaterial = true;
  }

}

THREE.MeshNormalDepthMaterial = MeshNormalDepthMaterial;
} )();
