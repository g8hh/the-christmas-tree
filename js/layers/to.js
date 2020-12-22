addLayer("to", {
	name: "toys", // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: "TO", // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() {
		return {
			unlocked: false,
			points: nD(0),
		};
	},
	color: "#cccc77",
	requires: nD(Infinity),
	resource: "toys",
	baseResource: "elves",
	baseAmount() {
		return player.e.points;
	},
	type: "static",
	exponent: 2,
	gainMult() {
		let mult = nD(1);

		return mult;
	},
	gainExp() {
		return nD(1);
	},
	row: 1, // Row the layer is in on the tree (0 is the first row)
	displayRow: 2,
	hotkeys: [
		{
			key: "T",
			description: "Shift+T: Reset for toys",
			onPress() {
				if (canReset(this.layer)) doReset(this.layer);
			},
		},
	],
	branches: ["m"],
	layerShown() {
		return hasChallenge("m", 22);
	},
});
