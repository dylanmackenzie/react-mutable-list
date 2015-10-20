import React from 'react/addons'
import classSet from 'classnames'
import autobind from 'autobind-decorator'
import pureRender from 'pure-render-decorator'
import { pointerOffset, outerHeight } from 'utils'

const maxClickDuration = 200
const BEMSeparator = '--'
const deleteButtonClass = 'Delete'
function stopPropagation(e) {
  e.stopPropagation()
}

/**
 * A MutableListItem is a single item in a mutable list. It accepts
 * arbitrary DOM content as its children For convenience, it also
 * renders a button that calls the onRemove handler when pressed.
 */
@pureRender
class MutableListItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDragging: false,
    }

    this.dragOffset = [0, 0]

    this._outerHeight = null
    this._boundingClientRect = null

    this._clickFlag = false
  }

  getBoundingClientRect() {
    return this._boundingClientRect
  }

  getOuterHeight() {
    return this._outerHeight
  }

  // Calculate dimensions when an element is mounted
  componentDidMount() {
    const el = React.findDOMNode(this)
    this._outerHeight = outerHeight(el)
    this._boundingClientRect = el.getBoundingClientRect()

    el.addEventListener('transitionend', e => {
      this.props.onTransitionEnd(this.props.index, e)
    })
  }

  // Recalculate dimensions when an element is updated
  componentDidUpdate() {
    const el = React.findDOMNode(this)
    this._outerHeight = outerHeight(el)
    this._boundingClientRect = el.getBoundingClientRect()
  }

  componentWillLeave(cb) {
    const el = React.findDOMNode(this)
    el.style.visibility = 'hidden'
    this.props.onDelete(this.props.index, this.getOuterHeight(), cb)
  }

  // Determine if we have a click or a drag
  _onMouseDown(e) {
    // Only execute the drag logic if we have a left click
    if (e.button !== 0) {
      return
    }

    const el = React.findDOMNode(this)
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
    window.addEventListener('mousemove', this._onDrag)
    window.addEventListener('touchmove', this._onDrag)
    window.addEventListener('mouseup', this._onDragEnd)
    window.addEventListener('touchend', this._onDragEnd)
    this.dragOffset = pointerOffset(e, this.getBoundingClientRect())
    this.props.onDragStart(this, e)
    this.setState({
      isDragging: true,
    })
  }

  @autobind
  _onDrag(e) {
    if (e.targetTouches != null) {
      e.preventDefault()
    }

    this.props.onDrag(this, e)
  }

  @autobind
  _onDragEnd(e) {
    if (e.targetTouches != null) {
      e.preventDefault()
    }

    window.removeEventListener('mousemove', this._onDrag)
    window.removeEventListener('touchmove', this._onDrag)
    window.removeEventListener('mouseup', this._onDragEnd)
    window.removeEventListener('touchend', this._onDragEnd)
    this.props.onDragEnd(this, e)
    this.setState({
      isDragging: false,
    })
  }

  render() {
    const style = this.props.style
    if (this.props.enableTransformTransitions) {
      const transition = `transform ${this.props.transitionDuration}ms`
      if (style.transition == null || style.transition === '') {
        style.transition = transition
      } else {
        style.transition += ', ' + transition
      }
    }

    const baseClass = this.props.className && this.props.className.split(' ')[0] || 'ReactList-item'
    const props = {
      onMouseDown: e => this._onMouseDown(e),
      onTouchStart: e => this._onMouseDown(e),
      onMouseUp: e => this._onMouseUp(e),
      onTouchEnd: e => this._onMouseUp(e),
      style,
      key: this.props.key,
      className: classSet(this.props.className, {
        [`${baseClass}${BEMSeparator}dragging`]: this.state.isDragging,
      }),
    }

    return (
      <li {...props}>
        {this.props.children}
        <button
          className={`${baseClass}${deleteButtonClass}`}
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
          onClick={this.props.onRemove}>x</button>
      </li>
    )
  }
}

MutableListItem.defaultProps = {
  onClick: () => {},
  onRemove: () => {},
  enableTransformTransitions: false,
  transitionDuration: 300,
}

MutableListItem.propTypes = {
  onClick: React.PropTypes.func,
  /**
   * Function called whenever delete button is pressed. Actually
   * removing the list item from the props passed into MutableList
   * should be accomplished in this function
   */
  onRemove: React.PropTypes.func,
  /**
   * Duration of the transform transition for an individual list item.
   * Overrides the same property if set on the parent list.
   */
  transitionDuration: React.PropTypes.number,
  enableTransformTransitions: React.PropTypes.bool,
}

export default MutableListItem
