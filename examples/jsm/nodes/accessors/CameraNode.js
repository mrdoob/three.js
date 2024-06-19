import { uniform } from '../core/UniformNode.js';
import { sharedUniformGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from 'three';

const cameraGroup = /*#__PURE__*/ sharedUniformGroup( 'camera' ).onRenderUpdate( () => {

	cameraGroup.needsUpdate = true;

} );

export const cameraNear = /*#__PURE__*/ uniform( 'float' ).label( 'cameraNear' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.near );
export const cameraFar = /*#__PURE__*/ uniform( 'float' ).label( 'cameraFar' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.far );
export const cameraLogDepth = /*#__PURE__*/ uniform( 'float' ).label( 'cameraLogDepth' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );
export const cameraProjectionMatrix = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrix' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrix );
export const cameraProjectionMatrixInverse = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrixInverse' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrixInverse );
export const cameraViewMatrix = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraViewMatrix' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorldInverse );
export const cameraWorldMatrix = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraWorldMatrix' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorld );
export const cameraNormalMatrix = /*#__PURE__*/ uniform( 'mat3' ).label( 'cameraNormalMatrix' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera } ) => camera.normalMatrix );
export const cameraPosition = /*#__PURE__*/ uniform( new Vector3() ).label( 'cameraPosition' ).setGroup( cameraGroup ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );
