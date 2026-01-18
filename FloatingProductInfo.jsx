
import React from 'react';

const FloatingProductInfo = ({ product }) => {
  if (!product) return null;
  
  return (
    <div className="floating-product-info">
      <h3>{product.name}</h3>
      {product.price && <p className="price">{product.price}</p>}
    </div>
  );
};

export default FloatingProductInfo;
