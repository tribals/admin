var navbar = {
	selector: 'navbar',
	items: {
		home: {
			title: 'Home',
			href: '#',
			action: 'home'
		},
		users: {
			title: 'Users',
			href: '#users',
			action: 'list'
		},
		cities: {
			title: 'Cities',
			href: '#cities',
			action: 'list'
		}
	},
	active: 'home'
}
navbar.present = function(data, render) {
	let { active } = data

	if (active in navbar.items) {
		navbar.active = active
	}

	render(navbar)
}

//
navbar.state = {}
navbar.state.render = function(model) {
	model.state.representation(model, model.view.display)
}
navbar.state.representation = function(model, display) {
	let repr = model.view(model)
	display(`#repr-${model.selector}`, repr)
}

//
navbar.view = function(model) {
	let repr = $(`<ul id="repr-${model.selector}" class="nav navbar-nav"></ul>`)

	let items = $.map(model.items, function(nav, key) {
		let el = $(`<li><a href="${nav.href}">${nav.title}</a></li>`)

		if (key == model.active) {
			el.addClass('active')
		}
		el.on('click', function(ev) {
			// TODO: holy shit
			models[key].actions[nav.action](ev, models[key].present)
			model.actions.navigateTo(key, model.present)
		})
		return el
	})

	repr.append(items)

	return repr
}
navbar.view.display = function(selector, repr) {
	$(selector).replaceWith(repr)
}

//
navbar.actions = {}
navbar.actions.navigateTo = function(active, present) {
	present({ active: active }, navbar.state.render)
}

var models = models || {}
models.navbar = navbar

$(function() {
	navbar.view.display(`#repr-${navbar.selector}`, navbar.view(navbar))
})

