import { uniform } from '../core/UniformNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';

let uniformsLib;
let vec3;

function getLightData( light ) {

	uniformsLib = uniformsLib || new WeakMap();

	let uniforms = uniformsLib.get( light );

	if ( uniforms === undefined ) uniformsLib.set( light, uniforms = {} );

	return uniforms;

}

export function lightPosition( light ) {

	const data = getLightData( light );

	return data.position || ( data.position = uniform( 'vec3' ).setGroup( renderGroup ).onRenderUpdate( () => light.position ) );

}


export function lightViewPosition( light ) {

	const data = getLightData( light );

	return data.viewPosition || ( data.viewPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => {

		self.value = self.value || new Vector3();
		self.value.setFromMatrixPosition( light.matrixWorld );

		self.value.applyMatrix4( camera.matrixWorldInverse );

	} ) );

}

