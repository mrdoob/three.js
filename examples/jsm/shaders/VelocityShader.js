import {
	UniformsLib,
	UniformsUtils,
	Matrix4
	} from 'three';
	
	/**
	* Mesh Velocity Shader @bhouston
	*/
	
	const VelocityShader = {
	
	uniforms: UniformsUtils.merge( [
	UniformsLib.common,
	UniformsLib.displacementmap,
	{
		previousModelMatrix: { value: new Matrix4() },
		previousViewMatrix: { value: [new Matrix4(), new Matrix4()] },
	}
	] ),
	
	vertexShader: /* glsl */`
	
	uniform mat4 previousViewMatrix[2];
	uniform mat4 previousModelMatrix;
	
	varying vec4 clipPositionCurrent;
	varying vec4 clipPositionPrevious;
	
	void main() {
	
		clipPositionCurrent = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ));
		clipPositionPrevious = projectionMatrix * (previousViewMatrix[VIEW_ID] * (previousModelMatrix * vec4( position, 1.0 )));
		
		gl_Position = clipPositionCurrent;

	}
	`,
	fragmentShader: /* glsl */`
	varying vec4 clipPositionCurrent;
	varying vec4 clipPositionPrevious;
	
	void main() {
		highp vec4 motionVector = (clipPositionCurrent / clipPositionCurrent.w - clipPositionPrevious / clipPositionPrevious.w );
		gl_FragColor = motionVector;
	}
	`
	};
	
	export { VelocityShader };