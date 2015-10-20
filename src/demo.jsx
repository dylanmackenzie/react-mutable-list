import React from 'react/addons'
import { List, ListItem } from './index'

React.initializeTouchEvents(true)

class Controller extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: 0,
      content: ['Charlie', 'Kenny', 'Cindy', 'Lucy', 'Buck'],
      input: '',
    }
  }

  _onClick(i, _e) {
    this.setState(state => {
      state.active = i
    })
  }

  _onReorder(from, to) {
    this.setState(state => {
      let active = state.content[state.active]
      let tmp = state.content[from]
      state.content.splice(from, 1)
      state.content.splice(to, 0, tmp)
      state.active = state.content.indexOf(active)
    })
  }

  _onRemove(i, e) {
    e.stopPropagation()
    e.preventDefault()

    this.setState(state => {
      state.content.splice(i, 1)
      if (state.active >= i) {
        --state.active
      }
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

      const size = '1.5em'
      const style = {
        borderRadius: '50% 50%',
        backgroundColor: 'grey',
        height: size,
        width: size,
        color: 'white',
        lineHeight: size,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: 'sans-serif',
      }

      if (this.state.active == i) {
        props.className += ' ReactList-item--active'
      }

      return (
        <ListItem {...props}>
          <span style={style}>{content.slice(0, 1)}</span>
          <span style={{marginLeft: '0.6em'}} className='ReactList-name'>
            {content}
          </span>
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
        <List className='ReactList' onReorder={(o, n) => this._onReorder(o, n)} enableDeleteTransitions={true}>
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
