class Spot {
  constructor() {
    this.account = async () => Promise.resolve({ data: 'data' });
  }
}

module.exports = {
  Spot,
};
