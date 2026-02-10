
import React from 'react';
import { Landmark } from 'lucide-react';
import { BANK_LOGOS } from '../constants';

interface BankLogoProps {
  name: string;
  size?: number;
}

const BankLogo: React.FC<BankLogoProps> = ({ name, size = 24 }) => {
  const logoUrl = Object.entries(BANK_LOGOS).find(([key]) =>
    name.toLowerCase().includes(key.toLowerCase())
  )?.[1];

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="object-contain bg-white rounded-sm"
        style={{ width: size, height: size }}
      />
    );
  }

  return <Landmark size={size} />;
};

export default BankLogo;
