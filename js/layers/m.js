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
	gainMult() {
		let mult = nD(1);

		if (hasUpgrade("t", 31)) mult = mult.mul(upgradeEffect("t", 31));

		return nD(1).div(mult);
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
		return softcap(
			nD(2)
				.pow(player.m.points)
				.max(1)
				.pow(hasUpgrade("m", 22) ? 2 : 1)
				.pow(hasChallenge("m", 21) ? 3 : 1),
			nD(1e150),
			0.5
		);
	},
	roundUpCost: true,
	effectDescription() {
		return `multiplying elf gain by ${format(this.effect())}`;
	},
	canBuyMax() {
		return hasMilestone("m", 5);
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
		5: {
			requirementDescription: "42 best present machines",
			effectDescription: "You can buy max present machines.",
			done() {
				return player.m.best.gte(42);
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
		22: {
			description: "Square the present machine effect.",
			cost: nD(24),
			unlocked() {
				return hasChallenge("m", 12);
			},
		},
	},
	challenges: {
		rows: 2,
		cols: 2,
		11: {
			name: "rona",
			challengeDescription:
				"Everybody is at home, so present gain is square rooted.",
			rewardDescription: "Raise present gain to the power of 1.5.",
			goal: nD(1e7),
			currencyInternalName: "points",
			currencyDisplayName: "presents",
			unlocked() {
				return hasUpgrade("t", 13);
			},
		},
		12: {
			name: "COVID-19",
			challengeDescription:
				"Everybody is dying, so elf gain is square rooted.",
			rewardDescription: "Unlock another Present Machine upgrade.",
			goal: nD(1e30),
			currencyInternalName: "points",
			currencyDisplayName: "presents",
			unlocked() {
				return hasChallenge("m", 11);
			},
		},
		21: {
			name: "SARS-CoV-2",
			challengeDescription:
				"Everybody is dying, so elf gain is raised to the power of .001.",
			rewardDescription: "Present Machine effect is cubed.",
			goal: nD(1e6),
			currencyInternalName: "points",
			currencyDisplayName: "presents",
			unlocked() {
				return hasUpgrade("t", 11);
			},
		},
		22: {
			name: "Coronavirus",
			challengeDescription:
				"It's finally over. We only got set back a few thousand years in history. Things from Trees and Present Machine layers have no effect, and you don't keep elf upgrades upon entering.",
			rewardDescription: "New. Prestige. Layer.",
			goal: nD(5e10),
			currencyInternalName: "points",
			currencyDisplayName: "presents",
			unlocked() {
				return hasChallenge("m", 21);
			},
		},
	},
});
