// V = S( vm( M.present( A(data) ) ), nap(M))

var users = {
    selector: 'main',
    pages: ['list', 'new', 'create', 'edit', 'update'],
    page: 'list'
}
users.present = function(data, render) {
    let { page } = data

    if (users.pages.includes(page)) {
        users.page = page
    }

    // accept
    if ('items' in data) {
        users.items = data.items
    }

    if ('id' in data) {
        users.id = data.id
    }

    if ('user' in data) {
        users.user = data.user
    }

    // autoreset
    if ('alert' in data) {
        users.alert = data.alert
    } else {
        delete users.alert
    }

    if (users.page == 'update') {
        api.users(users.id).post(users.user)
            .then(function(resp) {
                users.page = 'edit'
                users.items[users.id] = resp.data
                
                users.alert = {
                    kind: 'success',
                    message: '<strong>Well done!</strong> User updated successfully'
                }
                render(users)
            })
            .catch(function(err) {
                console.log(err.message)
                users.page = 'edit'

                users.alert = {
                    kind: 'danger',
                    message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
                }
                render(users)
            })
    } else if (users.page == 'create') {
        api.users().post({ login_pass: users.user })
            .then(function(resp) {
                users.page = 'edit'
                users.id = resp.data.id

                if (users.user.extra) {
                    api.users(users.id).extra().post({ data: users.user.extra }) // TODO: shit
                        .then(function(resp) {
                            users.items[users.id] = resp.data

                            users.alert = {
                                kind: 'success',
                                message: '<strong>Well done!</strong> User created successfully'
                            }
                            render(users)
                        })
                        .catch(function(err) {
                            console.log(err.message)
                            users.page = 'new'

                            users.alert = {
                                kind: 'danger',
                                message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
                            }
                            render(users)
                        })
                } else {
                    users.items[users.id] = resp.data

                    users.alert = {
                        kind: 'success',
                        message: '<strong>Well done!</strong> User created successfully'
                    }

                    render(users)
                }
            })
            .catch(function(err) {
                console.log(err.message)
                users.page = 'new'

                users.alert = {
                    kind: 'danger',
                    message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
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
    // model.state.nextAction(model)
}
users.state.representation = function(model, display) {
    let repr = model.views[model.page](model) // TODO: clean this crap

    if (model.alert) {
        repr.prepend(alert.view(model))
    }
    // TODO: alerts (independent model?)
    display(`#repr-${model.selector}`, repr)
}
users.state.nextAction = function(model) {
    // is there any automatic action to which we can transit?
}

// view
users.views = {}
users.views.display = function(selector, repr) {
    $(selector).replaceWith(repr)
}
users.views.list = function(model) {
    let repr = $(
        `<div id="repr-${model.selector}" class="row">
            <button class="btn btn-primary pull-right" type="button">
                <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                Create <strong>User</strong>
            </button>
            <div class="col-md-12">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>##</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Label</th>
                            <th>Celebrity</th>
                            <th>Expert</th>
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

    let items = $.map(model.items, function(user, id) {
        let celebrity = user.extra && user.extra.features && user.extra.features.celebrity
        let expert = user.extra && user.extra.features && user.extra.features.expert
        let el = $(
            `<tr>
                <td></td>
                <td>${user.first_name || ''}</td>
                <td>${user.last_name || ''}</td>
                <td>${user.label || ''}</td>
                <td>${celebrity ? '<span class="glyphicon glyphicon-star"></span>' : ''}</td>
                <td>${expert ? '<span class="glyphicon glyphicon-education"></span>' : ''}</td>
            </tr>`
        )
        el.on('click', { id: id }, function(ev) {
            model.actions.edit(ev, model.present)
        })
        return el
    })

    repr.find('tbody').append(items)

    // let pager = model.views.partials.pagination(model.pagination)

    return repr
}
users.views.new = function(model) {
    let repr = $(
        `<div id="repr-${model.selector}" class="form-horizontal">
            <div class="page-header">
                <h1>Creating User</h1>
            </div>
        </div>`
    )

    let form = model.views.partials.form(model.user)
    
    form.prepend(
        `<div class="form-group">
            <label class="control-label col-md-2" for="">Login</label>
            <div class="col-md-8">
                <input type="text" class="form-control" name="login" value="${model.user.login || ''}"/>
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
users.views.edit = function(model) {
    let repr = $(
        `<div id="repr-${model.selector}" class="form-horizontal">
            <div class="page-header">
                <h1>Changing <strong>User</strong></h1>
            </div>
        </div>`
    )

    let user = model.items[model.id]
    let form = model.views.partials.form(user)

    form.prepend(
        `<div class="form-group">
            <label class="control-label col-md-2" for="">ID</label>
            <div class="col-md-8">
                <input type="text" class="form-control" name="id" value="${user.id || ''}" disabled/>
            </div>
        </div>`
    )

    if (user.main_image_hash) {
        form.prepend(
            `<div class="form-group">
                <div class="col-md-offset-6 col-md-4">
                    <img src="${picserv.uri(user.main_image_hash)}" alt="" class="img-responsive pull-right" />
                </div>
            </div>`
        )
    }

    form.find('button[data-action="cancel"]').on('click', function(ev) {
        model.actions.list(ev, model.present)
    })

    form.find('input[type="file"]').on('change', function(ev) {
        let files = ev.target.files

        if (files.length) {
            let rd = new FileReader()
            rd.onload = function(pev) {
                // TODO: hooooly shit... depends on position of html element in DOM tree
                $(ev.target).next().val(pev.target.result)
            }
            rd.readAsDataURL(files[0])
        }
    })

    form.on('submit', function(ev) {
        ev.preventDefault()
        model.actions.update(ev, model.present)
    })

    repr.append(form)

    return repr
}

users.views.partials = {}
users.views.partials.form = function(user) {
    return $(
        `<form>
            <div class="form-group">
                <label class="control-label col-md-2" for="">Main image</label>
                <div class="col-md-8">
                    <input type="file" class="form-control" accept="image/*" />
                    <input type="hidden" name="main_image_file" />
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2" for="">First name</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="first_name" value="${user.first_name || ''}"/>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2" for="">Last name</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="last_name" value="${user.last_name || ''}"/>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-2" for="">Label</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="label" value="${user.label || ''}"/>
                </div>
            </div>
            <div class="form-group">
                <div class="checkbox col-md-8 col-md-offset-2">
                    <label>
                        <input type="hidden" name="celebrity" value="false"/>
                        <input type="checkbox" name="celebrity" value="true" ${user.extra && user.extra.features && user.extra.features.celebrity ? "checked" : ""}/>
                        Celebrity
                    </label>
                </div>
            </div>
            <div class="form-group">
                <div class="checkbox col-md-8 col-md-offset-2">
                    <label>
                        <input type="hidden" name="expert" value="false"/>
                        <input type="checkbox" name="expert" value="true" ${user.extra && user.extra.features && user.extra.features.expert ? "checked" : ""}/>
                        Expert
                    </label>
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
}

// users.views.partials.pagination = function(pagination) {
//     let pager = $(
//         `<nav aria-label="Page navigation">
//             <ul class="pagination">
//             </ul>
//         </nav>`
//     )

//     let pages = Math.ceil(pagination.total / pagination.per)

//     for (let i = 1; i <= pages; i++) {
//         let p = $(`<li><a href="#">${i}</a></li>`)
//         if (i == pagination.current) {
//             p.addClass('active')
//         }
//         pager.find('ul').append(p)
//     }

//     return pager
// }

// data = action(event)
users.actions = {}
users.actions.list = function(ev, present) {
    let data = {
        page: 'list'
    }
    api.users().get({ template: 'sys', limit: 9999 }) // filter: 'celebrity', 
        .then(function(resp) {
            // NO:
            // data.items = {}
            // what if respense is empty?
            let items = {}
            for (let e of resp.data) {
                items[e.id] = e
            }
            // OK:
            data.items = items
            // we must set data properties if and only if there is a real value for it
            present(data, users.state.render)
        })
        .catch(function(err) {
            console.log(err.message)
            // OK:
            data.alert = {
            // data.alert guaranteed has value
                kind: 'danger',
                message: '<strong>Oops!</strong> Something went wrong... ¯\\_(ツ)_/¯'
            }
            present(data, users.state.render)
        })
}
users.actions.new = function(ev, present) {
    let data = {
        page: 'new',
        user: {} // OK: user must be an object for `new`
    }
    present(data, users.state.render)
}
users.actions.create = function(ev, present) {
    let data = {
        page: 'create',
        user: {}
    }
    let form = ev.target
    for (let [k, v] of new FormData(form).entries()) {
        if (['celebrity', 'expert'].includes(k)) {
            // TODO: hooooooly shit...
            data.user.extra = data.user.extra || {}
            data.user.extra.features = data.user.extra.features || {}
            data.user.extra.features[k] = v
        } else {
            data.user[k] = v
        }
    }
    present(data, users.state.render)
}
users.actions.edit = function(ev, present) {
    let data = {
        page: 'edit',
        id: ev.data.id
    }
    present(data, users.state.render)
}
users.actions.update = function(ev, present) {
    let data = {
        page: 'update',
        user: {}
    }
    let form = ev.target
    for (let [k, v] of new FormData(form).entries()) {
        if (['celebrity', 'expert'].includes(k)) {
            // TODO: hooooooly shit...
            data.user.extra = data.user.extra || {}
            data.user.extra.features = data.user.extra.features || {}
            data.user.extra.features[k] = v
        } else {
            data.user[k] = v
        }
    }

    if (data.user.main_image_file) {
        picserv.upload(data.user.main_image_file)
            .then(function(resp) {
                data.user.main_image_hash = resp.hash
                present(data, users.state.render)
            })
            .catch(function(err) {
                console.log(err)
                present(data, users.state.render)
            })
    }
}

//
var alert = {}
alert.view = function(model) {
    return $(
        // `<div class="row">
            `<div class="alert alert-${model.alert.kind} alert-dismissable role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                ${model.alert.message}
            </div>`
        // </div>`
    )
}

var models = models || {}
models.users = users
