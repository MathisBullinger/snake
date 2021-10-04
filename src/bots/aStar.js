export default function(snake, food, size, canvas, ctx) {
  const block = snake.map(([x,y]) => y * size + x)
  const h = i => block.includes(i) ? Infinity : 1
  const path = aStar(graphify(...snake[0], size), food[1] * size + food[0], h)
  drawPath(canvas, ctx, size, path) 
  const head = snake[0]
  
  if (path.length < 2) {
    if (head[0] === 0 || head[0] === size - 1) go(head[1] > size / 2 ? 'Down' : 'Up')
    else if (head[1] === 0 || head[1] === size - 1) go(head[0] > size / 2 ? 'Left' : 'Right')
    return
  }

  const next = path[path.length - 2]
  go(next[0] < head[0]
    ? 'Left'
    : next[0] > head[0]
    ? 'Right'
    : next[1] < head[1]
    ? 'Up'
    : 'Down'
  )
}

function go(dir) {
  const event = new KeyboardEvent('keydown', { key: `Arrow${dir}` }) 
  window.dispatchEvent(event)
}

function drawPath(canvas, ctx, cc, path) {
  const cs = Math.min(canvas.width, canvas.height) / cc
  const x0 = (canvas.width - cs * cc) / 2 
  const y0 = (canvas.height - cs * cc) / 2 
  ctx.strokeStyle = '#0f04'
  ctx.beginPath()
  ctx.moveTo(x0 + path[0][0] * cs + cs / 2, y0 + path[0][1] * cs + cs / 2)
  for (const [x, y] of path.slice(1)) ctx.lineTo(x0 + x * cs + cs / 2, y0 + y * cs + cs / 2)
  ctx.stroke()
}

function aStar(start, goal, h) {
  const openSet = [start.i]

  const gScore = new Map()
  gScore.set(start.i, 0)

  const fScore = new Map()
  fScore.set(start.i, h(start.i))

  const cameFrom = new Map()

  while (openSet.length) {
    const current = nodeFromI(openSet[0], start.size)
    if (current.i === goal) return reconstruct(cameFrom, current)

    openSet.shift()
    for (const node of current.neighbours()) {
      const tent = gScore.get(current.i) + 1 
      if (tent < (gScore.get(node.i) ?? Infinity)) {
        cameFrom.set(node.i, current.i)
        gScore.set(node.i, tent)
        fScore.set(node.i, gScore.get(node.i) + h(node.i)) 
        if (!openSet.includes(node.i)) {
          const i = openSet.findIndex(id => fScore.get(id) >= fScore.get(node.i))  
          if (i >= 0) openSet.splice(i, 0, node.i) 
          else openSet.push(node.i)
        }
      }
    }
  }

  throw Error('no path found')
}

function reconstruct(cameFrom, current) {
  const size = current.size
  current = current.i
  const path = [current]
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)
    path.push(current)
  }
  return path.map(i => coords(i, size))
}

function graphify(x, y, size) {
  return {
    i: y * size + x,
    size,
    neighbours() {
      let nodes = []
      if (x > 0) nodes.push(graphify(x - 1, y, size))
      if (y > 0) nodes.push(graphify(x, y - 1, size))
      if (x < size - 1) nodes.push(graphify(x + 1, y, size))
      if (y < size - 1) nodes.push(graphify(x, y + 1, size))
      return nodes
    }
  }
}

function nodeFromI(i, size) {
  return graphify(...coords(i, size), size)
}

function coords(i, size) {
  return [i % size, Math.floor(i / size)]
}

