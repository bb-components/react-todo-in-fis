/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

import {TodoFooter} from "./module/footer.jsx";
import {TodoItem} from "./module/todoItem.jsx";
import {TodoModel} from "./module/todoModel.js";

var app = app || {};

(function () {
  'use strict';

  app.ALL_TODOS = 'all';
  app.ACTIVE_TODOS = 'active';
  app.COMPLETED_TODOS = 'completed';

  var ENTER_KEY = 13;

  var TodoApp = React.createClass({
    getInitialState () {
      return {
        nowShowing: app.ALL_TODOS,
        editing: null
      };
    },

    componentDidMount () {
      var setState = this.setState;
      var router = Router({
        '/': setState.bind(this, {nowShowing: app.ALL_TODOS}),
        '/active': setState.bind(this, {nowShowing: app.ACTIVE_TODOS}),
        '/completed': setState.bind(this, {nowShowing: app.COMPLETED_TODOS})
      });
      router.init('/');
    },

    handleNewTodoKeyDown (event) {
      if (event.keyCode !== ENTER_KEY) {
        return;
      }

      event.preventDefault();

      var val = React.findDOMNode(this.refs.newField).value.trim();

      if (val) {
        this.props.model.addTodo(val);
        React.findDOMNode(this.refs.newField).value = '';
      }
    },

    toggleAll (event) {
      var checked = event.target.checked;
      this.props.model.toggleAll(checked);
    },

    toggle (todoToToggle) {
      this.props.model.toggle(todoToToggle);
    },

    destroy (todo) {
      this.props.model.destroy(todo);
    },

    edit (todo) {
      this.setState({editing: todo.id});
    },

    save (todoToSave, text) {
      this.props.model.save(todoToSave, text);
      this.setState({editing: null});
    },

    cancel () {
      this.setState({editing: null});
    },

    clearCompleted () {
      this.props.model.clearCompleted();
    },

    render () {
      var footer;
      var main;
      var todos = this.props.model.todos;

      var shownTodos = todos.filter((todo) => {
        switch (this.state.nowShowing) {
          case app.ACTIVE_TODOS:
            return !todo.completed;
          case app.COMPLETED_TODOS:
            return todo.completed;
          default:
            return true;
        }
      }, this);

      var todoItems = shownTodos.map((todo) => {
        return (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={this.toggle.bind(this, todo)}
            onDestroy={this.destroy.bind(this, todo)}
            onEdit={this.edit.bind(this, todo)}
            editing={this.state.editing === todo.id}
            onSave={this.save.bind(this, todo)}
            onCancel={this.cancel}
          />
        );
      }, this);

      var activeTodoCount = todos.reduce((accum, todo) => {
        return todo.completed ? accum : accum + 1;
      }, 0);

      var completedCount = todos.length - activeTodoCount;

      if (activeTodoCount || completedCount) {
        footer =
          <TodoFooter
            count={activeTodoCount}
            completedCount={completedCount}
            nowShowing={this.state.nowShowing}
            onClearCompleted={this.clearCompleted}
          />;
      }

      if (todos.length) {
        main = (
          <section id="main">
            <input
              id="toggle-all"
              type="checkbox"
              onChange={this.toggleAll}
              checked={activeTodoCount === 0}
            />
            <ul id="todo-list">
              {todoItems}
            </ul>
          </section>
        );
      }

      return (
        <div>
          <header id="header">
            <h1>todos</h1>
            <input
              ref="newField"
              id="new-todo"
              placeholder="What needs to be done?"
              onKeyDown={this.handleNewTodoKeyDown}
              autoFocus={true}
            />
          </header>
          {main}
          {footer}
        </div>
      );
    }
  });

  var model = new TodoModel('react-todos');

  function render() {
    React.render(
      <TodoApp model={model}/>,
      document.getElementById('todoapp')
    );
  }

  model.subscribe(render);
  render();
})();
