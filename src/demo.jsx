import React from 'react/addons'
import { List, ListItem } from './index'

React.initializeTouchEvents(true)

class Controller extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      actives: [true, false, false, false, false],
      content: ['hallo', 'world', 'was', 'geht', 'ab'],
      input: '',
    }
  }

  _onClick(i, _e) {
    this.setState(state => {
      state.actives[state.actives.indexOf(true)] = false
      state.actives[i] = true
    })
  }

  _onReorder(old, neu) {
    this.setState(state => {
      let tmp = state.content[old]
      state.content.splice(old, 1)
      state.content.splice(neu, 0, tmp)
      tmp = state.actives[old]
      state.actives.splice(old, 1)
      state.actives.splice(neu, 0, tmp)
    })
  }

  _onRemove(i, e) {
    e.stopPropagation()
    e.preventDefault()

    this.setState(state => {
      state.content.splice(i, 1)
      state.actives.splice(i, 1)
    })
  }

  _onInputChange(_e) {
    this.setState({
      input: event.target.value,
    })
  }

  _onInputKey(e) {
    if (e.keyCode !== 13) {
      return
    }

    this.setState(state => {
      state.content.push(state.input)
      state.actives.push(false)
      return { input: '' }
    })
  }

  render() {
    const lis = this.state.content.map((content, i) => {
      const props = {
        className: 'ReactList-item',
        onClick: e => this._onClick(i, e),
        onRemove: e => this._onRemove(i, e),
        key: content,
      }

      if (this.state.actives[i]) {
        props.className += ' ReactList-item--active'
      }

      return (
        <ListItem {...props}>
          {content}
        </ListItem>
      )
    })

    return (
      <div className='Demo'>
        <input
          className='Demo-input'
          type='text'
          placeholder='Enter text here...'
          value={this.state.input}
          onChange={e => this._onInputChange(e)}
          onKeyDown={e => this._onInputKey(e)}
        />
        <List className='ReactList' onReorder={(o, n) => this._onReorder(o, n)} enableDeleteTransitions={true} isDraggable={true}>
          {lis}
        </List>
      </div>
    )
  }
}

React.render(
  <Controller />,
  document.querySelector('div')
)
