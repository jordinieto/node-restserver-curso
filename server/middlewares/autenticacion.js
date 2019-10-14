const jwt = require("jsonwebtoken");

// ==================
// Vericficar Token
// ==================
let verificaToken = (req, res, next) => {
  let token = req.get("Authorization");

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: "Token no válido"
        }
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};
// ==================
// Vericficar AdminRole
// ==================
let verificaAdmin_role = (req, res, next) => {
  let usuario = req.usuario;

  if (usuario.role === "ADMIN_ROLE") {
    next();
  } else {
      return res.json({
          ok: false,
          err: {
              message: "El usuario no es administrador"
          }
      });
  }
  
};

module.exports = {
  verificaToken,
  verificaAdmin_role
};
