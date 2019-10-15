const express = require("express");

const _ = require("underscore");

const { verificaToken } = require("../middlewares/autenticacion");

let app = express();
let Producto = require("../models/producto");

// ==================
// Mostrar todos los productos
// ==================
app.get("/producto", verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  Producto.find({ disponible: true })
    .sort("nombre")
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .skip(desde)
    .limit(5)
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        productos
      });
    });
});

// ==================
// Mostrar un producto por id
// ==================
app.get("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productoBD) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if (!productoBD) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrada"
          }
        });
      }
      res.json({
        ok: true,
        producto: productoBD
      });
    });
});

// ==================
// Buscar productos
// ==================
app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;

  let regex = new RegExp(termino, "i");

  Producto.find({ nombre: regex })
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        productos
      });
    });
});

// ==================
// Crear un nuevo producto
// ==================
app.post("/producto", verificaToken, (req, res) => {
  let body = req.body;
  let producto = new Producto({
    nombre: body.nombre,
    precioUni: Number(body.precioUni),
    descripcion: body.descripcion,
    categoria: body.categoria,
    usuario: req.usuario._id
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.status(201).json({
      ok: true,
      producto: productoDB
    });
  });
});

// ==================
// Actualizar un producto
// ==================
app.put("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, [
    "nombre",
    "precioUni",
    "descripcion",
    "disponible",
    "categoria"
  ]);

  Producto.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado"
          }
        });
      }
      res.json({
        ok: true,
        usuario: productoDB
      });
    }
  );
});

// ==================
// Borrar un producto
// ==================
app.delete("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  let cambioDisponible = {
    disponible: false
  };

  // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
  Producto.findByIdAndUpdate(
    id,
    cambioDisponible,
    { new: true, runValidators: true },
    (err, productoBorrado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      if (!productoBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado"
          }
        });
      }
      res.json({
        ok: true,
        usuario: productoBorrado
      });
    }
  );
});

module.exports = app;
