// Free edition: no Google Maps/Places key, billing account, database, or paid search.
export const config = {
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  // Paste your own payment links. These links open a payment page; the app never charges a card.
  // Configure $5/$10/$15 in your payment provider, or let visitors choose the amount there.
  support: {
    coffee: 'https://buy.stripe.com/5kQ6oHdM85To0WR3xg1B607',
    burger: 'https://buy.stripe.com/14AcN57nKgy2cFzd7Q1B606',
    meal: 'https://buy.stripe.com/5kQ28r5fCa9E8pj9VE1B601',
    charity: 'https://buy.stripe.com/9B600j7nK6Xs20V2tc1B60r',
  },
};
