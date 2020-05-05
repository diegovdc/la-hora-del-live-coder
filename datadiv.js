// Init data div
document.querySelector('.heading-buttoms').style.display = 'none'// remove buttone on the lower right
algodiv = document.createElement('div')
algodiv.id = 'algodiv'
document.body.appendChild(algodiv)
additionalStylesAlgoDiv = document.createElement('style')
additionalStylesAlgoDiv.innerText = '.scrollbar-corner{display: none;}'
document.body.appendChild(additionalStylesAlgoDiv)
Object.entries(
  {
     position: 'fixed',
     top: 0,
     height: 'auto',
     background: 'transparent',
     minWidth: '30px',
     width: 'auto',
     right: 0,
     color: 'white',
  }
)
.forEach(([prop, val]) => {algodiv.style[prop] = val})
diego = document.createElement('h1')
diego.id = 'algodiego'
diego.innerHTML = 'degos<br><span style="font-size: 10px">http://echoic.space</span>'
diego.style.textAlign = 'right'
diego.style.marginTop = '0'
diego.style.fontSize = '16px'
diego.style.opacity = '0.5'
algodiv.appendChild(diego)
setAlgoDivData = (data) => {
  Object.entries(data).forEach(([prop, val]) => {
    if(prop === undefined ||!Number.isNaN(Number(prop)) || val === undefined) {return}
    let id = 'algodiv'+prop
    let node = document.getElementById(id)
    if(node === null) {
      node = document.createElement('p')
      node.id = id
      algodiv.appendChild(node)
      Object.entries({
        lineHeight:' 1',
        marginBottom: '5px',
        marginTop: 0
      })
      .forEach(([prop, val_]) => {node.style[prop] = val_})
    }
    node.innerText = prop + ': ' + (Number.isInteger(val) ? val : val.toFixed(3))
  })
}
setAlgoDivData({voiceIndex: 0, eventIndex: 0})
