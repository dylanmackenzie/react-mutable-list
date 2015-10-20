import React from 'react/addons'
import classSet from 'classnames'
import autobind from 'autobind-decorator'
import pureRender from 'pure-render-decorator'
import { pointerOffset, outerHeight } from 'utils'

const ReactTransitionGroup = React.addons.TransitionGroup
const BEMSeparator = '--'

/**
 * A MutableListView represents a single, vertical list from which items
 * can be added, deleted, and rearranged. Each item can contain any
 * combination of DOM elements or React components desired by the user.
 * e.g.
 *
 *  <List>
 *    <ListItem>Hello</ListItem>
 *    <ListItem><b>World!</b></ListItem>
 *  </List>
 *
 * MutableList automatically applies BEM-style class names to allow the
 * user to easily style the list in its various states. The first
 * className passed into a List or ListItem is used as a base class. All
 * modifier classes are named like `{baseClass}--{modifier}`. If no
 * classes are given to the list components, default base classes of
 * 'ReactList' and 'ReactList-item' are used.
 *
 * When a user is dragging an item, the dragged item and the list will
 * get a modifier of 'dragging'.
 */
@pureRender
class MutableListView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dragItem: null,
      dragIndex: 0,
      dragTransform: [0, 0],
      deletedIndex: -1,
      deletedHeight: 0,
      deletedCallback: null,
    }
  }

  @autobind
  _onItemDelete(index, height, cb) {
    if (index === React.Children.count(this.props.children)) {
      cb()
      return
    }

    this.setState(state => {
      // If another item has not finished its delete transition, delete
      // this one immediately.
      if (state.deletedCallback != null) {
        cb()
        return
      }

      return {
        deletedIndex: index,
        deletedHeight: height,
        deletedCallback: cb,
      }
    })
  }

  _onItemDeleted() {
    this.state.deletedCallback()
    this.setState({
      deletedIndex: -1,
      deletedHeight: 0,
      deletedCallback: null,
    })
  }

  @autobind
  _onItemTransitionEnd(_index, e) {
    if (this.state.deletedCallback == null || e.propertyName !== 'transform') {
      return
    }

    this._onItemDeleted()
  }

  @autobind
  _onDragStart(item, _e) {
    this.setState({
      dragItem: item,
      dragIndex: this._getNewIndex(item),
      dragTransform: [0, 0],
    })
  }

  @autobind
  _onDrag(item, e) {
    const offset = item.dragOffset
    const delta = pointerOffset(e, item.getBoundingClientRect())

    this.setState(state => ({
      dragIndex: this._getNewIndex(item),
      dragTransform: [
        state.dragTransform[0] + delta[0] - offset[0],
        state.dragTransform[1] + delta[1] - offset[1],
      ],
    }))
  }

  @autobind
  _onDragEnd(item, _e) {
    const oldIndex = item.props.index
    const newIndex = this._getNewIndex(item)

    if (oldIndex !== newIndex) {
      this.props.onReorder(oldIndex, newIndex)
    }

    this.setState({
      dragItem: null,
    })
  }

  _getNewIndex(item) {
    const rect = item.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2

    // Find the top of the list in terms of the client viewport,
    const list = React.findDOMNode(this)

    // Search through every list item and find the appropriate index
    let stop = list.getBoundingClientRect().top
    let newIndex = 0
    for (let i = 0, len = list.children.length; i < len; i++) {
      const el = list.children[i]
      stop += outerHeight(el)
      if (stop > midpoint) {
        break
      } else {
        ++newIndex
      }
    }

    return newIndex
  }

  render() {
    const newIndex = this.state.dragIndex
    const oldIndex = (this.state.dragItem != null)
      ? this.state.dragItem.props.index
      : -1
    const maxIndex = Math.max(newIndex, oldIndex)
    const minIndex = Math.min(newIndex, oldIndex)

    const transform = this.state.dragTransform
    const itemHeight = (this.state.dragItem != null)
      ? this.state.dragItem.getOuterHeight()
      : this.state.deletedHeight

    const upTransformString = `translateY(-${itemHeight}px)`
    const dragTransformString = (newIndex < oldIndex)
      ? `translateY(${itemHeight}px)`
      : upTransformString

    const items = React.Children.map(this.props.children, (child, i) => {
      let style = child.props.style || {}
      let enableTransformTransitions = false

      if (this.state.deletedIndex !== -1 && i >= this.state.deletedIndex) {
        enableTransformTransitions = true
        style.transform = upTransformString
      }

      if (this.state.dragItem != null) {
        if (i === this.state.dragItem.props.index) {
          // Translate the dragged element to the cursor
          style.transform = `translate(${transform[0]}px, ${transform[1]}px)`
        } else {
          enableTransformTransitions = true
          if (i >= minIndex && i <= maxIndex) {
            style.transform = dragTransformString
          }
        }
      }

      return React.cloneElement(child, {
        style,
        index: i,
        enableTransformTransitions,
        transitionDuration: child.props.transitionDuration || this.props.transitionDuration,
        onDragStart: this._onDragStart,
        onDrag: this._onDrag,
        onDragEnd: this._onDragEnd,
        onDelete: this._onItemDelete,
        onTransitionEnd: this._onItemTransitionEnd,
      })
    })

    let baseClass = 'ReactList'
    if (this.props.className) {
      baseClass = this.props.className.split(' ')[0]
    }

    const className = classSet(this.props.className, {
      [`${baseClass}${BEMSeparator}dragging`]: this.state.dragItem != null,
      [`${baseClass}${BEMSeparator}deleting`]: this.state.deletedIndex !== -1,
    })

    if (this.props.enableDeleteTransitions) {
      return (
        <ReactTransitionGroup
          component='ul'
          className={className}
        >
          {items}
        </ReactTransitionGroup>
      )
    }

    return (
      <ul className={className}>
        {items}
      </ul>
    )
  }
}

MutableListView.defaultProps = {
  enableDeleteTransitions: false,
  onReorder: () => {},
  transitionDuration: 300,
}

MutableListView.propTypes = {
  /**
   * When a list item is deleted and `enableDeleteTransitions` is true,
   * elements below the deleted one will be transitioned into their new
   * place in the list.
   */
  enableDeleteTransitions: React.PropTypes.bool,
  /**
   * Function called whenever list items are dragged into a new
   * position, with a signature of (oldIndex, newIndex).
   */
  onReorder: React.PropTypes.func,
  /**
   * Duration of the transform transition for each of the list's
   * children. Can be overridden item by item by setting it directly on
   * the list items.
   */
  transitionDuration: React.PropTypes.number,
}

export default MutableListView
