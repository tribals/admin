/* export */ function joinPath(...components) {
	let path = []
	for (let c of components) {
		if (c.startsWith('/')) {
			c = c.slice(1)
		}

		if (c.endsWith('/')) {
			c = c.slice(0, -1)
		}

		path.push(c)
	}
	return path.join('/')
}
