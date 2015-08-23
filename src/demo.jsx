import React from 'react/addons'
import List from './list.jsx'
import ListItem from './list-item.jsx'

class Controller extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      actives: [true, false, false, false, false],
      content: ['hallo', 'world', 'was', 'geht', 'ab'],
      input: ''
    }
  }

  _onClick(i, e) {
    this.setState(state => {
      state.actives[state.actives.indexOf(true)] = false
      state.actives[i] = true
    })
  }

  _onReorder(old, neu) {
    this.setState(state => {
      let tmp = this.state.content[old]
      this.state.content.splice(old, 1)
      this.state.content.splice(neu, 0, tmp)
      tmp = this.state.actives[old]
      this.state.actives.splice(old, 1)
      this.state.actives.splice(neu, 0, tmp)
    })
  }

  _onRemove(i, e) {
    e.stopPropagation()
    e.preventDefault()

    this.setState(state => {
      this.state.content.splice(i, 1)
      this.state.actives.splice(i, 1)
    })
  }

  _onInputChange(e) {
    this.setState({
      input: event.target.value
    })
  }

  _onInputKey(e) {
    if (e.keyCode !== 13) {
      return
    }

    this.state.content.push(this.state.input)
    this.state.actives.push(false)
    this.setState({
      input: ''
    })
  }

  render() {
    let lis = this.state.content.map((content, i) => {
      let props = {
        onClick: e => this._onClick(i, e),
        onRemove: e => this._onRemove(i, e),
        isActive: this.state.actives[i],
        key: content,
      }
      return (
        <ListItem {...props}>
          {content}
        </ListItem>
      )
    })

    return (
      <div className='Demo'>
        <input className='Demo-input' type='text' value={this.state.input} onChange={e => this._onInputChange(e)} onKeyDown={e => this._onInputKey(e)} />
        <List onReorder={(o, n) => this._onReorder(o, n)} enableDeleteTransitions={true} isDraggable={true}>
          {lis}
        </List>
      </div>
    )
  }
}

React.render(
  <Controller />,
  document.body
)
