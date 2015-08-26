Mutable List
============

A [draggable, droppable and deletable list
component](//dylanmackenzie.github.io/react-mutable-list) for React.

Installation
------------

This component is available as an npm module which contains the jsx
source files in `src/`, the compiled commonJS ES5 files in `lib/`, and a
standalone browserified version which includes the entire react library
under `dist/list.js`.  To install, simply

    npm install react-mutable-list

The recommended usage is to require the module using commonJS syntax and
then use browserify or webpack to package your code for the browser.

```js
var MutableList = require('react-mutable-list').List
var MutableListItem = require('react-mutable-list').ListItem
```

Example
-------

```js
import React from 'react'
import { List, ListItem } from 'react-mutable-list'

class Controller extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            items: ['hello', 'world']
        }
    }

    onReorder(from, to) {
        this.setState(state => {
            let tmp = this.state.items[from]
            this.state.items.splice(from, 1)
            this.state.items.splice(to, 0, tmp)
        })
    }


    onRemove(index) {
        this.setState(state => {
            this.state.items.splice(index, 1)
        })
    }

    reorder() {
        return (
            <List onReorder={(f, t) => this.onReorder(f, t)}>
            {this.state.items.map((item, i) => (
                <ListItem onRemove={e => this.onRemove(i)}>{item}</ListItem>
            ))}
            </List>
        )
    }
}
```

For a more involved example, see [demo.jsx](https://github.com/dylanmackenzie/react-mutable-list/blob/master/src/demo.jsx)
