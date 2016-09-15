var picserv = {
	pictureURI: 'http://mvp-api.sentimeta.com/picture',
	uploadURI: 'http://mvp-api.sentimeta.com/picture/upload',
	// pictureURI: 'http://localhost:3000/picture',
	// uploadURI: 'http://localhost:3000/picture/upload',
}
picserv.upload = function(data) {
	return fetch(this.uploadURI, {
		mode: 'cors',
		method: 'post',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ base64: data })
	}).then(function(resp) {
		if (!resp.ok) {
			throw new Error(`${resp.status} ${resp.statusText}`)
		} else {
			return resp
		}
	}).then(function(resp) {
		if (resp.headers.get('content-type').includes('application/json')) {
			return resp.json()
		} else {
			return resp
		}
	})
}
picserv.uri = function(hash) {
	let uri = new URL(this.pictureURI)
	uri.searchParams.append('hash', hash)

	return uri
}
