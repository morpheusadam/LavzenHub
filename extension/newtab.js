chrome.storage.sync.get('hubUrl', ({ hubUrl }) => {
  const root = document.getElementById('root')

  if (!hubUrl) {
    root.innerHTML =
      '<div class="setup"><div class="card">' +
      '<img class="logo" src="icons/icon128.png" alt="Lavzen Hub">' +
      '<h2>Welcome to Lavzen Hub</h2>' +
      '<p>Point the extension at your self-hosted hub and every new tab will ' +
      'open it, embedded full screen.</p>' +
      '<a class="btn" href="options.html" target="_blank" rel="noopener">Set your hub URL</a>' +
      '</div></div>'
    return
  }

  // Loading veil stays up until the hub finishes loading (or after a timeout).
  const veil = document.createElement('div')
  veil.className = 'veil'
  veil.innerHTML = '<div class="spinner"></div>'
  root.appendChild(veil)

  const frame = document.createElement('iframe')
  frame.src = hubUrl
  frame.allow = 'fullscreen; clipboard-read; clipboard-write'
  const hideVeil = () => veil.classList.add('hidden')
  frame.addEventListener('load', hideVeil)
  root.appendChild(frame)

  // Safety net: never leave the veil up forever if the load event is missed.
  setTimeout(hideVeil, 6000)
})
