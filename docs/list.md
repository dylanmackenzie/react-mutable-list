`List` (component)
==================

A MutableListView represents a single, vertical list from which items
can be added, deleted, and rearranged. Each item can contain any
combination of DOM elements or React components desired by the user.
e.g.

 <List>
   <ListItem>Hello</ListItem>
   <ListItem><b>World!</b></ListItem>
 </List>

Props
-----

### `enableDeleteTransitions`

When a list item is deleted and `enableDeleteTransitions` is true,
elements below the deleted one will be transitioned into their new
place in the list.

type: `bool`
defaultValue: `false`


### `onReorder`

Function called whenever list items are dragged into a new
position, with a signature of (oldIndex, newIndex).

type: `func`
defaultValue: `() => {}`


### `transitionDuration`

Duration of the transform transition for each of the list's
children. Can be overridden item by item by setting it directly on
the list items.

type: `number`
defaultValue: `300`

