R = require("/home/diego/.nvm/versions/node/v10.16.3/lib/node_modules/ramda"); // <3

v = {};
totalVoices = 0;

msg.on("/canosc", (msg_) => {
  var msg__ = R.fromPairs(R.splitEvery(2, msg_));
  v["v" + msg__.voiceIndex] = msg__;
  // console.log("msg", msg__.r);
  // console.log("v", v);
  setAlgoDivData(msg__);
});

msg.on("/compile", ([voiceCount]) => {
  var v1 = R.pipe( // update voiceCount
    parseInt,
    R.range(0),
    R.map(n => 'v'+n),
    R.pick(R.__, v)
 )(voiceCount)
  main(v1)
  v = v1
});


layer = R.invoker(1, "diff");
makeLayer = (voice) =>
  solid(() => v[voice].r || 0,() => v[voice].g || 0,() => v[voice].b || 0)
    .mask(
      shape(() => v[voice].shape || 3).scale(() => v[voice].scale || 1)
      // .modulate(noise(() => v[voice].noise || 0))
      // .repeat(() => v[voice].repeat || 0)
    )
    // .modulate(osc(() => v[voice].r*20, () => v[voice].g*3, () => v[voice].b* 20))
    // .scale(() => Math.sin(v[voice].r * 5 + v[voice].g) * v[key].scale)
    .scrollX(() => v[voice].x || 0,() => v[voice].xd || 0)
    .scrollY(() => v[voice].y || 0,() => v[voice].yd || 0)
    .saturate(0.7)
    // .color(0,2.4,5)
    // .color(() => v[voice].r * 0.2,() => v[voice].g * 0.3,() => v[voice].b * 1);
main = (v) =>
  R.reduce(
    (acc, voice) => layer(makeLayer(voice), acc),
    solid(0, 0, 0),
    Object.keys(v)
  )
  // .scale(0.7, ()=> 0.7 + a.fft[3])
  // .luma(2,1000, (6, ()=> 1 + a.fft[3]))
  // .add(src(o0).scrollX(0.5), 0.4)
  // .diff(o0)// o0
  .out();
main(v);

s0.initScreen();

src(o0).out();
