"use client";

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  score: number;
  status: string;
  brand?: string;
  relatedProduct?: string;
}

export default function ProductPipeline() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  const stages = ['Idea', 'Research', 'Evaluation', 'Move to Feasibility', 'Development', 'Launch'];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Product Pipeline</h1>
      <div className="grid grid-cols-3 gap-4">
        {stages.map(stage => (
          <div key={stage} className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-bold mb-2">{stage}</h2>
            {products.filter(product => product.status === stage).map(product => (
              <div key={product.id} className="bg-gray-100 p-2 rounded-md mb-2">
                <h3 className="text-md font-medium">{product.name}</h3>
                <p className="text-gray-500 text-sm">Score: {product.score}/60</p>
                {product.brand && <p className="text-gray-500 text-sm">Brand: {product.brand}</p>}
                {product.relatedProduct && <p className="text-gray-500 text-sm">Related: {product.relatedProduct}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
