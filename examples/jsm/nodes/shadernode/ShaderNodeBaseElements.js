// core
//import ArrayUniformNode from '../core/ArrayUniformNode.js';
import AttributeNode from '../core/AttributeNode.js';
import BypassNode from '../core/BypassNode.js';
import CacheNode from '../core/CacheNode.js';
import CodeNode from '../core/CodeNode.js';
import ContextNode from '../core/ContextNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import FunctionCallNode from '../core/FunctionCallNode.js';
import FunctionNode from '../core/FunctionNode.js';
import InstanceIndexNode from '../core/InstanceIndexNode.js';
import PropertyNode from '../core/PropertyNode.js';
import UniformNode from '../core/UniformNode.js';
import VarNode from '../core/VarNode.js';
import VaryingNode from '../core/VaryingNode.js';

// accessors
import BitangentNode from '../accessors/BitangentNode.js';
import BufferNode from '../accessors/BufferNode.js';
import CameraNode from '../accessors/CameraNode.js';
import MaterialNode from '../accessors/MaterialNode.js';
import MaterialReferenceNode from '../accessors/MaterialReferenceNode.js';
import ModelViewProjectionNode from '../accessors/ModelViewProjectionNode.js';
import NormalNode from '../accessors/NormalNode.js';
import ModelNode from '../accessors/ModelNode.js';
import PointUVNode from '../accessors/PointUVNode.js';
import PositionNode from '../accessors/PositionNode.js';
import ReferenceNode from '../accessors/ReferenceNode.js';
import StorageBufferNode from '../accessors/StorageBufferNode.js';
import TangentNode from '../accessors/TangentNode.js';
import TextureNode from '../accessors/TextureNode.js';
import UserDataNode from '../accessors/UserDataNode.js';
import UVNode from '../accessors/UVNode.js';

// display
import FrontFacingNode from '../display/FrontFacingNode.js';

// gpgpu
import ComputeNode from '../gpgpu/ComputeNode.js';

// math
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';
import CondNode from '../math/CondNode.js';

// utils
import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import MaxMipLevelNode from '../utils/MaxMipLevelNode.js';

// shader node utils
import { ShaderNode, nodeObject, nodeObjects, nodeArray, nodeProxy, nodeImmutable, ConvertType, getConstNodeType, cacheMaps } from './ShaderNode.js';

// shader node base

export { ShaderNode, nodeObject, nodeObjects, nodeArray, nodeProxy, nodeImmutable };

export const color = new ConvertType( 'color' );

export const float = new ConvertType( 'float', cacheMaps.float );
export const int = new ConvertType( 'int', cacheMaps.int );
export const uint = new ConvertType( 'uint', cacheMaps.uint );
export const bool = new ConvertType( 'bool', cacheMaps.bool );

export const vec2 = new ConvertType( 'vec2' );
export const ivec2 = new ConvertType( 'ivec2' );
export const uvec2 = new ConvertType( 'uvec2' );
export const bvec2 = new ConvertType( 'bvec2' );

export const vec3 = new ConvertType( 'vec3' );
export const ivec3 = new ConvertType( 'ivec3' );
export const uvec3 = new ConvertType( 'uvec3' );
export const bvec3 = new ConvertType( 'bvec3' );

export const vec4 = new ConvertType( 'vec4' );
export const ivec4 = new ConvertType( 'ivec4' );
export const uvec4 = new ConvertType( 'uvec4' );
export const bvec4 = new ConvertType( 'bvec4' );

export const mat3 = new ConvertType( 'mat3' );
export const imat3 = new ConvertType( 'imat3' );
export const umat3 = new ConvertType( 'umat3' );
export const bmat3 = new ConvertType( 'bmat3' );

export const mat4 = new ConvertType( 'mat4' );
export const imat4 = new ConvertType( 'imat4' );
export const umat4 = new ConvertType( 'umat4' );
export const bmat4 = new ConvertType( 'bmat4' );

// core

// @TODO: ArrayUniformNode

export const func = ( code, includes ) => {

	const node = nodeObject( new FunctionNode( code, includes ) );

	const call = node.call.bind( node );
	node.call = ( ...params ) => nodeObject( call( params.length > 1 || params[ 0 ]?.isNode === true ? nodeArray( params ) : nodeObjects( params[ 0 ] ) ) );

	return node;

};

export const uniform = ( nodeOrType ) => {

	const nodeType = getConstNodeType( nodeOrType );

	// @TODO: get ConstNode from .traverse() in the future
	const value = nodeOrType.isNode === true ? nodeOrType.node?.value || nodeOrType.value : nodeOrType;

	return nodeObject( new UniformNode( value, nodeType ) );

};

export const fn = ( code, includes ) => func( code, includes ).call;

export const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );
export const property = ( name, nodeOrType ) => nodeObject( new PropertyNode( name, getConstNodeType( nodeOrType ) ) );

export const convert = ( node, types ) => nodeObject( new ConvertNode( nodeObject( node ), types ) );
export const maxMipLevel = nodeProxy( MaxMipLevelNode );

export const bypass = nodeProxy( BypassNode );
export const cache = nodeProxy( CacheNode );
export const code = nodeProxy( CodeNode );
export const context = nodeProxy( ContextNode );
export const expression = nodeProxy( ExpressionNode );
export const call = nodeProxy( FunctionCallNode );
export const instanceIndex = nodeImmutable( InstanceIndexNode );
export const label = nodeProxy( VarNode );
export const temp = label;
export const varying = nodeProxy( VaryingNode );

// math

export const EPSILON = float( 1e-6 );
export const INFINITY = float( 1e6 );

export const cond = nodeProxy( CondNode );

export const add = nodeProxy( OperatorNode, '+' );
export const sub = nodeProxy( OperatorNode, '-' );
export const mul = nodeProxy( OperatorNode, '*' );
export const div = nodeProxy( OperatorNode, '/' );
export const remainder = nodeProxy( OperatorNode, '%' );
export const equal = nodeProxy( OperatorNode, '==' );
export const assign = nodeProxy( OperatorNode, '=' );
export const lessThan = nodeProxy( OperatorNode, '<' );
export const greaterThan = nodeProxy( OperatorNode, '>' );
export const lessThanEqual = nodeProxy( OperatorNode, '<=' );
export const greaterThanEqual = nodeProxy( OperatorNode, '>=' );
export const and = nodeProxy( OperatorNode, '&&' );
export const or = nodeProxy( OperatorNode, '||' );
export const xor = nodeProxy( OperatorNode, '^^' );
export const bitAnd = nodeProxy( OperatorNode, '&' );
export const bitOr = nodeProxy( OperatorNode, '|' );
export const bitXor = nodeProxy( OperatorNode, '^' );
export const shiftLeft = nodeProxy( OperatorNode, '<<' );
export const shiftRight = nodeProxy( OperatorNode, '>>' );

export const radians = nodeProxy( MathNode, MathNode.RADIANS );
export const degrees = nodeProxy( MathNode, MathNode.DEGREES );
export const exp = nodeProxy( MathNode, MathNode.EXP );
export const exp2 = nodeProxy( MathNode, MathNode.EXP2 );
export const log = nodeProxy( MathNode, MathNode.LOG );
export const log2 = nodeProxy( MathNode, MathNode.LOG2 );
export const sqrt = nodeProxy( MathNode, MathNode.SQRT );
export const inversesqrt = nodeProxy( MathNode, MathNode.INVERSE_SQRT );
export const floor = nodeProxy( MathNode, MathNode.FLOOR );
export const ceil = nodeProxy( MathNode, MathNode.CEIL );
export const normalize = nodeProxy( MathNode, MathNode.NORMALIZE );
export const fract = nodeProxy( MathNode, MathNode.FRACT );
export const sin = nodeProxy( MathNode, MathNode.SIN );
export const cos = nodeProxy( MathNode, MathNode.COS );
export const tan = nodeProxy( MathNode, MathNode.TAN );
export const asin = nodeProxy( MathNode, MathNode.ASIN );
export const acos = nodeProxy( MathNode, MathNode.ACOS );
export const atan = nodeProxy( MathNode, MathNode.ATAN );
export const abs = nodeProxy( MathNode, MathNode.ABS );
export const sign = nodeProxy( MathNode, MathNode.SIGN );
export const length = nodeProxy( MathNode, MathNode.LENGTH );
export const negate = nodeProxy( MathNode, MathNode.NEGATE );
export const invert = nodeProxy( MathNode, MathNode.INVERT );
export const dFdx = nodeProxy( MathNode, MathNode.DFDX );
export const dFdy = nodeProxy( MathNode, MathNode.DFDY );
export const round = nodeProxy( MathNode, MathNode.ROUND );
export const reciprocal = nodeProxy( MathNode, MathNode.RECIPROCAL );

export const atan2 = nodeProxy( MathNode, MathNode.ATAN2 );
export const min = nodeProxy( MathNode, MathNode.MIN );
export const max = nodeProxy( MathNode, MathNode.MAX );
export const mod = nodeProxy( MathNode, MathNode.MOD );
export const step = nodeProxy( MathNode, MathNode.STEP );
export const reflect = nodeProxy( MathNode, MathNode.REFLECT );
export const distance = nodeProxy( MathNode, MathNode.DISTANCE );
export const dot = nodeProxy( MathNode, MathNode.DOT );
export const cross = nodeProxy( MathNode, MathNode.CROSS );
export const pow = nodeProxy( MathNode, MathNode.POW );
export const pow2 = nodeProxy( MathNode, MathNode.POW, 2 );
export const pow3 = nodeProxy( MathNode, MathNode.POW, 3 );
export const pow4 = nodeProxy( MathNode, MathNode.POW, 4 );
export const transformDirection = nodeProxy( MathNode, MathNode.TRANSFORM_DIRECTION );

export const mix = nodeProxy( MathNode, MathNode.MIX );
export const clamp = ( value, low = 0, high = 1 ) => nodeObject( new MathNode( MathNode.CLAMP, nodeObject( value ), nodeObject( low ), nodeObject( high ) ) );
export const refract = nodeProxy( MathNode, MathNode.REFRACT );
export const smoothstep = nodeProxy( MathNode, MathNode.SMOOTHSTEP );
export const faceforward = nodeProxy( MathNode, MathNode.FACEFORWARD );

// accessors

export const buffer = ( value, nodeOrType, count ) => nodeObject( new BufferNode( value, getConstNodeType( nodeOrType ), count ) );
export const storage = ( value, nodeOrType, count ) => nodeObject( new StorageBufferNode( value, getConstNodeType( nodeOrType ), count ) );

export const cameraProjectionMatrix = nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX );
export const cameraViewMatrix = nodeImmutable( CameraNode, CameraNode.VIEW_MATRIX );
export const cameraNormalMatrix = nodeImmutable( CameraNode, CameraNode.NORMAL_MATRIX );
export const cameraWorldMatrix = nodeImmutable( CameraNode, CameraNode.WORLD_MATRIX );
export const cameraPosition = nodeImmutable( CameraNode, CameraNode.POSITION );

export const materialAlphaTest = nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );
export const materialColor = nodeImmutable( MaterialNode, MaterialNode.COLOR );
export const materialEmissive = nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );
export const materialOpacity = nodeImmutable( MaterialNode, MaterialNode.OPACITY );
//export const materialSpecular = nodeImmutable( MaterialNode, MaterialNode.SPECULAR );
export const materialRoughness = nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );
export const materialMetalness = nodeImmutable( MaterialNode, MaterialNode.METALNESS );
export const materialRotation = nodeImmutable( MaterialNode, MaterialNode.ROTATION );

export const diffuseColor = nodeImmutable( PropertyNode, 'DiffuseColor', 'vec4' );
export const roughness = nodeImmutable( PropertyNode, 'Roughness', 'float' );
export const metalness = nodeImmutable( PropertyNode, 'Metalness', 'float' );
export const alphaTest = nodeImmutable( PropertyNode, 'AlphaTest', 'float' );
export const specularColor = nodeImmutable( PropertyNode, 'SpecularColor', 'color' );

export const reference = ( name, nodeOrType, object ) => nodeObject( new ReferenceNode( name, getConstNodeType( nodeOrType ), object ) );
export const materialReference = ( name, nodeOrType, material ) => nodeObject( new MaterialReferenceNode( name, getConstNodeType( nodeOrType ), material ) );
export const userData = ( name, inputType, userData ) => nodeObject( new UserDataNode( name, inputType, userData ) );

export const modelViewProjection = nodeProxy( ModelViewProjectionNode );

export const normalGeometry = nodeImmutable( NormalNode, NormalNode.GEOMETRY );
export const normalLocal = nodeImmutable( NormalNode, NormalNode.LOCAL );
export const normalView = nodeImmutable( NormalNode, NormalNode.VIEW );
export const normalWorld = nodeImmutable( NormalNode, NormalNode.WORLD );
export const transformedNormalView = nodeImmutable( VarNode, normalView, 'TransformedNormalView' );
export const transformedNormalWorld = normalize( transformDirection( transformedNormalView, cameraViewMatrix ) );

export const tangentGeometry = nodeImmutable( TangentNode, TangentNode.GEOMETRY );
export const tangentLocal = nodeImmutable( TangentNode, TangentNode.LOCAL );
export const tangentView = nodeImmutable( TangentNode, TangentNode.VIEW );
export const tangentWorld = nodeImmutable( TangentNode, TangentNode.WORLD );
export const transformedTangentView = nodeImmutable( VarNode, tangentView, 'TransformedTangentView' );
export const transformedTangentWorld = normalize( transformDirection( transformedTangentView, cameraViewMatrix ) );

export const bitangentGeometry = nodeImmutable( BitangentNode, BitangentNode.GEOMETRY );
export const bitangentLocal = nodeImmutable( BitangentNode, BitangentNode.LOCAL );
export const bitangentView = nodeImmutable( BitangentNode, BitangentNode.VIEW );
export const bitangentWorld = nodeImmutable( BitangentNode, BitangentNode.WORLD );
export const transformedBitangentView = normalize( mul( cross( transformedNormalView, transformedTangentView ), tangentGeometry.w ) );
export const transformedBitangentWorld = normalize( transformDirection( transformedBitangentView, cameraViewMatrix ) );

export const modelViewMatrix = nodeImmutable( ModelNode, ModelNode.VIEW_MATRIX );
export const modelNormalMatrix = nodeImmutable( ModelNode, ModelNode.NORMAL_MATRIX );
export const modelWorldMatrix = nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );
export const modelPosition = nodeImmutable( ModelNode, ModelNode.POSITION );
export const modelViewPosition = nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );

export const positionGeometry = nodeImmutable( PositionNode, PositionNode.GEOMETRY );
export const positionLocal = nodeImmutable( PositionNode, PositionNode.LOCAL );
export const positionWorld = nodeImmutable( PositionNode, PositionNode.WORLD );
export const positionWorldDirection = nodeImmutable( PositionNode, PositionNode.WORLD_DIRECTION );
export const positionView = nodeImmutable( PositionNode, PositionNode.VIEW );
export const positionViewDirection = nodeImmutable( PositionNode, PositionNode.VIEW_DIRECTION );

export const texture = nodeProxy( TextureNode );
export const sampler = ( texture ) => nodeObject( new ConvertNode( texture.isNode === true ? texture : new TextureNode( texture ), 'sampler' ) );
export const uv = ( ...params ) => nodeObject( new UVNode( ...params ) );
export const pointUV = nodeImmutable( PointUVNode );

// gpgpu

export const compute = ( node, count, workgroupSize ) => nodeObject( new ComputeNode( nodeObject( node ), count, workgroupSize ) );

// display

export const frontFacing = nodeImmutable( FrontFacingNode );
export const faceDirection = sub( mul( float( frontFacing ), 2 ), 1 );

// lighting


// utils

export const element = nodeProxy( ArrayElementNode );

// miscellaneous

export const lumaCoeffs = vec3( 0.2125, 0.7154, 0.0721 );

export const luminance = ( color, luma = lumaCoeffs ) => dot( color, luma );
export const difference = ( a, b ) => abs( sub( a, b ) );
export const dotNV = clamp( dot( transformedNormalView, positionViewDirection ) );
export const TBNViewMatrix = mat3( tangentView, bitangentView, normalView );
