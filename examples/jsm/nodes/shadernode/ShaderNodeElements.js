// core nodes
import PropertyNode from '../core/PropertyNode.js';
import VarNode from '../core/VarNode.js';
import AttributeNode from '../core/AttributeNode.js';
import UniformNode from '../core/UniformNode.js';
import BypassNode from '../core/BypassNode.js';
import InstanceIndexNode from '../core/InstanceIndexNode.js';
import ContextNode from '../core/ContextNode.js';
import FunctionNode from '../core/FunctionNode.js';

// accessor nodes
import BufferNode from '../accessors/BufferNode.js';
import StorageBufferNode from '../accessors/StorageBufferNode.js';
import CameraNode from '../accessors/CameraNode.js';
import MaterialNode from '../accessors/MaterialNode.js';
import ModelNode from '../accessors/ModelNode.js';
import ModelViewProjectionNode from '../accessors/ModelViewProjectionNode.js';
import NormalNode from '../accessors/NormalNode.js';
import PositionNode from '../accessors/PositionNode.js';
import SkinningNode from '../accessors/SkinningNode.js';
import TextureNode from '../accessors/TextureNode.js';
import UVNode from '../accessors/UVNode.js';
import InstanceNode from '../accessors/InstanceNode.js';

// gpgpu
import ComputeNode from '../gpgpu/ComputeNode.js';

// math nodes
import OperatorNode from '../math/OperatorNode.js';
import CondNode from '../math/CondNode.js';
import MathNode from '../math/MathNode.js';

// util nodes
import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import JoinNode from '../utils/JoinNode.js';
import TimerNode from '../utils/TimerNode.js';

// other nodes
import ColorSpaceNode from '../display/ColorSpaceNode.js';
import LightContextNode from '../lights/LightContextNode.js';
import ReflectedLightNode from '../lights/ReflectedLightNode.js';

// utils
import ShaderNode from './ShaderNode.js';
import { nodeObject, nodeObjects, nodeArray, nodeProxy, ConvertType, cacheMaps } from './ShaderNodeUtils.js';

//
// Node Material Shader Syntax
//

export { ShaderNode, nodeObject, nodeObjects, nodeArray, nodeProxy };

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

export const uniform = ( value ) => {

	const nodeType = value.nodeType || value.convertTo;

	// TODO: get ConstNode from .traverse() in the future
	value = value.isNode === true ? value.node?.value || value.value : value;

	return nodeObject( new UniformNode( value, nodeType ) );

};

export const label = ( node, name ) => {

	node = nodeObject( node );

	if ( ( node.isVarNode === true ) && ( node.name === name ) ) {

		return node;

	}

	return nodeObject( new VarNode( node, name ) );

};

export const temp = nodeProxy( VarNode );

export const join = ( ...params ) => nodeObject( new JoinNode( nodeArray( params ) ) );

export const uv = ( ...params ) => nodeObject( new UVNode( ...params ) );
export const attribute = ( ...params ) => nodeObject( new AttributeNode( ...params ) );
export const buffer = ( ...params ) => nodeObject( new BufferNode( ...params ) );
export const storage = ( ...params ) => nodeObject( new StorageBufferNode( ...params ) );
export const texture = ( ...params ) => nodeObject( new TextureNode( ...params ) );
export const sampler = ( texture ) => nodeObject( new ConvertNode( texture.isNode === true ? texture : new TextureNode( texture ), 'sampler' ) );

export const timer = ( ...params ) => nodeObject( new TimerNode( ...params ) );

export const compute = ( ...params ) => nodeObject( new ComputeNode( ...params ) );
export const func = ( ...params ) => nodeObject( new FunctionNode( ...params ) );

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

export const element = nodeProxy( ArrayElementNode );
export const instanceIndex = nodeObject( new InstanceIndexNode() );

export const modelViewProjection = nodeProxy( ModelViewProjectionNode );

export const normalGeometry = nodeObject( new NormalNode( NormalNode.GEOMETRY ) );
export const normalLocal = nodeObject( new NormalNode( NormalNode.LOCAL ) );
export const normalWorld = nodeObject( new NormalNode( NormalNode.WORLD ) );
export const normalView = nodeObject( new NormalNode( NormalNode.VIEW ) );
export const transformedNormalView = nodeObject( new VarNode( new NormalNode( NormalNode.VIEW ), 'TransformedNormalView', 'vec3' ) );

export const positionGeometry = nodeObject( new PositionNode( PositionNode.GEOMETRY ) );
export const positionLocal = nodeObject( new PositionNode( PositionNode.LOCAL ) );
export const positionWorld = nodeObject( new PositionNode( PositionNode.WORLD ) );
export const positionView = nodeObject( new PositionNode( PositionNode.VIEW ) );
export const positionViewDirection = nodeObject( new PositionNode( PositionNode.VIEW_DIRECTION ) );

export const viewMatrix = nodeObject( new ModelNode( ModelNode.VIEW_MATRIX ) );

export const cameraPosition = nodeObject( new CameraNode( CameraNode.POSITION ) );

export const diffuseColor = nodeObject( new PropertyNode( 'DiffuseColor', 'vec4' ) );
export const roughness = nodeObject( new PropertyNode( 'Roughness', 'float' ) );
export const metalness = nodeObject( new PropertyNode( 'Metalness', 'float' ) );
export const alphaTest = nodeObject( new PropertyNode( 'AlphaTest', 'float' ) );
export const specularColor = nodeObject( new PropertyNode( 'SpecularColor', 'color' ) );

export const materialAlphaTest = nodeObject( new MaterialNode( MaterialNode.ALPHA_TEST ) );
export const materialColor = nodeObject( new MaterialNode( MaterialNode.COLOR ) );
export const materialOpacity = nodeObject( new MaterialNode( MaterialNode.OPACITY ) );
export const materialSpecular = nodeObject( new MaterialNode( MaterialNode.SPECULAR ) );
export const materialRoughness = nodeObject( new MaterialNode( MaterialNode.ROUGHNESS ) );
export const materialMetalness = nodeObject( new MaterialNode( MaterialNode.METALNESS ) );

export const skinning = nodeProxy( SkinningNode );
export const instance = nodeProxy( InstanceNode );

export const context = nodeProxy( ContextNode );
export const lightContext = nodeProxy( LightContextNode );

export const reflectedLight = nodeProxy( ReflectedLightNode );

export const colorSpace = ( node, encoding ) => nodeObject( new ColorSpaceNode( null, nodeObject( node ) ).fromEncoding( encoding ) );

export const bypass = nodeProxy( BypassNode );

export const abs = nodeProxy( MathNode, 'abs' );
export const acos = nodeProxy( MathNode, 'acos' );
export const asin = nodeProxy( MathNode, 'asin' );
export const atan = nodeProxy( MathNode, 'atan' );
export const ceil = nodeProxy( MathNode, 'ceil' );
export const clamp = nodeProxy( MathNode, 'clamp' );
export const cos = nodeProxy( MathNode, 'cos' );
export const cross = nodeProxy( MathNode, 'cross' );
export const degrees = nodeProxy( MathNode, 'degrees' );
export const dFdx = nodeProxy( MathNode, 'dFdx' );
export const dFdy = nodeProxy( MathNode, 'dFdy' );
export const distance = nodeProxy( MathNode, 'distance' );
export const dot = nodeProxy( MathNode, 'dot' );
export const exp = nodeProxy( MathNode, 'exp' );
export const exp2 = nodeProxy( MathNode, 'exp2' );
export const faceforward = nodeProxy( MathNode, 'faceforward' );
export const floor = nodeProxy( MathNode, 'floor' );
export const fract = nodeProxy( MathNode, 'fract' );
export const invert = nodeProxy( MathNode, 'invert' );
export const inversesqrt = nodeProxy( MathNode, 'inversesqrt' );
export const length = nodeProxy( MathNode, 'length' );
export const log = nodeProxy( MathNode, 'log' );
export const log2 = nodeProxy( MathNode, 'log2' );
export const max = nodeProxy( MathNode, 'max' );
export const min = nodeProxy( MathNode, 'min' );
export const mix = nodeProxy( MathNode, 'mix' );
export const mod = nodeProxy( MathNode, 'mod' );
export const negate = nodeProxy( MathNode, 'negate' );
export const normalize = nodeProxy( MathNode, 'normalize' );
export const pow = nodeProxy( MathNode, 'pow' );
export const pow2 = nodeProxy( MathNode, 'pow', 2 );
export const pow3 = nodeProxy( MathNode, 'pow', 3 );
export const pow4 = nodeProxy( MathNode, 'pow', 4 );
export const radians = nodeProxy( MathNode, 'radians' );
export const reflect = nodeProxy( MathNode, 'reflect' );
export const refract = nodeProxy( MathNode, 'refract' );
export const round = nodeProxy( MathNode, 'round' );
export const saturate = nodeProxy( MathNode, 'saturate' );
export const sign = nodeProxy( MathNode, 'sign' );
export const sin = nodeProxy( MathNode, 'sin' );
export const smoothstep = nodeProxy( MathNode, 'smoothstep' );
export const sqrt = nodeProxy( MathNode, 'sqrt' );
export const step = nodeProxy( MathNode, 'step' );
export const tan = nodeProxy( MathNode, 'tan' );
export const transformDirection = nodeProxy( MathNode, 'transformDirection' );

export const EPSILON = float( 1e-6 );
export const INFINITY = float( 1e6 );

export const dotNV = saturate( dot( transformedNormalView, positionViewDirection ) );
