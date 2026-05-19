import { useContext } from 'react';
import ShowcaseContext from './ShowcaseContext';

export const useShowcaseContext = () => {
  return useContext(ShowcaseContext);
};
