"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ExpressionNode = ExpressionNode;

function ExpressionNode(src, type, keywords, extensions, includes) {
  FunctionNode.call(this, src, includes, extensions, keywords, type);
}

ExpressionNode.prototype = Object.create(THREE.FunctionNode.prototype);
ExpressionNode.prototype.constructor = ExpressionNode;
ExpressionNode.prototype.nodeType = "Expression";