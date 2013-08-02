file = (name)-> name?.match(/\.html$/) isnt null
testing.filter "files", ->
	(input) ->
		ret = []
		for name, t of input
			if file(name)
				ret.push(name) 
		ret

directory = (name)-> not file(name) and name?.match(/^\$/) is null
testing.filter "directories", ->
	(input, path)->
		ret = {}
		for name, children of input
			ret["#{path}/#{name}"] = children if directory(name)
		ret