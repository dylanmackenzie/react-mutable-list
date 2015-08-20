import React from 'react/addons'

const classSet = window.classNames

const maxClickDuration = 200

// A MutableListView represents a single list from which items can be
// added, deleted, and rearranged.
export default class MutableListView extends React.Component {
  constructor(props) {
    super(props)

    // We manage the drag-to-reorder outside of this.state to avoid the
    // overhead of setState on (mouse|touch)move
    this.dragState = {
      item: null,        // reference to props.item that is being dragged
      index: 0,          // previous index of dragged item
      offset: [0, 0],    // offset of cursor inside of dragged item
      transform: [0, 0], // transform currently applied to dragged item
      clickFlag: false,  // flag set to false when a mouse down event has been handled
      moveHandler: null,
      upHandler: null,
    }
  }

  // Determine if we have a click or a drag
  _onMouseDown(item, e) {
    this.clickFlag = true

    e.persist()
    e.preventDefault()
    window.setTimeout(this._onDragStart.bind(this, item, e), maxClickDuration)
  }

  _onMouseUp(item, e) {
    if (!this.clickFlag) {
      return
    }

    this.clickFlag = false
    this.props.onClick(item, e)
  }

  _onDragStart(item, e) {
    if (!this.clickFlag) {
      return
    }

    this.clickFlag = false
    let el = React.findDOMNode(this.refs[item.id])
    let dragState = this.dragState

    dragState.item = item
    dragState.index = this.props.items.indexOf(item)
    dragState.transform = [0, 0]
    dragState.offset = pointerOffset(el, e)
    dragState.moveHandler = this._onDragMove.bind(this, item)
    dragState.upHandler = this._onDragEnd.bind(this, item)

    this.forceUpdate()

    window.addEventListener('mousemove', dragState.moveHandler)
    window.addEventListener('mouseup', dragState.upHandler)
  }

  _onDragMove(item, e) {
    let transform = this.dragState.transform
    let offset = this.dragState.offset
    let dragIndex = this.dragState.index

    let el = React.findDOMNode(this.refs[item.id])
    let delta = pointerOffset(el, e)
    let itemHeight = outerHeight(el)

    transform[0] += delta[0] - offset[0]
    transform[1] += delta[1] - offset[1]

    let oldIndex = this.props.items.indexOf(item)
    let newIndex = this._getNewIndex()

    // Apply transform to the element being dragged
    el.style.transform = `translate(${transform[0]}px, ${transform[1]}px)`

    // If the element is still in the same place we don't need to
    // transform the rest of the list
    if (newIndex === dragIndex) {
      return
    }

    this.props.items.forEach((item, i) => {
      if (item === this.dragState.item) {
        return
      }

      let el = React.findDOMNode(this.refs[item.id])

      if (newIndex < oldIndex) {
        if (i < newIndex) {
          el.style.transform = `translateY(0px)`
        } else if (i < oldIndex) {
          el.style.transform = `translateY(${itemHeight}px)`
        } else {
          el.style.transform = `translateY(0px)`
        }
      } else {
        if (i <= oldIndex) {
          el.style.transform = `translateY(0px)`
        } else if (i <= newIndex) {
          el.style.transform = `translateY(-${itemHeight}px)`
        } else {
          el.style.transform = `translateY(0px)`
        }
      }
    })
  }

  _onDragEnd(item, e) {
    let oldIndex = this.props.items.indexOf(item)
    let newIndex = this._getNewIndex()

    this.props.items.forEach((item, i) => {
      let el = React.findDOMNode(this.refs[item.id])
      el.style.transform = null
    })

    if (oldIndex !== newIndex) {
      this.props.onReorder(oldIndex, newIndex)
    }

    this.dragState.item = null
    this.forceUpdate()

    window.removeEventListener('mousemove', this.dragState.moveHandler)
    window.removeEventListener('mouseup', this.dragState.upHandler)
  }

  _getNewIndex() {
    let offset = this.dragState.offset
    let el = React.findDOMNode(this.refs[this.dragState.item.id])
    let rect = el.getBoundingClientRect()
    let midpoint = rect.top + rect.height / 2

    // Find the top of the list in terms of the client viewport
    let list = React.findDOMNode(this)
    let stop = list.getBoundingClientRect().top

    // Search through every list item an
    // TODO: replace with Array.prototype.findIndex
    let newIndex = this.props.items.filter((item, i) => {
      let el = React.findDOMNode(this.refs[item.id])
      let height = outerHeight(el)
      stop += height
      return (stop > midpoint)
    })[0]

    newIndex = this.props.items.indexOf(newIndex)
    if (newIndex === -1) {
      newIndex = this.props.items.length - 1
    }

    return newIndex
  }

  render() {
    let isDraggable = this.props.isDraggable
    let onClick = this.props.onClick
    let onDelete = this.props.onDelete

    let lis = items.map((item, i) => {

      let style = {}
      let itemProps = {
        key: item.id,
        ref: item.id,
        onMouseDown: e => this._onMouseDown(item, e),
        onMouseUp: e => this._onMouseUp(item, e),
        className: classSet('ReactList-item', {
          'ReactList-item--active': activeItems.indexOf(item.id) > -1,
          'ReactList-item--dragging': this.dragState.item === item
        }),
      }

      return (
        <li {...itemProps}>
          { item.content }
          <button onClick={e => this.props.onDelete(item)} className='ReactList-delete'>x</button>
        </li>
      )
    })

    let classes = classSet('ReactList', {
      'ReactList--dragging': this.dragState.item != null
    })


    return (
      <ul className={classes}>
        {lis}
      </ul>
    )
  }
}

MutableListView.defaultProps = {
  activeItems: [],
  isDraggable: true,
  onClick: function(item) {
    let activeItems = this.activeItems
    let id = item.id
    let idx = activeItems.indexOf(id)
    if (idx === -1) {
      activeItems.push(id)
    } else {
      activeItems.splice(idx, 1)
    }
  },
  onReorder: function(old, neu) {
    let items = this.items
    let item = items[old]
    console.log('reorder', old, neu)
    items.splice(old, 1)
    items.splice(neu, 0, item)
  },
  onDelete: () => {}
}

function outerHeight(el) {
  let styles = window.getComputedStyle(el)
  let margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])

  return el.offsetHeight + margin
}

function pointerOffset(el, e) {
  let rect = el.getBoundingClientRect()
  let clientX = e.touches ? e.touches[0].clientX : e.clientX
  let clientY = e.touches ? e.touches[0].clientY : e.clientY
  let x = clientX - rect.left
  let y = clientY - rect.top

  // console.log([clientX, clientY], [rect.left, rect.top])

  return [x, y]
}
