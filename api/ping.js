module.exports = (req, res) => {
  res.status(200).json({ ping: 'pong', ts: Date.now() });
};
