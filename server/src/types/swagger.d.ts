declare module "swagger-jsdoc" {
  const swaggerJsdoc: any;
  export default swaggerJsdoc;
}

declare module "swagger-ui-express" {
  import { RequestHandler } from "express";
  const swaggerUi: {
    serve: RequestHandler[];
    setup: (swaggerDoc: any, options?: any) => RequestHandler;
  };
  export default swaggerUi;
}
