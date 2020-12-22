function getBuyableText(layer, id) {
	return `
${readData(layers[layer].buyables[id].description)}
<b><h2>Amount:</h2></b> ${getBuyableAmount(layer, id)}
<b><h2>Effect:</h2></b> ${readData(layers[layer].buyables[id].effectDisplay)}
<b><h2>Cost:</h2></b> ${formatWhole(layers[layer].buyables[id].cost())} ${
		tmp[layer].resource
	}`;
}

const nD = n => new Decimal(n);

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
		if (hasUpgrade("m", 12)) mult = mult.mul(upgradeEffect("m", 12));
		if (hasUpgrade("t", 22)) mult = mult.mul(10);
		if (hasUpgrade("t", 23)) mult = mult.mul(upgradeEffect("t", 23));
		mult = mult.mul(layers.m.effect());

		return mult;
	},
	gainExp() {
		// Calculate the exponent on main currency from bonuses
		return nD(inChallenge("m", 12) ? 0.5 : 1);
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
				return nD(8).pow(getBuyableAmount(this.layer, this.id).add(2));
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
				return hasUpgrade("m", 11);
			},
		},
	},
	doReset(layer) {
		const keep = [];
		if (layers[layer].row === 1 && hasMilestone("m", 0))
			keep.push("upgrades");
		if (layer === "e") return;
		debugger;
		if (layers[layer].row === 1 && hasMilestone("m", 4))
			keep.push("buyables");
		layerDataReset("e", keep);
	},
	passiveGeneration() {
		if (hasMilestone("m", 2)) return nD(1);
		return nD(0);
	},
	automation() {
		if (hasMilestone("m", 3)) {
			buyBuyable("e", 11);
			buyBuyable("e", 12);
		}
	},
});

//    __________
//   |  _   _  |
//  | | | | | |
// |_| |_| |_|

addLayer("m", {
	name: "present machines",
	symbol: "M",
	position: 1,
	resource: "present machines",
	startData: () => ({
		unlocked: false,
		points: nD(0),
	}),
	row: 1,
	displayRow: 2,
	layerShown() {
		return hasUpgrade("e", 23) || player.m.unlocked;
	},
	type: "static",
	color: "#cc7733",
	branches: ["e"],
	requires: nD(100),
	exponent: 1.5,
	baseResource: "elves",
	baseAmount() {
		return player.e.points;
	},
	hotkeys: [
		{
			key: "m",
			description: "M: Reset for present machines",
			onPress() {
				if (canReset(this.layer)) doReset(this.layer);
			},
		},
	],
	base: 4,
	effect() {
		return nD(2).pow(player.m.points).max(1);
	},
	roundUpCost: true,
	effectDescription() {
		return `multiplying elf gain by ${format(this.effect())}`;
	},
	milestones: {
		0: {
			requirementDescription: "3 best present machines",
			effectDescription: "Keep elf upgrades on row 2 resets.",
			done() {
				return player.m.best.gte(3);
			},
		},
		1: {
			requirementDescription: "4 best present machines",
			effectDescription: "Elf buyables cost nothing.",
			done() {
				return player.m.best.gte(4);
			},
		},
		2: {
			requirementDescription: "6 best present machines",
			effectDescription: "Gain 100% of elf gain every second.",
			done() {
				return player.m.best.gte(6);
			},
		},
		3: {
			requirementDescription: "7 best present machines",
			effectDescription:
				"Automatically buy one of each elf buyable per tick.",
			done() {
				return player.m.best.gte(7);
			},
		},
		4: {
			requirementDescription: "14 best present machines",
			effectDescription: "Keep elf buyables on row 2 resets.",
			done() {
				return player.m.best.gte(14);
			},
		},
	},
	upgrades: {
		rows: 2,
		cols: 2,
		11: {
			description: "Unlock the second elf buyable.",
			cost: nD(3),
			unlocked() {
				return player.m.best.gte(3);
			},
		},
		12: {
			description: "Multiply elf gain based on your presents.",
			cost: nD(4),
			unlocked() {
				return player.m.best.gte(4);
			},
			effect() {
				return player.points.max(1).log(3).max(1);
			},
			effectDisplay() {
				return `x${format(this.effect())}`;
			},
		},
		21: {
			description: "Multiply present gain based on presents.",
			cost: nD(6),
			unlocked() {
				return hasUpgrade("m", 12);
			},
			effect() {
				return player.points.max(1).log10().add(1);
			},
			effectDisplay() {
				return `x${format(this.effect())}`;
			},
		},
	},
	challenges: {
		rows: 1,
		cols: 2,
		11: {
			name: "rona",
			challengeDescription:
				"Everybody is at home, so present gain is square rooted.",
			rewardDescription: "Raise present gain to the power of 1.5.",
			goal: nD(1e7),
			currencyInternalName: "points",
			unlocked() {
				return hasUpgrade("t", 13);
			},
		},
		12: {
			name: "COVID-19",
			challengeDescription:
				"Everybody is dying, so elf gain is square rooted.",
			rewardDescription: "Unlock another Present Machine upgrade.",
			goal: nD(1e1000),
			currencyInternalName: "points",
			unlocked() {
				return hasChallenge("m", 11);
			},
		},
	},
});

//  _______
// |__  __|
//   | |
//  | |
// |_|

addLayer("t", {
	name: "trees",
	symbol: "T",
	position: 0,
	resource: "trees",
	startData: () => ({
		unlocked: false,
		points: nD(0),
	}),
	row: 1,
	displayRow: 2,
	layerShown() {
		return player.m.best.gte(7);
	},
	type: "normal",
	requires: nD(1e16),
	exponent: 0.25,
	baseAmount() {
		return player.points;
	},
	color: "#ff4444",
	baseResource: "points",
	branches: ["m"],
	upgrades: {
		rows: 3,
		cols: 3,
		12: {
			description: "Multiply present gain by 10.",
			cost: nD(10),
			unlocked() {
				return hasUpgrade("t", 22);
			},
		},
		13: {
			description: "Unlock machine challenges.",
			cost: nD(100),
			unlocked() {
				return hasUpgrade("t", 12);
			},
		},
		22: {
			description: "Multiply elf gain by 10.",
			cost: nD(1),
			unlocked() {
				return player.t.unlocked;
			},
		},
		23: {
			description: "Multiply elf gain based on trees.",
			cost: nD(1e20),
			unlocked() {
				return hasChallenge("m", 11);
			},
			effect() {
				return player.t.points.max(1).log10().max(1);
			},
			effectDisplay() {
				return `x${format(this.effect())}`;
			},
		},
	},
});
