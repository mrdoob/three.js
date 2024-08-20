import { expression } from '../code/ExpressionNode';

export const workgroupBarrier = () => expression( 'workgroupBarrier();' ).append();
export const storageBarrier = () => expression( 'storageBarrier();' ).append();
export const textureBarrier = () => expression( 'textureBarrier();' ).append();
