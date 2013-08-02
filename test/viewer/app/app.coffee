window.testing = angular.module("three.testing", [])
	.config ($locationProvider)->
		$locationProvider.html5Mode(false).hashPrefix('!');