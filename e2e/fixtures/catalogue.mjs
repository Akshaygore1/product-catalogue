import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';

const products = [
  {
    id: 1,
    title: 'Pocket Speaker',
    description: 'A compact speaker for travel.',
    category: 'electronics',
    price: 29.99,
    rate: 3,
  },
  { id: 2, title: 'Studio Headphones', category: 'electronics', price: 79, rate: 4.9 },
  { id: 3, title: 'Desk Charger', category: 'electronics', price: 19, rate: 4.5 },
  { id: 4, title: 'USB Cable', category: 'electronics', price: 9, rate: 4.1 },
  { id: 5, title: 'Silver Ring', category: 'jewellery', price: 39, rate: 4.2 },
  { id: 9, title: 'Travel Backpack', category: 'accessories', price: 59, rate: 4.7 },
  { id: 14, title: 'Rain Jacket', category: 'clothing', price: 69, rate: 4.6 },
  { id: 17, title: 'Canvas Tote', category: 'accessories', price: 25, rate: 4.4 },
].map(({ description = 'A product from the catalogue.', rate, ...product }) => ({
  ...product,
  description,
  image: 'http://catalogue-fixture:3000/product.png',
  rating: { rate, count: 10 },
}));

const image = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jPnkAAAAASUVORK5CYII=',
  'base64',
);

createServer((request, response) => {
  if (request.url === '/products') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(products));
  } else if (request.url === '/product.png') {
    response.writeHead(200, { 'Content-Type': 'image/png' });
    response.end(image);
  } else {
    response.writeHead(404).end();
  }
}).listen(3000);
