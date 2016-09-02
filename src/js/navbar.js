var navbar = {
	selector: 'navbar',
	items: {
		home: {
			name: 'Home',
			href: '#',
			usersAction: 'close'
		},
		users: {
			name: 'Users',
			href: '#users',
			usersAction: 'list'
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
	return $(`<ul id="repr-${model.selector}" class="nav navbar-nav"></ul>`).append(
		$.map(model.items, function(nav, key) {
			let el = $(`<li><a href="${nav.href}">${nav.name}</a></li>`)
			if (key == model.active) {
				el.addClass('active')
			}
			el.on('click', { active: key }, function(ev) {
				model.actions.navigateTo(ev.data, model.present)
				users.actions[nav.usersAction]({ active: nav.usersAction }, users.present)
			})
			return el
		})
	)
}
navbar.view.display = function(selector, repr) {
	$(selector).replaceWith(repr)
}

//
navbar.actions = {}
navbar.actions.navigateTo = function(data, present) {
	present(data, navbar.state.render)
}

$(function() {
	navbar.view.display(`#repr-${navbar.selector}`, navbar.view(navbar))
})
