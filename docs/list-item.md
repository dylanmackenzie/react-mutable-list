`ListItem` (component)
======================

A MutableListItem is a single item in a mutable list. It accepts
arbitrary DOM content as its children For convenience, it also
renders a button that calls the onRemove handler when pressed.

Props
-----

### `enableTransformTransitions`

type: `bool`
defaultValue: `false`


### `onClick`

type: `func`
defaultValue: `() => {}`


### `onRemove`

Function called whenever delete button is pressed. Actually
removing the list item from the props passed into MutableList
should be accomplished in this function

type: `func`
defaultValue: `() => {}`


### `transitionDuration`

Duration of the transform transition for an individual list item.
Overrides the same property if set on the parent list.

type: `number`
defaultValue: `300`

