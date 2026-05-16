import generateException from './generateException';

interface NegativePriceProduct {
  productId: string;
  productTitle: string;
  basePrice: number;
  computedPrice: number;
}

class NegativePriceException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;
  products: NegativePriceProduct[];

  constructor(products: NegativePriceProduct[]) {
    const names = products.map((p) => p.productTitle).join(', ');
    const description = `Negative prices detected for: ${names}`;
    super(description);
    generateException(this, 422, 'Negative price', description);
    this.products = products;
  }
}

export default NegativePriceException;
