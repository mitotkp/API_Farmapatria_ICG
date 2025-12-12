export class cGuia {
  constructor(data) {
    this.serieFactura = data.serieFactura;
    this.numFactura = data.numFactura;

    this.numeroGuia = data.numeroGuia || null;
    this.estado = data.estado || "PENDIENTE";

    this.fechaGeneracion = data.fechaGeneracion
      ? new Date(data.fechaGeneracion)
      : new Date();

    this.usuario = data.usuario || "SISTEMA";
    this.mensajeError = data.mensajeError || "";
    this.urlPdf = this.numeroGuia ? `/api/imprimir/${this.numeroGuia}` : "#";
  }

  get esAnulable() {
    return this.numeroGuia && this.estado === "GENERADA";
  }

  get estaAprobada() {
    return this.estado === "GENERADA";
  }
}
