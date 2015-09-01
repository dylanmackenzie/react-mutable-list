export function pointerOffset(e, rect) {
  const clientX = e.targetTouches ? e.targetTouches[0].clientX : e.clientX
  const clientY = e.targetTouches ? e.targetTouches[0].clientY : e.clientY
  const x = clientX - rect.left
  const y = clientY - rect.top

  // console.log([clientX, clientY], [rect.left, rect.top])

  return [x, y]
}

export function outerHeight(el) {
  const styles = window.getComputedStyle(el)
  const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom)

  return el.offsetHeight + margin
}
