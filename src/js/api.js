//
var defaultData = {
	// null object
	result: 'Ok',
	data: {}
}

function APIError(message, stackTrace) {
	this.name = 'APIError'
	this.message = message
	this.originalStackTrace = stackTrace
}

APIError.prototype = Object.create(Error.prototype)

function Endpoint(uri) {
	this.uri = uri
}

;(function() {
	this._buildURI = function(params) {
		let uri = new URL(this.uri)

		for (let name in params) {
			uri.searchParams.append(name, params[name])
		}

		return uri
	}
	this._throwForStatus = function(response) {
		if (!response.ok) {
			throw new Error(response.statusText)
		} else {
			return response
		}
	}
	this._parseJSON = function(response) {
		if (response.headers.get('content-type').includes('application/json')) {
			return response.json()
		} else {
			return defaultData
		}
	}
	this._throwForResult = function(res) {
		if (res.result === 'Error') {
			let { type, args } = res.error
			args = args.join(' ')
			let msg = `${type}: ${args}`
			throw new APIError(msg, error.stack_trace.join(''))
		} else {
			return res
		}
	}
	this._extractData = function(res) {
		return res.data
	}
	this._perform = function(params, reqParams) {
		reqParams.mode = 'cors'
		let req = new Request(this._buildURI(params), reqParams)

		return fetch(req)
				.then(this._throwForStatus)
				.then(this._parseJSON)
				.then(this._throwForResult)
				.then(this._extractData)
	}
	this.get = function(params, headers) {
		return this._perform(params, { headers: headers })
	}
	this.post = function(body, params, headers) {
		// TODO: shit
		// TOOODOOO: need to clean internal api
		body = JSON.stringify(body || {})

		headers = new Headers(headers || {})
		headers.append('content-type', 'application/json')

		return this._perform(params, { method: 'post', headers: headers, body: body })
	}
}).call(Endpoint.prototype)

function API(baseURI) {
	this.baseURI = baseURI
}

;(function() {
	this.endpoin = function(basePath) {
		return function(additionalPath) {
			let uri = new URL(this.baseURI)
			let path = [uri.pathname, basePath]

			if (additionalPath) {
				path.push(additionalPath)
			}

			uri.pathname = joinPath(...path)
			return new Endpoint(uri)
		}
	}
}).call(API.prototype)

var api = new API('http://localhost:8090')

api.users = api.endpoin('/users')

// export default api
