module.exports = function() {
  return process.env.TECHPOOL_SECRET || "HIGH-ENTROPY-SECRET-KEY";
};