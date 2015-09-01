import React from 'react/addons'
import classSet from 'classnames'
import autobind from 'autobind-decorator'

const ReactTransitionGroup = React.addons.TransitionGroup
const BEMSeparator = '--'

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

  @autobind
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
      const styles = window.getComputedStyle(el)
      const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom)
      const height = el.offsetHeight + margin
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
    const downTransformString = `translateY(${itemHeight}px)`
    const dragTransformString = (newIndex < oldIndex)
      ? downTransformString
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
        onDragStart: this._onDragStart,
        onDrag: this._onDrag,
        onDragEnd: this._onDragEnd,
        onDelete: this._onItemDelete,
        onTransitionEnd: this._onItemTransitionEnd,
      })
    })

    let baseClass = 'ReactList'
    if (this.props.className) {
      baseClass = this.props.className.split(' ')
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
          transitionName={`${baseClass}-item-`}
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
}

MutableListView.propTypes = {
  enableDeleteTransitions: React.PropTypes.bool,
  onReorder: React.PropTypes.func,
}

function pointerOffset(e, rect) {
  const clientX = e.targetTouches ? e.targetTouches[0].clientX : e.clientX
  const clientY = e.targetTouches ? e.targetTouches[0].clientY : e.clientY
  const x = clientX - rect.left
  const y = clientY - rect.top

  // console.log([clientX, clientY], [rect.left, rect.top])

  return [x, y]
}
