module.exports = (o => {
  o = parseInt(o / 1000);
  const a = Math.floor(o / 3600),
    t = Math.floor(o % 3600 / 60);
  return `${0 != a ? a + "h " : ""}${0 != t ? t + "m " : ""}${Math.floor(o % 60)}s`;
});
