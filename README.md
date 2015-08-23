Mutable List
============

A draggable, droppable and deletable list component for React.

Example
-------

```es6
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

For a more involved example, see `src/demo.jsx`
