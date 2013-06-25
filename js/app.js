(function(window) {
  'use strict';

  domino.settings({
    clone: true,
    verbose: true,
    strict: true
  });

  domino.struct.add('todo', {
    id: 'string',
    title: 'string',
    completed: 'boolean'
  });

  domino.struct.add('mode', function(value) {
    return ['all', 'active', 'completed'].indexOf(value) >= 0;
  });


  // CONTROLER:
  // **********
  var controller = new domino({
    name: 'todo',
    properties: [
      {
        id: 'todos',
        type: ['todo'],
        description: 'The array of the tasks to do.',
        triggers: 'updateTodos',
        dispatch: 'todosUpdated',
        value: []
      }
    ],
    hacks: [
      {
        triggers: 'addTodo',
        description: 'Push a todo object to the todos array.',
        method: function(e) {
          var todo = {
            completed: ('completed' in e.data) ? e.data.completed : false,
            id: ('id' in e.data) ? e.data.id : this.expand('newId'),
            title: e.data.title || ''
          };

          this.update(
            'todos',
            this.get('todos').concat([ todo ])
          );
        }
      },
      {
        triggers: 'updateTodo',
        description: 'Update a todo object, or delete it if "title" is an ' +
                     'empty string.',
        method: function(e) {
          var todos = this.get('todos'),
              id = e.data.id;

          if (e.data.title === '')
            this.dispatchEvent('deleteTodo', {
              id: id
            });
          else {
            todos.some(function(todo) {
              if (todo.id === id) {
                if ('title' in e.data)
                  todo.title = e.data.title;
                if ('completed' in e.data)
                  todo.completed = e.data.completed;

                return true;
              }
            });

            this.update('todos', todos);
          }
        }
      },
      {
        triggers: 'deleteTodo',
        description: 'Delete a todo object.',
        method: function(e) {
          this.update(
            'todos',
            this.get('todos').filter(function(todo) {
              return todo.id !== e.data.id;
            })
          );
        }
      },
      {
        triggers: 'deleteCompletedTodos',
        description: 'Delete each completed todo object.',
        method: function() {
          this.update(
            'todos',
            this.get('todos').filter(function(todo) {
              return !todo.completed;
            })
          );
        }
      },
      {
        triggers: 'toggleTodo',
        description: 'Toggle the "completed" flag of a specified todo object.',
        method: function(e) {
          var todo = this.expand('todosHash')[e.data.id];

          if (todo)
            this.dispatchEvent('updateTodo', {
              id: todo.id,
              completed: !todo.completed
            });
        }
      },
      {
        triggers: 'toggleAll',
        description: 'Toggle the "completed" flag of each todo object.',
        method: function(e) {
          this.update(
            'todos',
            this.get('todos').map(function(todo) {
              todo.completed = e.data.completed
              return todo;
            })
          );
        }
      },
      {
        triggers: 'todosUpdated',
        description: 'Updates the local storage.',
        method: function(e) {
          localStorage.setItem(
            'todos-domino',
            JSON.stringify(this.get('todos'))
          );
        }
      }
    ],
    shortcuts: [
      {
        id: 'todosHash',
        description: 'Returns a hash of referenced todo objects',
        method: function() {
          return this.get('todos').reduce(function(hash, todo) {
            hash[todo.id] = todo;
            return hash;
          }, {})
        }
      },
      {
        id: 'todoCount',
        description: 'Returns the number of todo object.',
        method: function() {
          return this.get('todos').length;
        }
      },
      {
        id: 'activeTodoCount',
        description: 'Returns the number of active todo object.',
        method: function() {
          return this.get('todos').filter(function(todo) {
            return !todo.completed;
          }).length;
        }
      },
      {
        id: 'completedTodos',
        description: 'Returns the number of completed todo object.',
        method: function() {
          return this.get('todos').filter(function(todo) {
            return todo.completed;
          }).length;
        }
      },
      {
        id: 'newId',
        description: 'Generates and returns a unique ID.',
        method: function() {
          var rawId = Math.floor((1 + Math.random()) * 0x10000);
          return rawId.toString(16).substring(1);
        }
      }
    ]
  });


  // MODULES:
  // ********
  controller.addModule(function() {
    // Header module:
    domino.module.call(this);

    var _self = this,
        _newTodo = document.getElementById('new-todo'),
        _toggleAll = document.getElementById('toggle-all');

    _newTodo.addEventListener('keyup', function(e) {
      var val = e.target.value.trim();

      if (e.which !== 13 || !val)
        return;

      e.target.value = '';
      _self.dispatchEvent('addTodo', {
        title: val
      });
    });

    _toggleAll.addEventListener('change', function(e) {
      _self.dispatchEvent('toggleAll', {
        completed: e.target.checked
      });
    });
  });

  controller.addModule(function() {
    // List module:
    domino.module.call(this);

    var _self = this,
        _todoList = document.getElementById('todo-list'),
        _todoTemplate =
          Hogan.compile(document.getElementById('todo-template').innerHTML);

    _todoList.addEventListener('dblclick', function(e) {
      var li,
          classes;

      if (e.target.nodeName === 'LABEL') {
        li = e.target;

        while (li.nodeName !== 'LI')
          li = li.parentNode;

        classes = (li.getAttribute('class') || '').split(' ');

        if (classes.indexOf('editing') < 0) {
          classes.push('editing');
          li.setAttribute('class', classes.join(' '));
        }

        li.querySelector('.edit').focus();
      }
    });

    _todoList.addEventListener('keypress', function(e) {
      if (e.target.getAttribute('class') === 'edit' && e.which === 13)
        e.target.blur();
    });

    _todoList.addEventListener('change', function(e) {
      if (e.target.getAttribute('type') === 'checkbox')
        _self.dispatchEvent('toggleTodo', {
          id: e.target.parentNode.parentNode.getAttribute('data-id')
        });
    });

    _todoList.addEventListener('blur', function(e) {
      var li;

      if (e.target.getAttribute('class') === 'edit') {
        li = e.target;

        while (li.nodeName !== 'LI')
          li = li.parentNode;

        _self.dispatchEvent('updateTodo', {
          id: li.getAttribute('data-id'),
          title: li.querySelector('.edit').value.trim()
        });
      }
    }, true);

    _todoList.addEventListener('click', function(e) {
      if (e.target.getAttribute('class') === 'destroy')
        _self.dispatchEvent('deleteTodo', {
          id: e.target.parentNode.parentNode.getAttribute('data-id')
        });
    });

    this.triggers.properties.todos = function(controller) {
      _todoList.innerHTML = _todoTemplate.render({
        todos: controller.get('todos')
      });
    }
  });

  controller.addModule(function() {
    // Footer module:
    domino.module.call(this);

    var _self = this,
        _footer = document.getElementById('footer'),
        _footerTemplate =
          Hogan.compile(document.getElementById('footer-template').innerHTML);

    _footer.addEventListener('click', function(e) {
      if (e.target.id === 'clear-completed')
        _self.dispatchEvent('deleteCompletedTodos');
    });

    this.triggers.properties.todos = function(controller) {
      var todos = controller.get('todos'),
          todoCount = this.expand('todoCount'),
          activeTodoCount = this.expand('activeTodoCount'),
          completedTodos = this.expand('completedTodos');

      _footer.innerHTML = _footerTemplate.render({
        activeTodoWord: 'item' + (activeTodoCount !== 1 ? 's' : ''),
        activeTodoCount: activeTodoCount,
        completedTodos: completedTodos
      });

      if (todoCount)
        _footer.removeAttribute('hidden');
      else
        _footer.setAttribute('hidden', 'hidden');
    }
  });


  // INITIALIZE DATA:
  // ****************
  controller.update(
    'todos',
    JSON.parse(localStorage.getItem('todos-domino')) || []
  );
})(window);
