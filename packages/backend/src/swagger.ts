import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FOBOH Pricing API",
      version: "1.0.0",
      description:
        "Customer-specific pricing management for food and beverage suppliers",
    },
    servers: [{ url: "/api" }],
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
