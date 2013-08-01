testing.factory "snapshot", ->
	Snap =
		snap: ->
			iframe = document.querySelector "#viewer"
			wind = iframe.contentWindow
			stage = wind.stage
			console.log stage
			return if not stage
			Snap.URL = stage.debug.image().toDataURL()
		URL: ""
