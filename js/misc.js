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
