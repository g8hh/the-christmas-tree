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
		leaves: nD(0),
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
	gainMult() {
		let mult = nD(1);

		if (hasUpgrade("t", 33)) mult = mult.mul(this.effect());
		if (hasUpgrade("t", 21)) mult = mult.mul(1e10);

		return mult;
	},
	color: "#ff4444",
	baseResource: "points",
	branches: ["m"],
	upgrades: {
		rows: 3,
		cols: 3,
		11: {
			description: "Unlock another Present Machine challenge.",
			cost: nD(5e46),
			unlocked() {
				return hasUpgrade("t", 21);
			},
		},
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
		21: {
			description: "I give up. Multiply tree gain by 1e10.",
			cost: nD(1e36),
			unlocked() {
				return hasUpgrade("t", 31);
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
				return player.t.points.max(1).log10().max(1).pow(2);
			},
			effectDisplay() {
				return `x${format(this.effect())}`;
			},
		},
		31: {
			description: "This is boring. Give leaves another effect!",
			cost: nD(1e35),
			unlocked() {
				return hasUpgrade("t", 32);
			},
			effect() {
				return softcap(player.t.leaves.pow(2), nD(1e70), 0.5);
			},
			effectDisplay() {
				const eff = this.effect();
				return `/${format(eff)}${
					eff.gte(1e70) ? " (softcapped)" : ""
				} Present Machine cost`;
			},
		},
		32: {
			description: "Unlock another tree buyable.",
			cost: nD(1e35),
			unlocked() {
				return getBuyableAmount("t", 11).gte(2);
			},
		},
		33: {
			description: "Start collecting leaves.",
			cost: nD(1e30),
			unlocked() {
				return hasUpgrade("t", 23);
			},
		},
	},
	buyables: {
		rows: 1,
		cols: 2,
		11: {
			title: "Mod Your Leafblower",
			cost() {
				return nD(1e5).pow(
					getBuyableAmount(this.layer, this.id).add(6)
				);
			},
			display() {
				return getBuyableText(this.layer, this.id);
			},
			description: "Multiply leaf gain.",
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
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
				return nD(2)
					.pow(getBuyableAmount("t", 11).mul(5).add(1))
					.max(1);
			},
			effectDisplay() {
				return `x${format(buyableEffect("t", 11))}`;
			},
			unlocked() {
				return hasUpgrade("t", 33);
			},
		},
		12: {
			title: "Enlist the help of elfs",
			cost() {
				return nD(1e7).pow(
					getBuyableAmount(this.layer, this.id).add(5)
				);
			},
			display() {
				return getBuyableText(this.layer, this.id);
			},
			description: "Multiply leaf gain based on elfs.",
			canAfford() {
				return player[this.layer].points.gte(this.cost());
			},
			buy() {
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
				return player.e.points
					.log10()
					.pow(getBuyableAmount("t", 12))
					.max(1);
			},
			effectDisplay() {
				return `x${format(buyableEffect("t", 12))}`;
			},
			unlocked() {
				return hasUpgrade("t", 32);
			},
		},
	},
	tabFormat: [
		"main-display",
		"prestige-button",
		"blank",
		"upgrades",
		"blank",
		"blank",
		"blank",
		[
			"display-text",
			() =>
				hasUpgrade("t", 33)
					? `You have ${formatWhole(
							player.t.leaves
					  )} leaves, multiplying tree gain by ${format(
							layers.t.effect()
					  )}`
					: "",
		],
		"blank",
		"buyables",
	],
	update(diff) {
		if (hasUpgrade("t", 33))
			player.t.leaves = player.t.leaves.add(
				player.t.points
					.log10()
					.log10()
					.pow(2)
					.mul(buyableEffect("t", 11))
					.mul(diff)
			);
	},
	effect() {
		return player.t.leaves.log(3).pow(2).max(1);
	},
});
