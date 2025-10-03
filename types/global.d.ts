declare module '*.svg' {
  import type { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

interface Navigator {
  permissions?: {
    query: (options: { name: string }) => Promise<{ state: 'granted' | 'denied' | 'prompt' }>;
  };
}
