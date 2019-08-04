import { Node } from './Node';
import { NodeContext } from './NodeContext';

export class NodeFlowSettings {
  slot: string;
  cache: string;
  context?: NodeContext;

  setSlot(name: string): this;
  setCache(name: string): this;
  setContext(value: NodeContext): this;
}
