testing.directive "hrefBase", hrefBase = ->
	(scope, elem, attrs) ->
		console.log "Loading hrefBase"
		console.log elem
		doc = elem[0].contentWindow.document
		elem[0].onload = ->
			head = doc.head
			base = doc.createElement 'base'
			base.href = attrs.hrefBase
			head.insertBefore base, head.firstChild
			console.log "Setting base:", attrs.hrefBase
			console.log base
