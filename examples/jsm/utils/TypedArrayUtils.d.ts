export namespace TypedArrayUtils {
	export function quicksortIP(arr: any[], eleSize: number, orderElement: number): any[];


	export class Kdtree {
		self: this;
		root: Node;
		private maxDepth: number;

		constructor(points: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array | Uint8ClampedArray, metric: (a: any, b: any) => number, eleSize: number);

		getPointSet(points: any, pos: number);

		buildTree(): Node;

		getMaxDepth(): number;

		nearest(point: [], maxNodes: number, maxDistance: number): any[];

	}

	export namespace Kdtree {
		export class Node {
			obj: any;
			left: Node | null;
			right: Node | null;
			parent: Node;
			depth: number;
			pos: any;

			constructor(obj: any, depth: number, parent: Node, pos: any)
		}


		export class BinaryHeap {
			content: any[];
			scoreFunction: () => any;

			constructor(scoreFunction?: () => any);
		}

		export namespace BinaryHeap {
			export function push(element: any): void;

			export function pop(): any;

			export function peek(): any;

			export function remove(node: any): any;

			export function size(): number;

			export function bubbleUp(n: number): void;

			export function sinkDown(n: number): void;
		}
	}
}
