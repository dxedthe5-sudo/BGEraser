import React from 'react';

export const CheckerboardPattern: React.FC = () => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `
        linear-gradient(45deg, #374151 25%, transparent 25%),
        linear-gradient(-45deg, #374151 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #374151 75%),
        linear-gradient(-45deg, transparent 75%, #374151 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#1f2937',
    }}
  />
);
