import * as bot from './bots/aStar'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

const cells = 75
const cellSize = Math.min(canvas.width, canvas.height) / cells

const x0 = (canvas.width - cells * cellSize) / 2
const y0 = (canvas.height - cells * cellSize) / 2

const is = ([ax, ay], [bx, by]) => ax === bx && ay === by

const c = Math.floor(cells / 2)
const snake = [[c, c], [c - 1, c]]
let food = foodPos()
let dir = 0
let nextDir = dir

window.addEventListener('keydown', ({ key }) => {
  if (!key.startsWith('Arrow')) return 
  const next = ['Right', 'Down', 'Left', 'Up'].findIndex(v => key.endsWith(v))
  if (next % 2 === dir % 2) return
  nextDir = next
})

function foodPos() {
  const pos = Array(2).fill().map(() => Math.floor(Math.random() * cells)) 
  for (const v of snake) if (is(v, pos)) return foodPos()
  return pos
}

function render() {
  ctx.fillStyle = '#111'
  ctx.fillRect(x0, y0, cells * cellSize, cells * cellSize)
  
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = '#' + (15 - Math.min(i, 10)).toString(16).repeat(3)
    renderCell(...snake[i])
  }

  ctx.fillStyle = '#f00'
  renderCell(...food)
  bot.render(canvas, ctx, cells)
}

function renderCell(x, y) {
  ctx.fillRect(Math.floor(x * cellSize + x0), Math.floor(y * cellSize + y0), Math.ceil(cellSize), Math.ceil(cellSize))
}

let run = true

function update() {
  if (is(snake[0], food)) {
    snake.push(snake[snake.length - 1])
    food = foodPos()
  }

  for (let i = snake.length - 1; i > 0; i--) snake[i] = snake[i-1]

  bot.step(snake, food, cells, canvas, ctx)

  dir = nextDir
  if (dir === 0) snake[0] = [snake[0][0] + 1, snake[0][1]]
  if (dir === 1) snake[0] = [snake[0][0], snake[0][1] + 1]
  if (dir === 2) snake[0] = [snake[0][0] - 1, snake[0][1]]
  if (dir === 3) snake[0] = [snake[0][0], snake[0][1] - 1]

  for (let i = 1; i < snake.length; i++) if (is(snake[0], snake[i])) run = false
  if (snake[0][0] < 0 || snake[0][1] < 0 || snake[0][0] >= cells || snake[0][1] >= cells) run = false 
}

function step() {
  update()
  if (!run) return
  render()
  requestAnimationFrame(step)
} 

render()
setTimeout(step, 1000)
