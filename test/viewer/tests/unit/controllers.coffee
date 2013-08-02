describe "testing controller", ->
	app = "three.testing"

	beforeEach module app

	scope = ctrl = null
	reset = (tests)->
		beforeEach ->
			angular.module(app)
				.factory "testloader", ($timeout)->
					Loader =
						get: ->
							success: (cb)->
								cb tests

		beforeEach inject ($rootScope, $controller)->
			scope = $rootScope.$new()
			ctrl = $controller "testing", $scope: scope

	describe "basically", ->
		reset
			children: {}
			tests:
				foo:
					name: "foo"
					path: "./foo"
				bar:
					name: "bar"
					path: "./bar"

		it "should expose a test", ->
			expect(scope.Test.current).not.toBe(null)
		it "should load a path", ->
			scope.Test.load "./bar"
			expect(scope.Test.current.path).toBe("./bar")

	describe "minimally", ->
		reset
			tests:
				foo:
					name: "foo"
					path: "./foo"
			children:
				bars:
					children: {}
					tests:
						foo:
							name: "foo"
							path: "./bars/foo"
						baz:
							name: "baz"
							path: "./bars/baz"

		it "should load the first url", ->
			expect(scope.Test.current.path).toBe("./foo")
		it "can move forward and back", ->
			expect(scope.Test.current.path).toBe("./foo")
			scope.Test.next()
			expect(scope.Test.current.path).toBe("./bars/baz")
			scope.Test.next()
			expect(scope.Test.current.path).toBe("./bars/foo")
			scope.Test.previous()
			expect(scope.Test.current.path).toBe("./bars/baz")
		it "can wrap back and forward", ->
			expect(scope.Test.current.path).toBe("./foo")
			scope.Test.previous()
			expect(scope.Test.current.path).toBe("./bars/foo")
			scope.Test.previous()
			expect(scope.Test.current.path).toBe("./bars/baz")
			scope.Test.next()
			scope.Test.next()
			expect(scope.Test.current.path).toBe("./foo")
		it "can mark pass", ->
			test = scope.Test.current
			expect(scope.Test.current.path).toBe("./foo")
			scope.Test.pass()
			expect(scope.Test.current.path).toBe("./bars/baz")
			expect(test.pass).toBe(true)
			expect(test.fail).toBe(false)
		it "can mark fail", ->
			test = scope.Test.current
			expect(scope.Test.current.path).toBe("./foo")
			scope.Test.fail()
			expect(scope.Test.current.path).toBe("./bars/baz")
			expect(test.pass).toBe(false)
			expect(test.fail).toBe(true)
