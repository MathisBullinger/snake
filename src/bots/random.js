export default function() {
  const dir = ['Up', 'Down', 'Left', 'Right'][Math.random() * 4 | 0]
  const event = new KeyboardEvent('keydown', { key: `Arrow${dir}` }) 
  window.dispatchEvent(event)
}
