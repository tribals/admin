// M
var cities = {
    selector: 'main',
    pages: ['list', 'new', 'create', 'edit', 'update'],
    page: 'list'
}
cities.present = function(data, render) {
    if ('page' in data) {
        cities.page = data.page
    }

    if ('items' in data) {
        cities.items = data.items
    }

    if ('id' in data) {
        cities.id = data.id
    }

    if ('city' in data) {
        cities.city = data.city
    }

    if ('countries' in data) {
        cities.countries = data.countries
    }

    if ('alert' in data) {
        cities.alert = data.alert
    } else {
        delete cities.alert
    }

    if (cities.page === 'create') {
        api.spheres('cities').objects().post(cities.city, { template: 'sys' })
            .then(function(resp) {
                cities.page = 'edit'
                cities.id = resp.data.id
                cities.items[cities.id] = resp.data

                cities.alert = {
                    kind: 'success',
                    message: '<strong>Well done!</strong> City created successfully'
                }

                render(cities)
            })
            .catch(function(err) {
                console.log(err.message)

                cities.page = 'new'

                cities.alert = {
                    kind: 'danger',
                    message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
                }

                render(cities)
            })
    } else {
        render(cities)
    }
}

// S
cities.state = {}
cities.state.render = function(model) {
    model.state.representation(model, model.views.display)
    model.state.nextAction(model)
}
cities.state.representation = function(model, display) {
    let repr = model.views[model.page](model) // TODO: crap

    if (model.alert) {
        repr.prepend(alert.view(model))
    }

    display(`#repr-${model.selector}`, repr)
}
cities.state.nextAction = function(model) {
    if (model.page === 'list' && !model.countries) {
        model.actions.loadContries(model.present)
    }
}
// V
cities.views = {}
cities.views.display = function(selector, repr) {
    $(selector).replaceWith(repr)
}
cities.views.list = function(model) {
    let repr = $(
        `<div id="repr-${model.selector}" class="row">
            <button class="btn btn-primary pull-right" type="button">
                <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                Create <strong>City</strong>
            </button>
            <div class="col-md-12">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>##</th>
                            <th>Label</th>
                            <th>Geo name</th>
                            <th>Overall score</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>`
    )

    repr.find('button').on('click', function(ev) {
        model.actions.new(ev, model.present)
    })

    let items = $.map(model.items, function(city, id) {
        let el = $(
            `<tr>
                <td></td>
                <td>${city.label || ''}</td>
                <td>${city.geo_name || ''}</td>
                <td>${city.overall_score || ''}</td>
            </tr>`
        )
        el.on('click', { id: id }, function(ev) {
            model.actions.edit(ev, model.present)
        })
        return el
    })

    repr.find('tbody').append(items)

    return repr
}
cities.views.new = function(model) {
    let repr = $(
        `<div id="repr-${model.selector}" class="form-horizontal">
            <div class="page-header">
                <h1>Creating <strong>City</strong></h1>
            </div>
        </div>`
    )

    let city = model.city
    let countries = model.views.partials.countries(model.countries)
    let form = model.views.partials.form(city, countries)

    form.find('.form-group').first().after(
        `<div class="form-group">
            <label class="control-label col-md-2">Main image URL</label>
            <div class="col-md-8">
                <input type="url" required class="form-control" name="main_image_url" value="" />
            </div>
        </div>`
    )

    form.find('button[data-action="cancel"]').on('click', function(ev) {
        model.actions.list(ev, model.present)
    })

    form.on('submit', function(ev) {
        ev.preventDefault()
        model.actions.create(ev, model.present)
    })

    repr.append(form)
    return repr
}
cities.views.edit = function(model) {
    let repr = $(
        `<div id="repr-${model.selector}" class="form-horizontal">
            <div class="page-header">
                <h1>Changing <strong>City</strong></h1>
            </div>
        </div>`
    )

    let city = model.items[model.id]
    let countries = model.views.partials.countries(model.countries, city.properties['@pcities_countries'].name)
    let form = model.views.partials.form(city, countries)

    form.prepend(
        `<div class="form-group">
            <label for="" class="control-label col-md-2">ID</label>
            <div class="col-md-8">
                <input class="form-control" type="text" disabled value="${city.id}" />
            </div>
        </div>`
    )

    if (city.main_image_hash) {
        form.prepend(
            `<div class="form-group">
                <div class="col-md-offset-6 col-md-4">
                    <img src="${picserv.uri(city.main_image_hash)}" alt="" class="img-responsive pull-right" />
                </div>
            </div>`
        )
    }

    form.find('button[data-action="cancel"]').on('click', function(ev) {
        model.actions.list(ev, model.present)
    })

    form.find('button[type="submit"]').attr('disabled', 'disabled')
    form.on('submit', function(ev) {
        ev.preventDefault()
        model.actions.update(ev, model.present)
    })

    repr.append(form)
    return repr
}
// V.P
cities.views.partials = {}
cities.views.partials.form = function(city, countries) {
    let form = $(
            // <div class="form-group">
            //  <label class="control-label col-md-2">Main image URL</label>
            //  <div class="col-md-8">
            //      <input type="text" class="form-control" name="main_image_uri" value="${picserv.uri(city.main_image_hash)}" />
            //  </div>
            // </div>
        `<form>
            <div class="form-group">
                <label class="control-label col-md-2">Label</label>
                <div class="col-md-8">
                    <input type="text" required class="form-control" name="label" value="${city.label || ''}" />
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2">Description</label>
                <div class="col-md-8">
                    <textarea class="form-control" name="description" rows="5">${city.description || ''}</textarea>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2">Coordinates</label>
                <div class="col-md-8">
                    <div class="form-inline">
                        <div class="form-group">
                            <label class="control-label col-md-2">Lat</label>
                            <div class="col-md-2">
                                <input type="number" required step="any" class="form-control" name="properties.@pcities_coordinates.lat" value="${city.properties && city.properties['@pcities_coordinates'] && city.properties['@pcities_coordinates'].lat || ''}" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label col-md-2">Long</label>
                            <div class="col-md-2">
                                <input type="number" required step="any" class="form-control" name="properties.@pcities_coordinates.lng" value="${city.properties && city.properties['@pcities_coordinates'] && city.properties['@pcities_coordinates'].lng || ''}" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2">Country</label>
                <div class="col-md-8" id="repr-countries">
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2">Geo</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="extra.name" value="${city.name || ''}" />
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2">Population</label>
                <div class="col-md-8">
                    <input type="number" step="any" class="form-control" name="properties.@pcities_population" value="${city.properties && city.properties['@pcities_population'] || ''}" />
                </div>
            </div>
            <div class="form-group">
                <div class="col-md-offset-2 col-md-8">
                    <button type="submit" class="btn btn-default">Save</button>
                    <button type="button" class="btn btn-danger" data-action="cancel">Cancel</button>
                </div>
            </div>
        </form>`
    )

    if (city.properties && city.properties['@pcities_countries'] && city.properties['@pcities_countries'].name) {
        countries.find(`option[value="${city.properties['@pcities_countries'].name}"]`).attr('selected', 'selected')
    }

    form.find('#repr-countries').append(countries)
    return form
}
cities.views.partials.countries = function(countries) {
    let opts = countries.map(function(e) {
        return $(`<option value="${e.name}">${e.label}</option>`)
    })

    // TODO: placeholder value for delete country
    let sel = $(`<select name="properties.@pcities_countries" required class="form-control"><option></option></select>`)
    sel.append(opts)

    return sel
}

// A
cities.actions = {}
cities.actions.list = function(ev, present) {
    let data = {
        page: 'list'
    }
    // TODO: it's time to finally implement pagination
    api.spheres('cities').objects().get({ limit: 99999, fields: 'name' })
        .then(function(resp) {
            let items = {} // []?
            for (let e of resp.data) {
                items[e.id] = e
            }
            data.items = items
            present(data, cities.state.render)
        })
        .catch(function(err) {
            console.log(err.message)

            data.alert = {
                kind: 'danger',
                message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
            }

            present(data, cities.state.render)
        })
}
cities.actions.new = function(ev, present) {
    let data = {
        page: 'new',
        city: {}
    }
    present(data, cities.state.render)
}
cities.actions.create = function(ev, present) {
    let data = {
        page: 'create',
        city: {}
    }
    // make request body
    let form = ev.target
    for (let [k, v] of new FormData(form).entries()) {
        if (k.includes('.')) {
            // TODO: THIS IS GOVNISHE!111
            // handle keys
            let [first, ...rest] = k.split('.')
            let acc = data.city[first] || {}
            data.city[first] = acc

            while (rest.length > 1) {
                prop = rest.shift()
                acc = acc[prop] = acc[prop] || {}
            }

            // handle val
            let last = rest.shift() // really last

            if (['lat', 'lng'].includes(last)) {
                // acc[last] = +v // TODO: let's make code even more unreadeble!
                acc[last] = Number.parseFloat(v)
            } else if (last === '@pcities_population') {
                acc[last] = Number.parseInt(v)
            } else {
                acc[last] = v
            }
        } else {
            data.city[k] = v
        }
    }
    present(data, cities.state.render)
}
cities.actions.edit = function(ev, present) {
    let data = {
        page: 'edit',
        id: ev.data.id
    }
    present(data, cities.state.render)
}
cities.actions.update = function(ev, present) {
    console.log('UPDATE')
}
cities.actions.loadContries = function(present) {
    let data = {}
    api.spheres('cities').properties('@pcities_countries').get()
        .then(function(resp) {
            data.countries = resp.data.values

            present(data, cities.state.render)
        })
        .catch(function(err) {
            console.log(err.message)

            data.countries = [{
                name: '-- Failed to load countries --'
            }]
            data.alert = {
                kind: 'danger',
                message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
            }

            present(data, cities.state.render)
        })
}
// TODO
var models = models || {}
models.cities = cities
