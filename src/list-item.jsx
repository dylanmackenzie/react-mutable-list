import React from 'react/addons'

const classSet = window.classNames

const maxClickDuration = 200

export default class MutableListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDragging: false
    }

    this.dragOffset = [0, 0]

    this._outerHeight = null
    this._boundingClientRect = null

    this._clickFlag = false
    this._handlers = {
      mouseMove: this._onDrag.bind(this),
      mouseUp: this._onDragEnd.bind(this),
    }
  }

  getBoundingClientRect() {
    return this._boundingClientRect
  }

  getOuterHeight() {
    return this._outerHeight
  }

  // Calculate dimensions when an element is mounted
  componentDidMount() {
    let el = React.findDOMNode(this)
    el.addEventListener('transitionend', e => {
      this.props.onTransitionEnd(this.props.index, e)
    })
    this._outerHeight = outerHeight(el)
    this._boundingClientRect = el.getBoundingClientRect()
  }

  // Recalculate dimensions when an element is updated
  componentDidUpdate() {
    let el = React.findDOMNode(this)
    this._outerHeight = outerHeight(el)
    this._boundingClientRect = el.getBoundingClientRect()
  }

  componentWillLeave(cb) {
    let el = React.findDOMNode(this)
    el.style.visibility = 'hidden'
    this.props.onDelete(this.props.index, this.getOuterHeight(), cb)
  }

  // Determine if we have a click or a drag
  _onMouseDown(e) {
    let el = React.findDOMNode(this)
    this._boundingClientRect = el.getBoundingClientRect()
    this._clickFlag = true

    // We need to persist this event to use it when the timeout fires,
    // otherwise React will reuse the same object to store new events
    e.persist()
    e.preventDefault()
    window.setTimeout(this._onDragStart.bind(this, e), maxClickDuration)
  }

  _onMouseUp(e) {
    if (!this._clickFlag) {
      return
    }

    this._clickFlag = false
    this.props.onClick(e)
  }

  _onDragStart(e) {
    if (!this._clickFlag) {
      return
    }

    this._clickFlag = false
    window.addEventListener('mousemove', this._handlers.mouseMove)
    window.addEventListener('mouseup', this._handlers.mouseUp)
    this.dragOffset = pointerOffset(e, this.getBoundingClientRect())
    this.props.onDragStart(this, e)
    this.setState({
      isDragging: true
    })
  }

  _onDrag(e) {
    this.props.onDrag(this, e)
  }

  _onDragEnd(e) {
    window.removeEventListener('mousemove', this._handlers.mouseMove)
    window.removeEventListener('mouseup', this._handlers.mouseUp)
    this.props.onDragEnd(this, e)
    this.setState({
      isDragging: false
    })
  }

  render() {
    let props = {
      onMouseDown: e => this._onMouseDown(e),
      onMouseUp: e => this._onMouseUp(e),
      style: this.props.style,
      key: this.props.key,
      className: classSet('ReactList-item', {
        'ReactList-item--active': this.props.isActive,
        'ReactList-item--dragging': this.state.isDragging
      }),
    }

    return (
      <li {...props}>
        {this.props.children}
        <button
          className={'ReactList-delete'}
          onMouseDown={e => e.stopPropagation()}
          onClick={this.props.onRemove}>x</button>
      </li>
    )
  }
}

function outerHeight(el) {
  let styles = window.getComputedStyle(el)
  let margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom)

  return el.offsetHeight + margin
}

function pointerOffset(e, rect) {
  let clientX = e.touches ? e.touches[0].clientX : e.clientX
  let clientY = e.touches ? e.touches[0].clientY : e.clientY
  let x = clientX - rect.left
  let y = clientY - rect.top

  // console.log([clientX, clientY], [rect.left, rect.top])

  return [x, y]
}
