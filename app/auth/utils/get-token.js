function getToken(req) {
  // (1) Get token from headers client
  let token =
    // Apakah ada req header authorization yang didapatkan
    req.headers.authorization
      ? //  Jika ada pasang menjadi Bearer token
        req.headers.authorization.replace("Bearer ", "")
      : // Jika tidak ada kosongkan
        null;

  // (2) Jika token ada, kembalikan token, jika tidak kembalikan null
  return token && token.length ? token : null;
}

// Export
module.exports = {
  getToken,
};
