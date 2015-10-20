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

MutableList automatically applies BEM-style class names to allow the
user to easily style the list in its various states. The first
className passed into a List or ListItem is used as a base class. All
modifier classes are named like `{baseClass}--{modifier}`. If no
classes are given to the list components, default base classes of
'ReactList' and 'ReactList-item' are used.

When a user is dragging an item, the dragged item and the list will
get a modifier of 'dragging'.

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

