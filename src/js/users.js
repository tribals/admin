// V = S( vm( M.present( A(data) ) ), nap(M))

var users = {
	selector: 'main',
	states: ['norender', 'close', 'list', 'new', 'create', 'edit', 'update'],
	active: 'list', // initial
	items: {},
	id: null
}
users.present = function(data, render) {
	let { active } = data

	if (users.states.includes(active)) {
		users.active = active
	}

	if ('items' in data) {
		users.items = data.items
	}

	if ('id' in data) {
		users.id = data.id
	}

	if ('alert' in data) {
		users.alert = data.alert
	}

	if (users.active == 'update') {
		api.users(users.id).post(data.user)
			.then(function(res) {
				users.active = 'edit'
				users.items[users.id] = res
				
				users.alert = {
					kind: 'success',
					message: '<strong>Well done!</strong> User updated successfully'
				}
				render(users)
			})
	} else {
		render(users)
	}
}

// state
users.state = {}
users.state.render = function(model) {
	model.state.representation(model, model.views.display)
	users.state.nextAction(model)
}
users.state.representation = function(model, display) {
	if (model.active == 'norender') {
		// pass
	} else {
		let repr = model.views[model.active](model) // TODO: clean this crap
		display(`#repr-${model.selector}`, repr)
	}
}
users.state.nextAction = function(model) {
	// is there any automatic action to which we can transit?
	if (model.alert) {
		model.actions.clearAlert({ active: 'norender', alert: null }, model.present)
	}
}

// view
users.views = {}
users.views.display = function(selector, repr) {
	$(selector).replaceWith(repr)
}
users.views.close = function(model) {
	return $(`<div id="repr-${model.selector}"></div>`)
}
users.views.list = function(model) {
	let repr = $(
		`<div id="repr-${model.selector}" class="row">
			<div class="col-md-12">
				<table class="table table-striped table-hover">
					<thead>
						<tr>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Label</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</div>`
	)

	let items = $.map(model.items, function(user, id) {
		let el = $(
			`<tr>
				<td>${user.first_name}</td>
				<td>${user.last_name}</td>
				<td>${user.label}</td>
			</tr>`
		)
		el.on('click', { active: 'edit', id: id }, function(ev) {
			model.actions.edit(ev.data, model.present)
		})
		return el
	})

	repr.find('tbody').append(items)

	return repr
}
users.views.edit = function(model) {
	let user = model.items[model.id]

	let repr = $(
		`<div id="repr-${model.selector}" class="form-horizontal">
			<div class="page-header">
				<h1>Changing User</h1>
			</div>
			<form>
				<div class="form-group">
					<label class="control-label col-md-2" for="">First name</label>
					<div class="col-md-8">
						<input type="text" class="form-control" name="first_name" value="${user.first_name}"/>
					</div>
				</div>
				<div class="form-group">
					<label class="control-label col-md-2" for="">Last name</label>
					<div class="col-md-8">
						<input type="text" class="form-control" name="last_name" value="${user.last_name}"/>
					</div>
				</div>
				<div class="form-group">
					<label class="control-label col-md-2" for="">Label</label>
					<div class="col-md-8">
						<input type="text" class="form-control" name="label" value="${user.label}"/>
					</div>
				</div>
				<div class="form-group">
					<div class="col-md-offset-2 col-md-8">
						<button type="submit" class="btn btn-default">Save</button>
					</div>
				</div>
			</form>
		</div>`
	)

	// alert
	if (model.alert) {
		let al = $(
			`<div class="alert alert-${model.alert.kind} alert-dismissable" role="alert">
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
				${model.alert.message}
			</div>`)
		repr.prepend(al)
	}

	let cancel = $('<button type="button" class="btn btn-danger">Cancel</button>')
	cancel.on('click', { active: 'list' }, function(ev) {
		model.actions.list(ev.data, model.present)
	})
	repr.find('.form-group:last-child').find('div').append(cancel)

	repr.find('form').on('submit', { active: 'update', id: model.id }, function(ev) {
		ev.preventDefault()
		ev.data.form = ev.target
		model.actions.update(ev.data, model.present)
	})

	return repr
}

//
users.actions = {}
users.actions.close = function(data, present) {
	present(data, users.state.render)
}
users.actions.list = function(data, present) {
	data.id = null
	api.users().get() // { filter: 'celebrity' })
		.then(function(res) {
			let items = {}
			for (let e of res) {
				items[e.id] = e
			}
			data.items = items
			present(data, users.state.render)
		})
		.catch(function(reason) {
			console.log(reason)
			present(data, users.state.render)
		})
}
users.actions.new = function(data, present) {
	data.user = {}
	for (let [k, v] of new FormData(data.form).entries()) {
		data.user[k] = v
	}
	present(data, users.state.render)
}
users.actions.edit = function(data, present) {
	present(data, users.state.render)
}
users.actions.update = function(data, present) {
	data.user = {}
	for (let [k, v] of new FormData(data.form).entries()) {
		data.user[k] = v
	}
	present(data, users.state.render)
}
users.actions.clearAlert = function(data, present) {
	present(data, users.state.render)
}