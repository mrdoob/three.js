const eqeqeq = {
	meta: { fixable: 'code' },
	create( context ) {

		return {
			BinaryExpression( node ) {

				if ( node.operator === '==' || node.operator === '!=' ) {

					const right = node.right;
					const isNullOrUndefined =
            ( right.type === 'Literal' && right.value === null ) ||
            ( right.type === 'Identifier' && right.name === 'undefined' );

					if ( isNullOrUndefined ) {

						context.report( {
							node,
							message: 'Comparison may rely on type coercion; manual review required'
						} );

					} else {

						const replacement = node.operator === '==' ? '===' : '!==';
						context.report( {
							node,
							message: `Use ${replacement} instead of ${node.operator}`,
							fix( fixer ) {

								const sourceCode = context.getSourceCode();
								const operatorToken = sourceCode.getFirstTokenBetween( node.left, node.right, {
									filter: ( token ) => token.value === node.operator,
								} );
								const replacement = node.operator === '==' ? '===' : '!==';
								return fixer.replaceText( operatorToken, replacement );

							}
						} );

					}

				}

			},
		};

	},
};

export default {
	rules: {
		eqeqeq
	}
};
