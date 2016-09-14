// library
function Endpoint(uri) {
	this.uri = uri
}
;(function() {
	// stable
	this.shim = function(path) {
		if (path) {
			let uri = new URL(this.uri) // something like clone, because URL is mutable
			uri.pathname = pathlib.join(uri.pathname, path)
			return new EndpointProxy(uri)
		} else {
			return this
		}
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
	// semi-stable
	this._perform = function(params, reqParams) {
		reqParams.mode = 'cors'
		let req = new Request(this._buildURI(params), reqParams)

		return fetch(req)
				.then(this._throwForStatus)
				.then(this._parseJSON)
				.then(this._throwForResult)
				// .then(this._extractData)
	}
}).call(Endpoint.prototype)

function EndpointProxy(uri) {
	let endpoint = new Endpoint(uri)

	return new Proxy(endpoint, {
		get(target, prop) {
			if (Reflect.has(target, prop)) {
				return Reflect.get(target, prop)
			} else {
				// i'm a variable names nazi
				[parent, path] = [target, prop]
				let uri = new URL(parent.uri)
				uri.pathname = pathlib.join(uri.pathname, path)

				let proxy = EndpointProxy(uri)

				return proxy.shim.bind(proxy)
			}
		}
	})
}

// domain-specific, must not be part of library
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
// or just `proto = proto`?
APIError.prototype = Object.create(Error.prototype)

;(function() {
	// unstable, just list of additional callbacks for success request
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
			// TODO: shit
			let { type, args } = res.error
			args = args.map(arg => `  ${arg}`).join('\n')
			let msg = `${type}:\n${args}`
			throw new APIError(msg, error.stack_trace.join(''))
		} else {
			return res
		}
	}
	this._extractData = function(res) {
		return res.data
	}
}).call(Endpoint.prototype)

// var api = new EndpointProxy(new URL('http://localhost:8090'))
var api = new EndpointProxy(new URL('http://api.aws.toprater.io'))

// export default api
