var home = {
	selector: 'main',
	page: 'home'
}
home.present = function(data, render) {
	render(home)
}

home.state = {}
home.state.render = function(model) {
	model.state.representation(model, model.display)
}
home.state.representation = function(model, display) {
	display(`#repr-${model.selector}`, model.view(model))
}
home.view = function(model) {
	return $(`<div id="repr-${model.selector}"></div>`)
}
home.display = function(selector, repr) {
	$(selector).replaceWith(repr)
}
home.actions = {}
home.actions.home = function(ev, present) {
	present({}, home.state.render)
}

var models = models || {}

models.home = home
