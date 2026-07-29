const isProd = process.env.NODE_ENV === 'production';

// [FIX] Em produção o frontend (Vercel) e o backend (Render) estão em domínios
// diferentes, logo o pedido é sempre "cross-site". Os browsers só enviam/aceitam
// cookies cross-site quando SameSite=None + Secure=true. Com SameSite=Lax (o valor
// anterior), o cookie era sempre rejeitado em produção (login com token via cookie,
// verify-login, logout, refresh-token). Em desenvolvimento local mantém-se 'lax'
// porque 'none' exige HTTPS, que normalmente não existe em localhost.
// [FIX] Adicionar 'partitioned' em produção (CHIPS - Cookies Having Independent
// Partitioned State): os browsers estão a passar a exigir este atributo em cookies
// de terceiros (cross-site) como este, ou vão passar a rejeitá-lo por completo.
// Requer sempre Secure=true e SameSite=None, por isso só faz sentido em produção.
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  ...(isProd ? { partitioned: true } : {})
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  });
};

module.exports = {
  setTokenCookie,
  cookieOptions
};
