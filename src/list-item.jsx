import React from 'react/addons'
import classSet from 'classnames'

const maxClickDuration = 200
const BEMSeparator = '--'
const deleteButtonClass = 'Delete'

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
    this._outerHeight = outerHeight(el)
    this._boundingClientRect = el.getBoundingClientRect()

    el.addEventListener('transitionend', e => {
      this.props.onTransitionEnd(this.props.index, e)
    })
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
    window.addEventListener('touchmove', this._handlers.mouseMove)
    window.addEventListener('mouseup', this._handlers.mouseUp)
    window.addEventListener('touchend', this._handlers.mouseUp)
    this.dragOffset = pointerOffset(e, this.getBoundingClientRect())
    this.props.onDragStart(this, e)
    this.setState({
      isDragging: true
    })
  }

  _onDrag(e) {
    if (e.targetTouches != null) {
      e.preventDefault()
    }

    this.props.onDrag(this, e)
  }

  _onDragEnd(e) {
    if (e.targetTouches != null) {
      e.preventDefault()
    }

    window.removeEventListener('mousemove', this._handlers.mouseMove)
    window.removeEventListener('touchmove', this._handlers.mouseMove)
    window.removeEventListener('mouseup', this._handlers.mouseUp)
    window.removeEventListener('touchend', this._handlers.mouseUp)
    this.props.onDragEnd(this, e)
    this.setState({
      isDragging: false
    })
  }

  render() {
    let baseClass = this.props.className && this.props.className.split(' ')[0] || 'ReactList-item'
    let props = {
      onMouseDown: e => this._onMouseDown(e),
      onTouchStart: e => this._onMouseDown(e),
      onMouseUp: e => this._onMouseUp(e),
      onTouchEnd: e => this._onMouseUp(e),
      style: this.props.style,
      key: this.props.key,
      className: classSet(this.props.className, {
        [`${baseClass}${BEMSeparator}active`]: this.props.isActive,
        [`${baseClass}${BEMSeparator}dragging`]: this.state.isDragging,
        [`${baseClass}${BEMSeparator}enableTransformTransitions`]: this.props.enableTransformTransitions,
      }),
    }

    return (
      <li {...props}>
        {this.props.children}
        <button
          className={`${baseClass}${deleteButtonClass}`}
          onMouseDown={e => e.stopPropagation()}
          onClick={this.props.onRemove}>x</button>
      </li>
    )
  }
}

MutableListItem.defaultProps = {
  onClick: () => {},
  onRemove: () => {},
  isActive: false,
  enableTransformTransitions: false,
}

MutableListItem.propTypes = {
  onClick: React.PropTypes.func,
  onRemove: React.PropTypes.func,
  isActive: React.PropTypes.bool,
  enableTransformTransitions: React.PropTypes.bool,
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
