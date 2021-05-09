Can.init; s.boot;
(
~osc  = (net: NetAddr("localhost", 57101));
m = FluentCan(osc: ~osc);
~compileHydra = {|c| Task({1.wait; ~osc.net.sendMsg(\compile, c.canon.canon.size);}).play};
~merge = {|a, b| merge(a, b, { |a, b| b ? a })};
~transpf = {|fns, vals, event| fns.wrapAt(event.voiceIndex).(vals.wrapAt(event.eventIndex))};
~tf = ~transpf;
)

(
	c = m.def(\1)
	.period(5)
	.tempos([1])
	.durs([3])
	.transps([0])
	.len(10)
	.notes([-20])
	.amps([0.9])
	.cp([8])
	.play;
	~compileHydra.(c);
)

c.canon.player.resetPlayer.play
c.canon.player.stop

(
e = Eikosany(1,3,5,7,11,13);
)

(
c.canon.player.onEvent({|ev|
	(
		freq: e.degreeToFreq(ev.note, 60,1),
		instrument: \sin,
		dur: ev.dur*[1, rrand(2, 20.0)].wchoose([5, 4].normalizeSum),
		amp: ev.amp
	).play;
	CanPlayer.makeOSC(~merge.(ev,
		(
			r: ~transpf.([_*1], [2], ev),
			g: ~transpf.([_*1], [0], ev),
			b: ~transpf.([_*0.2], [1], ev),
			scale: ~tf.([_*1], [1], ev),
			noise: ~tf.([_*0], [0], ev),
			shape: ~tf.([_*1], [2], ev),
			repeat: ~tf.([_+0], [1], ev),
			x: ~tf.([_*0], [0], ev),
			xd: ~tf.([_*0], [0], ev),
			y: ~tf.([_*0], [0], ev),
			yd: ~tf.([_*0], [0], ev),

		)
	)).();
})
)
