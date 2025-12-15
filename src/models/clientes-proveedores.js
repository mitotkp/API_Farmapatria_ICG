export class cCliente {
  constructor(dbCliente) {
    this.codCliente = dbCliente.CODCLIENTE;
    this.razonSocial = dbCliente.RAZONSOCIAL || dbCliente.NOMBRECLIENTE;
    this.rifCliente = dbCliente.NIF20;
    this.direccion = dbCliente.DIRECCION1;
    this.codigoPostal = dbCliente.CODPOSTAL;
    this.poblacion = dbCliente.POBLACION;
    this.provincia = dbCliente.PROVINCIA;
    this.pais = dbCliente.PAIS;
    this.telefono = dbCliente.TELEFONO || dbCliente.TELEFONO1;
    this.codigoScim = dbCliente.CODSCIM;
  }
}

export class cProveedor {
  constructor(dbProveedor) {
    this.codProveedor = dbProveedor.CODPROVEEDOR;
    this.razonSocial = dbProveedor.NOMPROVEEDOR;
    this.rifProveedor = dbProveedor.NIF20;
    this.direccion = dbProveedor.DIRECCION1;
    this.codigoPostal = dbProveedor.CODPOSTAL;
    this.poblacion = dbProveedor.POBLACION;
    this.provincia = dbProveedor.PROVINCIA;
    this.pais = dbProveedor.PAIS;
    this.telefono = dbProveedor.TELEFONO || dbProveedor.TELEFONO1;
    this.codigoScim = dbProveedor.CODSCIM;
  }
}
