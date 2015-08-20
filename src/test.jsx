import React from 'react/addons'
import List from './list.jsx'

let props = {
  isDraggable: true,
  isRemovable: true,
}

React.render(
  <List {...props}>
    <li key={1} isActive={true}>hello</li>
    <li key={2}>world</li>
    <li key={3}>was</li>
    <li key={4}>geht</li>
    <li key={5}>ab</li>
  </List>,
  document.body
)
