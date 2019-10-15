const express = require("express");

const _ = require("underscore");

let {
  verificaToken,
  verificaAdmin_role
} = require("../middlewares/autenticacion");

let app = express();

let Categoria = require("../models/categoria");

// ==================
// Mostrar todas las categorias
// ==================
app.get("/categoria", verificaToken, (req, res) => {
  Categoria.find({})
    .sort("descripcion")
    .populate("usuario", "nombre email")
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        categorias
      });
    });
});

// ==================
// Mostrar una categoria
// ==================
app.get("/categoria/:id", (req, res) => {
  let id = req.params.id;

  Categoria.findById(id, (err, categoriaBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!categoriaBD) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Categoria no encontrada"
        }
      });
    }
    res.json({
      ok: true,
      categoria: categoriaBD
    });
  });
});

// ==================
// Crear nueva categoria
// ==================
app.post("/categoria", verificaToken, (req, res) => {
  let body = req.body;
  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// ==================
// Actualizar la categoria
// ==================
app.put("/categoria/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["descripcion"]);

  Categoria.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, categoriaBD) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if (!categoriaBD) {
        return res.status(400).json({
          ok: false,
          err: {
              message: "Categoria no encontrada"
          }
        });
      }
      res.json({
        ok: true,
        categoria: categoriaBD
      });
    }
  );
});

// ==================
// Borrar categoria
// ==================
app.delete(
  "/categoria/:id",
  [verificaToken, verificaAdmin_role],
  (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if (!categoriaBorrada) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no encontrado"
          }
        });
      }
      res.json({
        ok: true,
        categoria: categoriaBorrada
      });
    });
  }
);

module.exports = app;
