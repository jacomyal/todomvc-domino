_This [TODO-MVC](http://todomvc.com/) case, based on the [empty template](https://github.com/tastejs/todomvc/tree/gh-pages/template), still needs to be tested on the [required browsers](https://github.com/tastejs/todomvc/blob/gh-pages/contributing.md#browser-compatibility). It will be submitted soon to the [official repository](https://github.com/tastejs/todomvc/)._


# domino.js TodoMVC example

> a JavaScript cascading controller for fast interactive Web interfaces prototyping

> _[domino.js - dominojs.org](http://dominojs.org)_


## Learning domino.js

Here are some links you may find helpful:

* [documentation and API reference](http://dominojs.org)
* [domino.js on GitHub](http://github.com/jacomyal/domino.js)

_If you have other helpful links to share, or find any of the links above no longer work, please [let us know](https://github.com/tastejs/todomvc/issues)._


## Implementation

The implementation is mostly inspired from the [jQuery implementation](http://todomvc.com/architecture-examples/jquery/).

The templates are compiled and rendered using [Hogan.js](http://twitter.github.io/hogan.js/), and the events bindings and DOM manipulation are made in pure JavaScript.


## Running

To run the app:

* Clone the repository: `git clone git@github.com:jacomyal/todomvc-domino`
* Go to the directory: `cd todomvc-domino`
* Install the dependencies with [Bower](http://bower.io/): `bower install`
* Spin up an HTTP server and visit http://localhost/.


## Credit

This TodoMVC application was created by [Alexis Jacomy](http://github.com/jacomyal).
