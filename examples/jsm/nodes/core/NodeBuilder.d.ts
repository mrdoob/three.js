import {
	Material,
	Texture,
	TextureEncoding,
	WebGLRenderer
} from '../../../../src/Three';

import { Node } from './Node';
import { NodeUniform } from './NodeUniform';

export class NodeBuilder {

	constructor();

	slots: string[];
	caches: string[];
	contexts: object[];

	keywords: object;
	nodeData: object;

	requires: {
		uv: boolean[];
		color: boolean[];
		lights: boolean;
		fog: boolean;
	};

	includes: {
		consts: object[];
		functions: object[];
		structs: object[];
	};

	attributes: object;
	prefixCode: string;

	parsCode: {
		vertex: string;
		fragment: string;
	};

	code: {
		vertex: string;
		fragment: string;
	};

	nodeCode: {
		vertex: string;
		fragment: string;
	};

	resultCode: {
		vertex: string;
		fragment: string;
	};

	finalCode: {
		vertex: string;
		fragment: string;
	};

	inputs: {
		uniforms: {
			list: object[];
			vertex: object[];
			fragment: object[];
		};
		vars: {
			varying: object[];
			vertex: object[];
			fragment: object[];
		}
	};

	defines: object;
	uniforms: object;
	extensions: object;
	updaters: object[];
	nodes: object[];

	analyzing: boolean;

	build( vertex: Node, fragment: Node ): this;
	buildShader( shader: string, node: Node ): void;
	setMaterial( material: Material, renderer: WebGLRenderer ): this;
	addFlow( slot: string, cache?: string, context?: object ): this;
	removeFlow(): this;
	addCache( name: string ): this;
	removeCache(): this;
	addContext( context: object ): this;
	removeContext(): this;
	addSlot( name: string ): this;
	removeSlot(): this;
	addVertexCode( code: string ): void;
	addFragmentCode( code: string ): void;
	addCode( code: string, shader: string ): void;
	addVertexNodeCode( code: string ): void;
	addFragmentNodeCode( code: string ): void;
	addNodeCode( code: string, shader: string ): void;
	clearNodeCode( shader: string ): string;
	clearVertexNodeCode(): string;
	clearFragmentNodeCode(): string;
	addVertexFinalCode( code: string ): void;
	addFragmentFinalCode( code: string ): void;
	addFinalCode( code: string, shader: string ): void;
	addVertexParsCode( code: string ): void;
	addFragmentParsCode( code: string ): void;
	addParsCode( code: string, shader: string ): void;
	addVaryCode( code: string ): void;
	isCache( name: string ): boolean;
	isSlot( name: string ): boolean;
	define( name: string, value: any ): void;
	isDefined( name: string ): boolean;
	getVar( uuid: string, type: string, ns: string, shader?: string, prefix?: string, label?: string ): object;
	getVar( uuid: string, type: string, ns: string, label: string ): object;
	getAttribute( name: string, type: string );
	getCode( shader: string ): string;
	getVarListCode( vars: object[], prefix?: string ): string;
	getVars( shader: string ): object[];
	getNodeData( node: Node ): object;
	createUniform( shader: string, type: string, node: Node, ns?: string, needsUpdate?: boolean, label?: string ): NodeUniform;
	createVertexUniform( type: string, node: Node, ns?: string, needsUpdate?: boolean, label?: string ): NodeUniform;
	createFragmentUniform( type: string, node: Node, ns?: string, needsUpdate?: boolean, label?: string ): NodeUniform;
	include( node: Node, parent?: boolean, source?: string ): void;
	colorToVectorProperties( color: string ): string;
	colorToVector( color: string ): string;
	getIncludes( type: string, shader: string ): object[];
	getIncludesCode( type: string, shader: string ): string;
	getConstructorFromLength( len: number ): string;
	isTypeMatrix( format: string ): boolean;
	getTypeLength( type: string ): number;
	getTypeFromLength( len: number ): string;
	findNode(): Node;
	resolve(): void;
	format( code: string, from: string, to: string ): string;
	getTypeByFormat( format: string ): string;
	getFormatByType( type: string ): string;
	getUuid( uuid: string, useCache?: boolean ): string;
	getElementByIndex( index: number ): string;
	getIndexByElement( elm: string ): number;
	isShader( shader: string ): boolean;
	setShader( shader: string ): this;
	mergeDefines( defines: object ): object;
	mergeUniform( uniforms: object ): object;
	getTextureEncodingFromMap( map: Texture, gammaOverrideLinear?: boolean ): TextureEncoding;

}
