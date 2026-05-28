import {
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	NodeMaterial,
	SphereGeometry,
	Vector3
} from 'three/webgpu';

import { attribute, normalWorld, texture3D, uniform } from 'three/tsl';

import { sampleLightProbeGridTexture } from '../lighting/LightProbeGridGPU.js';

class LightProbeGridHelper extends InstancedMesh {

	constructor( probes, sphereSize = 0.12 ) {

		const geometry = new SphereGeometry( sphereSize, 16, 16 );
		const material = new NodeMaterial();
		const textureNode = texture3D( probes.texture );
		const resolutionNode = uniform( new Vector3() );

		material.colorNode = sampleLightProbeGridTexture( textureNode, attribute( 'instanceUVW' ), normalWorld, resolutionNode );
		material.name = 'LightProbeGridHelperGPU';

		const res = probes.resolution;
		const count = res.x * res.y * res.z;

		super( geometry, material, count );

		this.probes = probes;
		this.textureNode = textureNode;
		this.resolutionNode = resolutionNode;
		this.type = 'LightProbeGridHelper';

		this.update();

	}

	update() {

		const probes = this.probes;
		const res = probes.resolution;
		const count = res.x * res.y * res.z;

		if ( this.instanceMatrix.count !== count ) {

			this.instanceMatrix = new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 );

		}

		this.count = count;

		const uvwArray = new Float32Array( count * 3 );
		const matrix = new Matrix4();
		const probePos = new Vector3();

		let i = 0;

		for ( let iz = 0; iz < res.z; iz ++ ) {

			for ( let iy = 0; iy < res.y; iy ++ ) {

				for ( let ix = 0; ix < res.x; ix ++ ) {

					uvwArray[ i * 3 ] = ( ix + 0.5 ) / res.x;
					uvwArray[ i * 3 + 1 ] = ( iy + 0.5 ) / res.y;
					uvwArray[ i * 3 + 2 ] = ( iz + 0.5 ) / res.z;

					probes.getProbePosition( ix, iy, iz, probePos );
					matrix.makeTranslation( probePos.x, probePos.y, probePos.z );
					this.setMatrixAt( i, matrix );

					i ++;

				}

			}

		}

		this.instanceMatrix.needsUpdate = true;
		this.geometry.setAttribute( 'instanceUVW', new InstancedBufferAttribute( uvwArray, 3 ) );

		this.textureNode.value = probes.texture;
		this.resolutionNode.value.copy( probes.resolution );

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { LightProbeGridHelper };
