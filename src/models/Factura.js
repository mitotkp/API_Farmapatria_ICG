export class cFacturaVenta {
  constructor(dbHeader, dbItems = []) {
    this.numSerie = dbHeader.NUMSERIE;
    this.numFactura = dbHeader.NUMFACTURA;
    this.identificadorCompleto = `${dbHeader.NUMSERIE}-${dbHeader.NUMFACTURA}`;
    this.fecha = new Date(dbHeader.FECHA);

    this.codAlmacen = dbHeader.CODALMACEN;

    this.cliente = {
      codCliente: dbHeader.CODCLIENTE,
      razonSocial: dbHeader.RAZONSOCIAL || dbHeader.NOMBRECLIENTE,
      rifCliente: dbHeader.NIF20,
      direccion: dbHeader.DIRECCION1,
      codigoScim: dbHeader.CODSICM || "",
    };

    this.totalNetoBs = Number(dbHeader.TOTALNETO_BS) || 0;
    this.totalNetoUsd = Number(dbHeader.TOTALNETO_USD) || 0;

    this.items = dbItems.map((item) => new cItemFacturaVenta(item));
  }

  get totalUnidades() {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }
}

export class cItemFacturaVenta {
  constructor(dbItem) {
    this.codArticulo = dbItem.CODARTICULO;
    this.refProveedor = dbItem.REFERENCIA || "SIN REFERENCIA";
    this.descripcion = dbItem.DESCRIPCION;
    this.cantidad = Number(dbItem.CANTIDAD) || 0;
    this.precioBs = Number(dbItem.PRECIOBS) || 0;
    this.precioUsd = Number(dbItem.PRECIOUSD) || 0;

    this.codBarras = dbItem.CODBARRAS || "SIN CODBARRAS";

    this.talla = dbItem.TALLA ? dbItem.TALLA.trim() : ".";
    this.color = dbItem.COLOR ? dbItem.COLOR.trim() : ".";

    this.vencimiento = dbItem.VENCIMIENTO
      ? new Date(dbItem.VENCIMIENTO)
      : new Date("2030-12-31");

    if (isNaN(this.vencimiento.getTime())) {
      this.vencimiento = new Date("2030-12-31");
    }

    this.codigoScimOficial = null;
  }
}

export class cFacturaCompra {
  constructor(dbHeader, dbItems = []) {
    this.numSerie = dbHeader.NUMSERIE;
    this.numFactura = dbHeader.NUMFACTURA;
    this.numAlbaran = dbHeader.NUMALBARAN;
    this.identificadorCompleto = `${dbHeader.NUMSERIE}-${dbHeader.NUMFACTURA}`;
    this.fecha = new Date(dbHeader.FECHAALBARAN);
    this.codAlmacen = dbHeader.CODALMACEN;

    this.proveedor = {
      codigo: dbHeader.CODPROVEEDOR,
      razonSocial: dbHeader.NOMPROVEEDOR,
      rif: dbHeader.NIF20,
      direccion: dbHeader.DIRECCION1,
      codigoScim: dbHeader.CODSICM || null,
    };

    this.totalNetoBs = Number(dbHeader.TOTALNETO_BS) || 0;
    this.totalNetoUsd = Number(dbHeader.TOTALNETO_USD) || 0;

    this.items = dbItems.map((item) => new cItemFacturaCompra(item));
  }
}

export class cItemFacturaCompra {
  constructor(dbItem) {
    this.codArticulo = dbItem.CODARTICULO;
    this.descripcion = dbItem.DESCRIPCION;
    this.cantidad = Number(dbItem.CANTIDAD) || 0;
    this.precioBs = Number(dbItem.PRECIOBS) || 0;
    this.precioUsd = Number(dbItem.PRECIOUSD) || 0;
    this.codBarras = dbItem.CODBARRAS || "SIN CODBARRAS";

    this.talla = dbItem.TALLA ? dbItem.TALLA.trim() : ".";
    this.color = dbItem.COLOR ? dbItem.COLOR.trim() : ".";

    this.vencimiento = dbItem.VENCIMIENTO
      ? new Date(dbItem.VENCIMIENTO)
      : new Date("2030-12-31");

    if (isNaN(this.vencimiento.getTime())) {
      this.vencimiento = new Date("2030-12-31");
    }

    this.codigoScimOficial = null;
  }
}
