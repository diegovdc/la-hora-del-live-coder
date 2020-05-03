Can.init; s.boot;
~osc  = (net: NetAddr("localhost", 57101));
~osc.net.sendMsg(\canosc, 1)

(
	m = FluentCan(osc: ~osc).period(5).len(2);
	b = m.def(\2)
	.period(85)
	.tempos([3, 5, 8,11, 13])
	.durs([7,11,11])
	.transps([20, _+[0, 7],40, _+[\rest, 20], _.pipe(_.reverse, _+20)])
	.len(90)
	.notes([0, 7, 13, 14, 17,50,17,57, 19, 28].pipe(_!4,_.collect({|n, i| n+(i*7)}), _.flatten))
	.amps([0.5])
	.cp([15, 60,56, 89])
	.play;
)
b.pause

(
e = Eikosany(1, 3,5,7,11,13);
~merge = {|a, b| merge(a, b, { |a, b| b ? a })};
~transpf = {|fns, vals, event| fns.wrapAt(event.voiceIndex).(vals.wrapAt(event.eventIndex))};
~tf = ~transpf;
)
(
	b.canon.player.onEvent({|ev|
		(
			freq: e.degreeToFreq(ev.note, 60,1),
			instrument: \sin,
			dur: rrand(1, 20.0),
			amp: 0.05
		).play;
		CanPlayer.makeOSC(~merge.(ev,
			(
				r: ~transpf.([_*1, _*0.3, _*0.2], [0.1, 0.3, 0.5], ev),
				g: ~transpf.([_*2, _*0.3], [0.1, 0.3, 0.5], ev),
				b: ~transpf.([_*1, _*9, 2, 0.4], [0.1, 0.3, 1, 0.2], ev),
				scale: ~tf.([_*0.71, _*0.5, _*3], [1, 1.2, 1.5, 1.6, 2], ev),
				noise: ~tf.([_*1, _*1.2], [0.1, 1.2, 0.5], ev),
				shape: ~tf.([_+0, _+1], [3,5,7], ev),
				repeat: ~tf.([_+0, _+1, _*2], [1, 3,5,7], ev),
				x: ~tf.([_*0.1, _*0.6], (1..7)*0.5, ev),
				xd: ~tf.([_*0.1, _*0.06, _*0.3, _*0.4], (-3..3)*0.1, ev),
				y: ~tf.([_*0.1, _*0.2, _*0.3, _*0.4], (1..7)*0.7, ev),
				yd: ~tf.([_*0.1, _*0.2, _*0.3, _*0.4], (-3..3)*0.7, ev),

			))).();
	})
)
