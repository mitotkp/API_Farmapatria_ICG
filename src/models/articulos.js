export class cArticulo {
  constructor(dbArticulo) {
    this.codArticuloICg = dbArticulo.CODARTICULO;
    this.codArticuloScim = null;
    this.referencia = dbArticulo.REFERENCIA;
    this.codigoBarras = dbArticulo.CODBARRAS;
    this.descripcion = dbArticulo.DESCRIPCION;
    this.departamento = dbArticulo.DEPARTAMENTO;
    this.seccion = dbArticulo.SECCION;
    this.familia = dbArticulo.FAMILIA;
    this.subfamilia = dbArticulo.SUBFAMILIA;
    this.precio = dbArticulo.PRECIO;
    this.stock = dbArticulo.STOCK;
    this.tafiraventa = dbArticulo.TAFIRAVENTA;
    this.costeArticulo = dbArticulo.COSTE;
  }
}
