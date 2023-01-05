// accessors
import CubeTextureNode from '../accessors/CubeTextureNode.js';
import InstanceNode from '../accessors/InstanceNode.js';
import ReflectVectorNode from '../accessors/ReflectVectorNode.js';
import SkinningNode from '../accessors/SkinningNode.js';
import ExtendedMaterialNode from '../accessors/ExtendedMaterialNode.js';

// display
import BlendModeNode from '../display/BlendModeNode.js';
import ColorAdjustmentNode from '../display/ColorAdjustmentNode.js';
import ColorSpaceNode from '../display/ColorSpaceNode.js';
import NormalMapNode from '../display/NormalMapNode.js';
import PosterizeNode from '../display/PosterizeNode.js';
import ToneMappingNode from '../display/ToneMappingNode.js';
import ViewportNode from '../display/ViewportNode.js';

// lighting
import LightsNode from '../lighting/LightsNode.js';
//import LightingNode from '../lighting/LightingNode.js';
import LightingContextNode from '../lighting/LightingContextNode.js';

// utils
import EquirectUVNode from '../utils/EquirectUVNode.js';
import MatcapUVNode from '../utils/MatcapUVNode.js';
import OscNode from '../utils/OscNode.js';
import RemapNode from '../utils/RemapNode.js';
import RotateUVNode from '../utils/RotateUVNode.js';
import SpecularMIPLevelNode from '../utils/SpecularMIPLevelNode.js';
import SpriteSheetUVNode from '../utils/SpriteSheetUVNode.js';
import TimerNode from '../utils/TimerNode.js';
import TriplanarTexturesNode from '../utils/TriplanarTexturesNode.js';

// geometry
import RangeNode from '../geometry/RangeNode.js';

// procedural
import CheckerNode from '../procedural/CheckerNode.js';

// fog
import FogNode from '../fog/FogNode.js';
import FogRangeNode from '../fog/FogRangeNode.js';
import FogExp2Node from '../fog/FogExp2Node.js';

// shader node utils
import { nodeObject, nodeProxy, nodeImmutable } from './ShaderNode.js';

//
// Node Material Shader Syntax
//

// shader node base

export * from './ShaderNodeBaseElements.js';

// functions

export { default as BRDF_BlinnPhong } from '../functions/BSDF/BRDF_BlinnPhong.js';
export { default as BRDF_GGX } from '../functions/BSDF/BRDF_GGX.js';
export { default as BRDF_Lambert } from '../functions/BSDF/BRDF_Lambert.js';
export { default as D_GGX } from '../functions/BSDF/D_GGX.js';
export { default as DFGApprox } from '../functions/BSDF/DFGApprox.js';
export { default as F_Schlick } from '../functions/BSDF/F_Schlick.js';
export { default as V_GGX_SmithCorrelated } from '../functions/BSDF/V_GGX_SmithCorrelated.js';

export { default as getDistanceAttenuation } from '../functions/light/getDistanceAttenuation.js';

export { default as getGeometryRoughness } from '../functions/material/getGeometryRoughness.js';
export { default as getRoughness } from '../functions/material/getRoughness.js';

export { default as phongLightingModel } from '../functions/PhongLightingModel.js';
export { default as physicalLightingModel } from '../functions/PhysicalLightingModel.js';

// accessors

export const cubeTexture = nodeProxy( CubeTextureNode );

export const instance = nodeProxy( InstanceNode );

export const reflectVector = nodeImmutable( ReflectVectorNode );

export const skinning = nodeProxy( SkinningNode );

// material

export const materialNormal = nodeImmutable( ExtendedMaterialNode, ExtendedMaterialNode.NORMAL );

// display

export const burn = nodeProxy( BlendModeNode, BlendModeNode.BURN );
export const dodge = nodeProxy( BlendModeNode, BlendModeNode.DODGE );
export const overlay = nodeProxy( BlendModeNode, BlendModeNode.OVERLAY );
export const screen = nodeProxy( BlendModeNode, BlendModeNode.SCREEN );

export const saturation = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.SATURATION );
export const vibrance = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.VIBRANCE );
export const hue = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.HUE );

export const colorSpace = ( node, encoding ) => nodeObject( new ColorSpaceNode( null, nodeObject( node ) ).fromEncoding( encoding ) );
export const normalMap = nodeProxy( NormalMapNode );
export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );

export const posterize = nodeProxy( PosterizeNode );

export const viewportCoordinate = nodeImmutable( ViewportNode, ViewportNode.COORDINATE );
export const viewportResolution = nodeImmutable( ViewportNode, ViewportNode.RESOLUTION );
export const viewportTopLeft = nodeImmutable( ViewportNode, ViewportNode.TOP_LEFT );
export const viewportBottomLeft = nodeImmutable( ViewportNode, ViewportNode.BOTTOM_LEFT );
export const viewportTopRight = nodeImmutable( ViewportNode, ViewportNode.TOP_RIGHT );
export const viewportBottomRight = nodeImmutable( ViewportNode, ViewportNode.BOTTOM_RIGHT );

// lighting

//export const lighting = nodeProxy( LightingNode ); // abstract
//export const light; // still needs to be added
export const lights = ( lights ) => nodeObject( new LightsNode().fromLights( lights ) );
export const lightingContext = nodeProxy( LightingContextNode );

// utils

export const matcapUV = nodeImmutable( MatcapUVNode );
export const equirectUV = nodeProxy( EquirectUVNode );

export const specularMIPLevel = nodeProxy( SpecularMIPLevelNode );

export const oscSine = nodeProxy( OscNode, OscNode.SINE );
export const oscSquare = nodeProxy( OscNode, OscNode.SQUARE );
export const oscTriangle = nodeProxy( OscNode, OscNode.TRIANGLE );
export const oscSawtooth = nodeProxy( OscNode, OscNode.SAWTOOTH );

export const remap = nodeProxy( RemapNode, null, null, { doClamp: false } );
export const remapClamp = nodeProxy( RemapNode );

export const rotateUV = nodeProxy( RotateUVNode );

export const spritesheetUV = nodeProxy( SpriteSheetUVNode );

// @TODO: add supports to use node in timeScale
export const timerLocal = ( timeScale, value = 0 ) => nodeObject( new TimerNode( TimerNode.LOCAL, timeScale, value ) );
export const timerGlobal = ( timeScale, value = 0 ) => nodeObject( new TimerNode( TimerNode.GLOBAL, timeScale, value ) );
export const timerDelta = ( timeScale, value = 0 ) => nodeObject( new TimerNode( TimerNode.DELTA, timeScale, value ) );
export const frameId = nodeImmutable( TimerNode, TimerNode.FRAME );

export const triplanarTextures = nodeProxy( TriplanarTexturesNode );
export const triplanarTexture = ( texture, ...params ) => triplanarTextures( texture, texture, texture, ...params );

// geometry

export const range = ( min, max ) => nodeObject( new RangeNode( min, max ) );

// procedural

export const checker = nodeProxy( CheckerNode );

// fog

export const fog = nodeProxy( FogNode );
export const rangeFog = nodeProxy( FogRangeNode );
export const densityFog = nodeProxy( FogExp2Node );
