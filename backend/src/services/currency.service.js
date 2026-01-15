export const getExchangeRate = async () => {
  try {
    // API gratuita para el cambio de moneda
    const response = await fetch("https://open.er-api.com/v6/latest/EUR");
    const data = await response.json();
    return data.rates.USD; // Cuantos dolares es 1 euro
  } catch (error) {
    console.error("Error obteniendo moneda: ", error);
    return 1.08; // Fallback
  }
};
