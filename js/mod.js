let modInfo = {
	name: "圣诞树 - The Christmas Tree",
	id: "xmastree",
	author: "Yhvr",
	pointsName: "presents",
	discordName: "ego",
	discordLink: "https://yhvr.me/ego",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players

	offlineLimit: 1, // In hours
};

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "Mandatory Dimensions",
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.3 - Mandatory Dimensions</h3><br>
		- added an antimatter dimensions clone (toys)<br>
		- fixed bugs<br>
		- made dark theme darker, silence mkey<br>
	<h3>v0.2 - Cascading StyleShits</h3><br>
		- finished trees<br>
		- added some more challenges<br>
		- made your eyes burn<br>
	<h3>v0.1 - Fart Mode</h3><br>
		- bad humor<br>
		- added elves<br>
		- added present machines<br>
		- added about 4/9 of the tree layer`;

let winText = `Hey, nice! You beat this game. There was originally gonna be 2 more rows, but christmas has come and gone, and TMT is not as easy-to-use as it makes itself out to be. So, for (probably) ever, you reached the end! Good job.`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = [];

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints);
}

// Determines if it should show points/sec
function canGenPoints() {
	return hasUpgrade("e", 11);
}

// Calculate points/sec!
function getPointGen() {
	if (!canGenPoints()) return new Decimal(0);

	let gain = new Decimal(1);

	if (hasUpgrade("e", 12)) gain = gain.mul(upgradeEffect("e", 12));

	if (!inChallenge("m", 22)) {
		if (hasUpgrade("m", 21)) gain = gain.mul(upgradeEffect("m", 21));
		if (hasUpgrade("t", 12)) gain = gain.mul(10);
	}

	gain = gain.mul(buyableEffect("e", 11));

	if (hasChallenge("m", 11)) gain = gain.pow(1.5);
	if (inChallenge("m", 11)) gain = gain.sqrt();

	return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
	return {};
}

// Display extra things at the top of the page
var displayThings = [];

// Determines when the game "ends"
function isEndgame() {
	return player.to.points.gte(nD(17));
}

// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return 3600; // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {}
