function dPrice(priceDecimal) {
    const priceString = priceDecimal.toString();
    return Number(priceString);
}


module.exports = {
    dPrice
};