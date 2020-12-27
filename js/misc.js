function getBuyableText(layer, id, tier = 0) {
	return `${
		layers[layer].buyables[id].description
			? `
${readData(layers[layer].buyables[id].description)}`
			: "\n"
	}
<b><h2>Amount:</h2></b> ${
		formatWhole(getBuyableAmount(layer, id)) +
		(layer === "to" ? ` (${formatWhole(player.to[`t${tier}Amt`])})` : "")
	}
<b><h2>Effect:</h2></b> ${readData(layers[layer].buyables[id].effectDisplay)}
<b><h2>Cost:</h2></b> ${formatWhole(layers[layer].buyables[id].cost())} ${
		tmp[layer].resource
	}`;
}

const nD = n => new Decimal(n);
