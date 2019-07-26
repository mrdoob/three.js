import { Node } from './Node';
import { NodeBuilder } from './NodeBuilder';

export interface NodeLibKeyword {
  callback: (builder: NodeBuilder) => void;
  cache?: object;
}

export namespace NodeLib {

  export const nodes: object;
  export const keywords: object;

  export function add(node: Node): void;
  export function addKeyword(name: string, callback: (builder: NodeBuilder) => void, cache?: object): void;
  export function addFunction(name: string, callback: Function): void;
  export function addFunctions(nodeClass: Class, callback: Function): void;
  export function addFunctionNode(name: string, node: Node): void;
  export function addFunctionNodeClass(name: string, nodeClass: Class): void;
  export function remove(node: Node): void;
  export function removeKeyword(name: string): void;
  export function removeFunction(name: string): void;
  export function get(name: string): Node;
  export function getKeyword(name: string, builder: NodeBuilder): any;
  export function getKeywordData(name: string): NodeLibKeyword;
  export function getFunction(name: string): any;
  export function contains(name: string): boolean;
  export function containsKeyword(name: string): boolean;
  export function containsFunction(name: string): void;

}
