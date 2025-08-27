import { ShoppingCart, Zap, Store as StoreIcon, Warehouse } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { Store } from '@/types';

export const Icons = {
  supermarket: (props: LucideProps) => <ShoppingCart {...props} />,
  express: (props: LucideProps) => <Zap {...props} />,
  'dark store': (props: LucideProps) => <Warehouse {...props} />,
  default: (props: LucideProps) => <StoreIcon {...props} />,
};

export const getStoreIcon = (type: Store['type']) => {
  return Icons[type] || Icons.default;
};
