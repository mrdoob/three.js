testing.controller "testing", ($scope, $http, $timeout)->
	ordered = []
	order = (tests)->
		recur = (tests)->
			ordered.push test.path for name, test of tests.tests
			recur tests for name, tests of tests.children
		recur tests
		_(ordered).sort (a, b)->
			# TODO FIX
			as = a.match(/\//g).length
			bs = b.match(/\//g).length
			return  1 if as > bs
			return -1 if bs > as
			return  1 if a > b
			return -1 if b > a
			return  0

	$http.get("tests.json")
	.success (data, status)->
		$scope.tests = data
		order $scope.tests
		# This is working funky
		$timeout Test.next

	Test = $scope.Test =
		url: ""
		Url: (path, name)->
			"#{path}/#{name}"
		load: (url)->
			Test.url = url
		find: 
			test: (path)->
				path = path.split "/"
				path.shift()
				test = path.pop()
				base = $scope.tests
				while part = path.shift()
					base = base.children[part]
				base.tests[test]

		move: (i = 1)->
			index = ordered.indexOf Test.url
			next = ordered[(index + i) % ordered.length]
			Test.url = next
		previous: ->
			Test.move -1
		next: ->
			return Test.first() if Test.url is ''
			Test.move()
		first: ->
			Test.url = ordered[0]
		set: (p, f)->
			test = Test.find.test(Test.url)
			test.pass = p
			test.fail = f
			Test.next()
		pass: ->
			Test.set true, false
		fail: ->
			Test.set false, true

testing.controller "menu", ($scope, $http)->

testing.controller "controls", ($scope, snapshot)->

testing.controller "viewports", ($scope, snapshot)->
