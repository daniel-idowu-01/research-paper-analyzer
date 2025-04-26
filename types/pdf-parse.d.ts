declare module "pdf-parse" {
  interface PDFParseResult {
    text: string;
    metadata: any;
    version: string;
  }

  function pdfParse(
    data: Buffer | Uint8Array,
    options?: any
  ): Promise<PDFParseResult>;
  export = pdfParse;
}
