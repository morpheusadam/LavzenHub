const input = document.getElementById('url')
const dot = document.getElementById('dot')
const msg = document.getElementById('msg')
const openBtn = document.getElementById('open')

function normalize(value) {
  let url = value.trim()
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url
  return url
}

function setStatus(text, state) {
  msg.textContent = text
  msg.style.color = state === 'error' ? '#fb7185' : state === 'saved' ? '#a3e635' : '#a6a8b4'
  dot.classList.toggle('on', state === 'saved' || state === 'configured')
}

// Load any previously saved URL and reflect its state.
chrome.storage.sync.get('hubUrl', ({ hubUrl }) => {
  if (hubUrl) {
    input.value = hubUrl
    openBtn.disabled = false
    setStatus('Connected to ' + new URL(hubUrl).hostname, 'configured')
  } else {
    openBtn.disabled = true
    setStatus('Not configured yet.', 'idle')
  }
})

document.getElementById('save').addEventListener('click', () => {
  const url = normalize(input.value)
  try { new URL(url) } catch (_) { setStatus('Please enter a valid URL.', 'error'); return }
  input.value = url
  chrome.storage.sync.set({ hubUrl: url }, () => {
    openBtn.disabled = false
    setStatus('Saved. Open a new tab to see your hub.', 'saved')
  })
})

// Save on Enter for convenience.
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('save').click()
})

openBtn.addEventListener('click', () => chrome.tabs.create({}))
