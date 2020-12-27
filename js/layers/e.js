//    ______
//   | ____|
//  | ____|
// |_____|

addLayer("e", {
	name: "elves", // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() {
		return {
			unlocked: true,
			points: nD(0),
		};
	},
	color: "#77cc77",
	requires: nD(10), // Can be a function that takes requirement increases into account
	resource: "elves", // Name of prestige currency
	baseResource: "presents", // Name of resource prestige is based on
	baseAmount() {
		return player.points;
	}, // Get the current amount of baseResource
	type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent: 0.5, // Prestige currency exponent
	gainMult() {
		// Calculate the multiplier for main currency from bonuses
		let mult = nD(1);

		if (hasUpgrade("e", 13)) mult = mult.mul(2);
		if (!inChallenge("m", 22)) {
			if (hasUpgrade("m", 12)) mult = mult.mul(upgradeEffect("m", 12));
			if (hasUpgrade("t", 22)) mult = mult.mul(10);
			if (hasUpgrade("t", 23)) mult = mult.mul(upgradeEffect("t", 23));
			mult = mult.mul(layers.m.effect());
			mult = mult.mul(layers.to.effect());
		}

		return mult;
	},
	gainExp() {
		if (inChallenge("m", 12)) return nD(0.5);
		if (inChallenge("m", 21)) return nD(0.001);

		return nD(1);
	},
	row: 0, // Row the layer is in on the tree (0 is the first row)
	displayRow: 3,
	hotkeys: [
		{
			key: "e",
			description: "E: Reset for elves",
			onPress() {
				if (canReset(this.layer)) doReset(this.layer);
			},
		},
	],
	layerShown() {
		return true;
	},
	upgrades: {
		rows: 3,
		cols: 3,
		11: {
			description: "Start generating presents.",
			cost: nD(1),
		},
		12: {
			description: "Multiply present gain based on elves.",
			cost: nD(1),
			unlocked() {
				return hasUpgrade("e", 11);
			},
			effect() {
				return player.e.points.sqrt().max(1.33);
			},
			effectDisplay(x) {
				return `x${format(upgradeEffect("e", 12))}`;
			},
		},
		13: {
			description: "Multiply elf gain by 2.",
			cost: nD(3),
			unlocked() {
				return hasUpgrade("e", 12);
			},
		},
		21: {
			description: "Unlock the first elf buyable.",
			cost: nD(5),
			unlocked() {
				return hasUpgrade("e", 13);
			},
		},
		22: {
			description: "Square root the cost of the first elf buyable.",
			cost: nD(25),
			unlocked() {
				return getBuyableAmount("e", 11).gte(2);
			},
		},
		23: {
			description: "Make the first elf buyable effect more powerful.",
			cost: nD(100),
			unlocked() {
				return hasUpgrade("e", 22);
			},
		},
	},
	buyables: {
		rows: 1,
		cols: 2,
		11: {
			title: "Boosted Morale",
			cost() {
				const out = nD(5)
					.pow(getBuyableAmount(this.layer, this.id).add(1))
					.pow(hasUpgrade("e", 22) ? 0.5 : 1);
				let softcapped = softcap(out, nD(500), 1.5);
				softcapped = softcap(softcapped, nD(1e50), 2);
				softcapped = softcap(softcapped, nD("1e1000"), 3);
				return softcapped;
			},
			display() {
				return getBuyableText(this.layer, this.id);
			},
			description: "Multiply present gain.",
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				if (!hasMilestone("m", 1))
					player[this.layer].points = player[this.layer].points.sub(
						this.cost()
					);
				setBuyableAmount(
					this.layer,
					this.id,
					getBuyableAmount(this.layer, this.id).add(1)
				);
			},
			effect() {
				// TODO i'm gonna have to softcap this i think
				if (hasUpgrade("e", 23))
					return nD(2).pow(
						getBuyableAmount(this.layer, this.id).add(1)
					);
				return getBuyableAmount(this.layer, this.id)
					.add(1)
					.pow(2)
					.max(1);
			},
			effectDisplay() {
				return `x${format(buyableEffect("e", 11))}`;
			},
			unlocked() {
				return hasUpgrade("e", 21);
			},
		},
		12: {
			title: "Recruitment Campaign",
			cost() {
				const cost = nD(8).pow(
					getBuyableAmount(this.layer, this.id).add(2)
				);
				let softcapped = softcap(cost, nD("1e1000"), 3);
				return softcapped;
			},
			display() {
				return getBuyableText(this.layer, this.id);
			},
			description: "Multiply elf gain.",
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
				if (!hasMilestone("m", 1))
					player[this.layer].points = player[this.layer].points.sub(
						this.cost()
					);
				setBuyableAmount(
					this.layer,
					this.id,
					getBuyableAmount(this.layer, this.id).add(1)
				);
			},
			effect() {
				return getBuyableAmount("e", 12).add(1).pow(2).max(1);
			},
			effectDisplay() {
				return `x${format(buyableEffect("e", 12))}`;
			},
			unlocked() {
				return hasUpgrade("m", 11) && !inChallenge("m", 22);
			},
		},
	},
	doReset(layer) {
		const keep = [];
		if (
			layers[layer].row === 1 &&
			hasMilestone("m", 0) &&
			!inChallenge("m", 22)
		)
			keep.push("upgrades");
		if (layer === "e") return;
		if (
			layers[layer].row === 1 &&
			hasMilestone("m", 4) &&
			!player.m.activeChallenge
		)
			keep.push("buyables");
		layerDataReset("e", keep);
	},
	passiveGeneration() {
		if (hasMilestone("m", 2) && !inChallenge("m", 22)) return nD(1);
		return nD(0);
	},
	automation() {
		if (hasMilestone("m", 3)) {
			buyBuyable("e", 11);
			buyBuyable("e", 12);
		}
	},
});
