import { Node } from './Node';
import { NodeBuilder } from './NodeBuilder';

export interface NodeLibKeyword {
    callback: (builder: NodeBuilder) => void;
    cache?: object;
}

export namespace NodeLib {
    const nodes: object;
    const keywords: object;

    function add(node: Node): void;
    function addKeyword(name: string, callback: (builder: NodeBuilder) => void, cache?: object): void;
    function remove(node: Node): void;
    function removeKeyword(name: string): void;
    function get(name: string): Node;
    function getKeyword(name: string, builder: NodeBuilder): any;
    function getKeywordData(name: string): NodeLibKeyword;
    function contains(name: string): boolean;
    function containsKeyword(name: string): boolean;
}
