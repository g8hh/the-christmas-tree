function getToyTierBuyable(tier, id) {
	return {
		cost() {
			const base = player.to[`t${tier}Amt`].add(tier);
			if (tier === 5) return base.add(5);
			return base;
		},
		title: `Tier ${tier} Toys`,
		display() {
			return getBuyableText("to", id, tier);
		},
		effect() {
			return getBuyableAmount("to", id)
				.pow(tier + 1)
				.mul(player.to[`t${tier}Amt`]);
		},
		effectDisplay() {
			return `Producing ${format(layers.to.buyables[id].effect())} ${
				tier > 1 ? `Tier ${tier - 1} Toys` : "Manufactured Toys"
			}/s`;
		},
		canAfford() {
			return (
				player["to"].points.gte(this.cost()) &&
				player.to[`t${tier}Amt`].lt(10)
			);
		},
		buy() {
			player["to"].points = player["to"].points.sub(this.cost());
			setBuyableAmount("to", id, getBuyableAmount("to", id).add(1));
			player.to[`t${tier}Amt`] = player.to[`t${tier}Amt`].add(1);
		},
	};
}

function getToyTierProduction(tier, id, diff) {
	let mult = nD(1);
	if (hasUpgrade("to", 11)) mult = mult.mul(1e10);
	if (hasUpgrade("to", 12)) mult = mult.mul(1e5);
	if (hasUpgrade("to", 13)) mult = mult.mul(1e10);

	return getBuyableAmount("to", id)
		.pow(tier + 1)
		.mul(mult)
		.mul(diff);
}

const toyTiers = [
	[1, 11],
	[2, 12],
	[3, 13],
	[4, 21],
	[5, 22],
];

addLayer("to", {
	name: "toys", // This is optional, only used in a few places, If absent it just uses the layer id.
	symbol: "TO", // This appears on the layer's node. Default is the id with the first letter capitalized
	position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
	startData() {
		return {
			unlocked: false,
			points: nD(0),
			manToys: nD(0),
			t1Amt: nD(0),
			t2Amt: nD(0),
			t3Amt: nD(0),
			t4Amt: nD(0),
			t5Amt: nD(0),
		};
	},
	color: "#cccc77",
	requires: nD("1e450"),
	resource: "toys",
	baseResource: "elves",
	baseAmount() {
		return player.e.points;
	},
	type: "static",
	exponent: 2,
	base: 1e10,
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
	milestones: {
		0: {
			requirementDescription: "6 best toy machines",
			effectDescription: "You can buy max toy machines.",
			done() {
				return player.to.best.gte(6);
			},
		},
	},
	canBuyMax() {
		return hasMilestone("to", 0);
	},
	branches: ["m"],
	buyables: {
		rows: 2,
		cols: 3,
		11: getToyTierBuyable(1, 11),
		12: getToyTierBuyable(2, 12),
		13: getToyTierBuyable(3, 13),
		21: getToyTierBuyable(4, 21),
		22: getToyTierBuyable(5, 22),
	},
	layerShown() {
		return hasChallenge("m", 22);
	},
	effect() {
		return softcap(
			softcap(player.to.manToys.pow(2).max(1), nD(1e25), 0.5),
			nD(1e75),
			0.25
		);
	},
	update(diff) {
		player.to.manToys = player.to.manToys.add(
			getToyTierProduction(1, 11, diff)
		);
		toyTiers.forEach((tier, i) => {
			if (i === 0) return;
			const p = toyTiers[i - 1];
			setBuyableAmount(
				"to",
				p[1],
				getBuyableAmount("to", p[1]).add(
					getToyTierProduction(tier[0], tier[1], diff)
				)
			);
		});
	},
	midsection: [
		[
			"display-text",
			() =>
				`You have ${formatWhole(
					player.to.manToys
				)} manufactured toys, giving a x${format(
					layers.to.effect()
				)} multiplier to elf gain<br>
You can manually buy only 10 of each toy tier`,
		],
	],
	upgrades: {
		rows: 1,
		cols: 3,
		11: {
			title: "More Toys",
			description: "Multiply production of all toy tiers by 1e10.",
			cost: nD(6),
			unlocked() {
				return player.to.best.gte(6);
			},
		},
		12: {
			title: "Morer Toys",
			description: "Multiply production of all toy tiers by 1e5.",
			cost: nD("1e318"),
			currencyDisplayName: "trees",
			currencyInternalName: "points",
			currencyLayer: "t",
			unlocked() {
				return hasUpgrade("to", 11);
			},
		},
		13: {
			title: "Morest Toys",
			description: "Multiply production of all toy tiers by 1e10.",
			cost: nD(169),
			currencyDisplayName: "present machines",
			currencyInternalName: "points",
			currencyLayer: "m",
			unlocked() {
				return hasUpgrade("to", 12);
			},
		},
	},
});
