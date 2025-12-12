export class cCliente {
  constructor(dbCliente) {
    this.codCliente = dbCliente.CODCLIENTE;
    this.razonSocial = dbCliente.RAZONSOCIAL;
    this.rifCliente = dbCliente.NIF20;
    this.direccion = dbCliente.DIRECCION1;
    this.provincia = dbCliente.PROVINCIA;
    this.telefono = dbCliente.TELEFONO;
    this.codigoScim = dbCliente.CODSCIM;
  }
}

export class cProveedor {
  constructor(dbProveedor) {
    this.codProveedor = dbProveedor.CODPROVEEDOR;
    this.razonSocial = dbProveedor.NOMPROVEEDOR;
    this.rifProveedor = dbProveedor.NIF20;
    this.direccion = dbProveedor.DIRECCION1;
    this.provincia = dbProveedor.PROVINCIA;
    this.telefono = dbProveedor.TELEFONO;
    this.codigoScim = dbProveedor.CODSCIM;
  }
}
