function parseMaterialXNodeTree( nodeXML, createNode, addNode, nodePath = '' ) {

	const materialXNode = createNode( nodeXML, nodePath );
	if ( materialXNode.nodePath ) {

		addNode( materialXNode );

	}

	for ( const childNodeXML of nodeXML.children ) {

		const childMXNode = parseMaterialXNodeTree( childNodeXML, createNode, addNode, materialXNode.nodePath );
		materialXNode.add( childMXNode );

	}

	return materialXNode;

}

function parseMaterialXText( text, createNode, addNode ) {

	const rootXML = new DOMParser().parseFromString( text, 'application/xml' ).documentElement;
	return parseMaterialXNodeTree( rootXML, createNode, addNode );

}

export { parseMaterialXNodeTree, parseMaterialXText };
