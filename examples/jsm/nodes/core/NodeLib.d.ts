import { Node } from './Node';
import { NodeBuilder } from './NodeBuilder';

export interface NodeLibKeyword {
  callback: (builder: NodeBuilder) => void;
  cache?: object;
}

export namespace NodeLib {

  export const nodes: object;
  export const keywords: object;
  export const includes: object;

  export function addInclude(node: Node): void;
  export function addKeyword(name: string, callback: (builder: NodeBuilder) => void, cache?: boolean): void;
  export function addNode(name: string, callbackNode: Function | Node): void;
  export function addNodeClass(name: string, nodeClass: Class): void;
  export function removeInclude(node: Node): void;
  export function removeKeyword(name: string): void;
  export function removeNode(name: string): void;
  export function getInclude(name: string): Node;
  export function getKeyword(name: string, builder: NodeBuilder): any;
  export function getKeywordData(name: string): NodeLibKeyword;
  export function getNode(name: string): any;
  export function containsInclude(name: string): boolean;
  export function containsKeyword(name: string): boolean;
  export function containsNode(name: string): void;

}
