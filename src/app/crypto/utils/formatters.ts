export const formatPrice = (price: number) => {
  if (price < 0.0001) {
    return price.toFixed(8);
  }
  
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: price < 1 ? 6 : 2
  });
}; 