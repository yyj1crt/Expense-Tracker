declare module "swagger-jsdoc" {
  const swaggerJsdoc: (options: object) => object;
  export default swaggerJsdoc;
}

declare module "swagger-ui-express" {
  import { RequestHandler } from "express";
  const swaggerUi: {
    serve: RequestHandler[];
    setup: (swaggerDoc: object, options?: object) => RequestHandler;
  };
  export default swaggerUi;
}
