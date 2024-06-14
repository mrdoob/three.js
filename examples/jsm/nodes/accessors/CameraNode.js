import { uniform } from '../core/UniformNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from 'three';

const updateNear = ( { camera } ) => camera.near;
const updateFar = ( { camera } ) => camera.far;
const updateViewMatrix = ( { camera } ) => camera.matrixWorldInverse;
const updateWorldMatrix =  ( { camera } ) => camera.matrixWorld;
const updateLogDepth = ( { camera } ) => 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 );
const updateProjectionMatrix =  ( { camera } ) => camera.projectionMatrix;
const updateProjectionMatrixInverse =  ( { camera } ) => camera.projectionMatrixInverse;
const updateCameraPosition = ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld );
const updateNormalMatrix = ( { camera } ) => camera.normalMatrix;

export const cameraNear = /*#__PURE__*/ uniform( 'float' ).label( 'cameraNear' ).setGroup( renderGroup ).onRenderUpdate( updateNear );
export const cameraFar = /*#__PURE__*/ uniform( 'float' ).label( 'cameraFar' ).setGroup( renderGroup ).onRenderUpdate( updateFar );
export const cameraLogDepth = /*#__PURE__*/ uniform( 'float' ).label( 'cameraLogDepth' ).setGroup( renderGroup ).onRenderUpdate( updateLogDepth );
export const cameraProjectionMatrix = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrix' ).setGroup( renderGroup ).onRenderUpdate( updateProjectionMatrix );
export const cameraProjectionMatrixInverse = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrixInverse' ).setGroup( renderGroup ).onRenderUpdate( updateProjectionMatrix );
export const cameraViewMatrix = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraViewMatrix' ).setGroup( renderGroup ).onRenderUpdate( updateViewMatrix );
export const cameraWorldMatrix = /*#__PURE__*/ uniform( 'mat4' ).label( 'cameraWorldMatrix' ).setGroup( renderGroup ).onRenderUpdate( updateWorldMatrix );
export const cameraNormalMatrix = /*#__PURE__*/ uniform( 'mat3' ).label( 'cameraNormalMatrix' ).setGroup( renderGroup ).onRenderUpdate( updateNormalMatrix );
export const cameraPosition = /*#__PURE__*/ uniform( new Vector3() ).label( 'cameraPosition' ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );

renderGroup.register( 'cameraViewMatrix', 'mat4', updateViewMatrix );
renderGroup.register( 'cameraWorldMatrix', 'mat4', updateWorldMatrix );
renderGroup.register( 'cameraProjectionMatrix', 'mat4', updateProjectionMatrix );
renderGroup.register( 'cameraProjectionMatrixInverse', 'mat4', updateProjectionMatrixInverse );
renderGroup.register( 'cameraNormalMatrix', 'mat3', updateNormalMatrix );
renderGroup.register( 'cameraPosition', 'vec3' );
renderGroup.register( 'cameraNear', 'float', updateNear );
renderGroup.register( 'cameraFar', 'float', updateFar );
renderGroup.register( 'cameraLogDepth', 'float', updateLogDepth );
