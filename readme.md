# La Hora del Live Coder

This is the repository with the code for the performance. And an tutorial for the techniques being used to dynamically create and compile `hydra` (https://hydra.ojack.xyz/) code.

<iframe width="560" height="315" src="https://www.youtube.com/embed/S-Y4cWhUE5I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Personally, the most interesting thing about performance is in the communication between supercollider and hydra, since it is possible to control and even compile the hydra code from supercollider.

The second most interesting thing is that using [FluentCan](https://github.com/nanc-in-a-can/fluent-can) in conjunction with Hydra (in this case) one can create graphical temporal canons, which is something I have not yet seen anywhere else.

## How to compile hydra code from supercollider

Please note that although this techinique is used for compiling visual canons in hydra, it can be adapted to any situation where the control of what and how gets compiled by hydra should be defined by an external program.

**En Hydra**:

The most basic (althought) trivial implementation looks like this (see below for a non trivial implementation)

```js
// `main` is a function that gets compiled every time there is a `compile` osc event
main = (oscPayload) => shape(oscPayload[0]).out();

// each time a /compile message is sent, then the main function is compiled...
msg.on("/compile", (oscPayload) => {
  main(oscPayload);
});
```

This implementation is trivial because we don't need to recompile hydra to pass a new value to the `shape` function. We could simply do this and save a lot of CPU cycles:

```js
shape(() => numberOfSides).out();

msg.on("/changeSides", (oscPayload) => {
  numberOfSides = oscPayload[0];
});
```

In the performance, however, `FluentCan` would produce canons with a different number of voices each time, so I wanted to automatically change in `hydra` the number of `shapes` that were produce to match the number of voices of the canon.

So I did the following.

First a layering function was need. If we want three layers (or voices) at a given time, then we want the layer function to be able to do something like this (but dynamically):

```js
shape().diff(shape()).diff(shape());
```

```js
layer = R.invoker(1, "diff"); // using the JS library Ramda
```

`layer` could also be written like this:

```js
layer = (newLayer, accumulatedLayers) => accumulatedLayers.diff(newLayer);
```

This next function (`makeLayer`) is in charge of creating each layer (i.e. each `shape()`). It receives the data from a single voice (actually just the key) to create each of the shapes individually.
The `voices` object holds all the the different voices data (see below).

```js
makeLayer = (voice) =>
  solid(
    () => voices[voice].r || 0,
    () => voices[voice].g || 0,
    () => voices[voice].b || 0
  ).mask(shape(() => voices[voice].shape || 3));
```

Next we define the `main` function which gets recompiled via osc.

Here `reduce` is used to iterate by the number of voices and accumulate a signal.

So if there are 2 voices one would get something like:

```js
shape().diff(shape());
```

And with 3 voices something like:

```js
shape().diff(shape()).diff(shape());
```

And so on... All generated automatically.

One would just need to substitute `shape` by whatever the output of makeLayer is.

```js
main = (voices) =>
  R.reduce(
    (acc, voice) => layer(makeLayer(voice), acc),
    solid(0, 0, 0),
    Object.keys(voices)
  ).out();
```

The content of the `voices` object is defined separately, so that when a voice's parameter is updated (on every sound event), the object changes but the hydra code need not be recompiled.

This object looks like this:

```js
{
  v1: {
    voiceIndex: 1,
    r: 0.5,
    g: 1,
    b: 0,
    // more params
  },
  v2: {
    voiceIndex: 2,
    r: 0,
    g: 0.1,
    b: 0.7
    // more params
  },
  // more voices
}
```

To update the voices object we use a message called `/canosc`.

```js
msg.on("/canosc", (msg_) => {
  // don't mind this next line too much, it just parses the osc message into an object like: {voiceIndex: 1, r: 0.5, g: 1, b: 0, ...otherParams}
  var msg__ = R.fromPairs(R.splitEvery(2, msg_));

  // the parsed voice is assigned to the voices object which the looks like this:
  // {v1: {r:0.5, ...otherParams}, v2: {...params}, ...}
  voices["v" + msg__.voiceIndex] = msg__;
});
```

Resources in the actual code: https://github.com/diegovdc/la-hora-del-live-coder/blob/master/index.js#L14-L23 y https://github.com/diegovdc/la-hora-del-live-coder/blob/master/index.js#L41-L51

For compiling `hydra` the `supercollider` simply looks like this:

```supercollider
~osc  = (net: NetAddr("localhost", 57101));
~compileHydra = {|c| Task({1.wait; ~osc.net.sendMsg(\compile, c.canon.canon.size);}).play}; // the Task is used for delaying compilation for some reason I can not remember
```

## Sending canonic data to hydra

The `SuperCollider` or rather, the `FluentCan` code for sending each voices data looks like this:

First we define some helper functions:

```supercollider
// Merge two Event objects.
~merge = {|a, b| merge(a, b, { |a, b| b ? a })};

// Calculate the tranposition for the visual parameters corresponding to each voice
~transpf = {|fns, vals, event| fns.wrapAt(event.voiceIndex).(vals.wrapAt(event.eventIndex))};
```

Creating a FluentCan model with the osc connection

```supercollider
~osc  = (net: NetAddr("localhost", 57101));
m = FluentCan(osc: ~osc);
~compileHydra = {|c| Task({1.wait; ~osc.net.sendMsg(\compile, c.canon.canon.size);}).play};

```

Creating a canon:

```supercollider
(
	c = m.def(\1)
	.notes([60, 62,63]]) // do, re, mi
  .period(3) // the notes sequences lasts 3 seconds before repeating

  // these next two lines define the voices ratios and transpositions
  .tempos([1, 2]) // the second voice is twice as fast as the other
	.transps([0, 7]) // the second voice is transposed a fifth above
	.play;

  ~compileHydra.(c); // ~compileHydra receives the canon so that it can calculate the number of voices of the canon before sending the osc message
)
```

Calculating the visual data and sending it on every sound event.
For the osc message we send an `Event` object which is the most similar data structure to a JavaScript `Object`.
To do that merge the original data of the `Event` with the visual/hydra related data produced below

```supercollider
(
c.canon.player.onEvent({|ev|
  // do something else, like producing sound...

  // To send osc dat we call.
	CanPlayer.makeOSC(
    ~merge.(ev,
		(
			r: ~transpf.([_*1], [2], ev),
			g: ~transpf.([_*1], [0], ev),
			b: ~transpf.([_*0.2], [1], ev),
			scale: ~transpf.([_*1], [1], ev),
			noise: ~transpf.([_*0], [0], ev),
			shape: ~transpf.([_*1], [2], ev),
			repeat: ~transpf.([_+0], [1], ev),
			x: ~transpf.([_*0], [0], ev),
			xd: ~transpf.([_*0], [0], ev),
			y: ~transpf.([_*0], [0], ev),
			yd: ~transpf.([_*0], [0], ev),

		)
	)).(); // Note here the function call. `CanPlayer.makeOSC` returns a function which upon being called sends the osc message.
})
)
```
