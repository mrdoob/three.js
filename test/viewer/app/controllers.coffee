testing.controller "testing", ($scope, testloader, $timeout, $location)->
	ordered = []
	order = (tests)->
		recur = (tests)->
			paths = (test.path for name, test of tests.tests)
			ordered = ordered.concat _(paths).sort()
			groups = _(tests.children).chain().keys().sort().value()
			recur tests.children[group] for group in groups
		recur tests

	Test = $scope.Test =
		current:
			name: ''
			path: ''
		load: (url)->
			$location.path url
			Test.current = Test.find.test url
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
			index = ordered.indexOf(Test.current.path)
			if index + i < 0 then index += ordered.length
			next = ordered[(index + i) % ordered.length]
			Test.current = Test.find.test next
		previous: ->
			Test.move -1
		next: ->
			return Test.first() if Test.current.path is ''
			Test.move()
		first: ->
			Test.current = Test.find.test ordered[0]
		set: (p, f)->
			Test.current.pass = p
			Test.current.fail = f
			Test.next()
		pass: ->
			Test.set true, false
		fail: ->
			Test.set false, true

	testloader.get()
	.success (data)->
		$scope.tests = data
		order $scope.tests if $scope.tests
		if url = $location.path()
			if url[0] = '/' then url = url.substring(1)
			Test.load url
		else
			Test.next()

testing.controller "menu", ($scope, $http)->

testing.controller "controls", ($scope, snapshot)->
	$scope.Snapshot = snapshot

testing.controller "viewports", ($scope, snapshot)->
	$scope.Snapshot = snapshot
