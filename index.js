R = require('/home/diego/.nvm/versions/node/v10.16.3/lib/node_modules/ramda')

v = {}
totalVoices = 0

msg.on('/canosc', (msg_) => {
  var msg__ = R.fromPairs(R.splitEvery(2, msg_))
  v["v"+msg__.voiceIndex] = msg__
  //console.log("msg", msg__.scale)
  //console.log("v", v)
  totalVoices = msg__.canonSize
  if(msg__.canonSize !== totalVoices) {
    // console.log('will compile')
    //main()
  }
})

layer = R.invoker(1, 'diff')
makeLayer = (key) =>
solid(() => v[key].r, () => v[key].g, () => v[key].b)
.mask(
  shape(() =>v[key].shape ||  3).scale(() => v[key].scale || 1)
  .modulate(noise(() => v[key].noise || 0))
  // .repeat(() => v[key].repeat || 0)
)
.modulate(osc(() => v[key].r*20, () => v[key].g*3, () => v[key].b* 20))
.scale(() => Math.sin(time*v[key].r*0.5 + v[key].g)* 4 )
.scrollX(() => v[key].x || 0, () => v[key].xd || 0)
.scrollY(() => v[key].y || 0, () => v[key].yd || 0)
.saturate(0.7)
// .color(0,2.4,5)
.color(() => v[key].r*0.20, () => v[key].g*0.3, () => v[key].b* 1)
main = () => R.reduce((acc, voice) =>
layer(makeLayer(voice), acc), solid(0,0,0), Object.keys(v))
main()
// .scale(0.7, ()=> 0.7 + a.fft[3])
.luma(2,1000, (6, ()=> 1 + a.fft[3]))
.add(src(o0).scrollX(0.5), 0.4)
.diff(o0)// o0
.out()

s0.initScreen()

src(o0).out()

osc(15, 0.01, 0.1).mult(osc(1, -0.1).modulate(osc(2).rotate(4,1), 20))
    .out(o0)// o1
