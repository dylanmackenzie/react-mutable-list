import React from 'react/addons'
import classSet from 'classnames'

const ReactTransitionGroup = React.addons.TransitionGroup

// A MutableListView represents a single list from which items can be
// added, deleted, and rearranged.
export default class MutableListView extends React.Component {
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

  _onItemDelete(index, height, cb) {
    if (index === React.Children.count(this.props.children)) {
      cb()
      return
    }

    this.setState({
      deletedIndex: index,
      deletedHeight: height,
      deletedCallback: cb,
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

  _onItemTransitionEnd(index, e) {
    if (this.state.deletedCallback == null || e.propertyName !== 'transform') {
      return
    }

    this._onItemDeleted()
  }

  _onDragStart(item, e) {
    this.setState({
      dragItem: item,
      dragIndex: this._getNewIndex(item),
      dragTransform: [0, 0],
    })
  }

  _onDrag(item, e) {
    let offset = item.dragOffset
    let delta = pointerOffset(e, item.getBoundingClientRect())

    this.setState(state => ({
      dragIndex: this._getNewIndex(item),
      dragTransform: [
        state.dragTransform[0] + delta[0] - offset[0],
        state.dragTransform[1] + delta[1] - offset[1]
      ]
    }))
  }

  _onDragEnd(item, e) {
    let oldIndex = item.props.index
    let newIndex = this._getNewIndex(item)

    if (oldIndex !== newIndex) {
      this.props.onReorder(oldIndex, newIndex)
    }

    this.setState({
      dragItem: null
    })
  }

  _getNewIndex(item) {
    let offset = item.dragOffset
    let rect = item.getBoundingClientRect()
    let midpoint = rect.top + rect.height / 2

    // Find the top of the list in terms of the client viewport,
    let list = React.findDOMNode(this)
    let stop = list.getBoundingClientRect().top

    // Search through every list item and find the appropriate index
    let newIndex = 0
    for (let i = 0, len = list.children.length; i < len; i++) {
      let el = list.children[i]
      let styles = window.getComputedStyle(el)
      let margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom)
      let height = el.offsetHeight + margin
      stop += height
      if (stop > midpoint) {
        break
      } else {
        ++newIndex
      }
    }

    return newIndex
  }

  render() {
    let transform, newIndex, oldIndex, itemHeight = this.state.deletedHeight
    if (this.state.dragItem != null) {
      transform = this.state.dragTransform
      itemHeight = this.state.dragItem.getOuterHeight()
      newIndex = this.state.dragIndex
      oldIndex = this.state.dragItem.props.index
    }

    let i = -1
    let items = React.Children.map(this.props.children, child => {
      let style = child.props.style || {}
      let isAfterDeleted = false
      i += 1

      if (this.state.deletedIndex !== -1 && i >= this.state.deletedIndex) {
        style.transform = `translateY(-${itemHeight}px)`
        isAfterDeleted = true
      }

      if (this.state.dragItem != null) {
        if (i === this.state.dragItem.props.index) {
          style.transform = `translate(${transform[0]}px, ${transform[1]}px)`
        } else {
          if (newIndex < oldIndex) {
            if (i >= newIndex && i < oldIndex) {
              style.transform = `translateY(${itemHeight}px)`
            }
          } else {
            if (i > oldIndex && i <= newIndex) {
              style.transform = `translateY(-${itemHeight}px)`
            }
          }
        }
      }

      return React.cloneElement(child, {
        style: style,
        index: i,
        onDragStart: this._onDragStart.bind(this),
        onDrag: this._onDrag.bind(this),
        onDragEnd: this._onDragEnd.bind(this),
        onDelete: this._onItemDelete.bind(this),
        onTransitionEnd: this._onItemTransitionEnd.bind(this),
      })
    })

    let classes = classSet('ReactList', {
      'ReactList--dragging': this.state.dragItem != null,
      'ReactList--deleting': this.state.deletedIndex !== -1,
    })

    if (this.props.enableDeleteTransitions) {
      return (
        <ReactTransitionGroup
          component='ul'
          className={classes}
          transitionName='ReactList-item-'
        >
          {items}
        </ReactTransitionGroup>
      )
    }

    return (
      <ul className={classes}>
        {items}
      </ul>
    )
  }
}

MutableListView.defaultProps = {
  activeItems: [],
  isDraggable: true,
  enableDeleteTransitions: false,
  onReorder: () => {},
}

function pointerOffset(e, rect) {
  let clientX = e.touches ? e.touches[0].clientX : e.clientX
  let clientY = e.touches ? e.touches[0].clientY : e.clientY
  let x = clientX - rect.left
  let y = clientY - rect.top

  // console.log([clientX, clientY], [rect.left, rect.top])

  return [x, y]
}
