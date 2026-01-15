import { syncPriceByCardId } from "../services/price.service.js";


export const updatePrice = async (req, res) => {
  const { cardId } = req.params;

  try {
    const price = await syncPriceByCardId(cardId);

    if (!price) {
      return res
        .status(404)
        .json({ message: "No se encontro precio disponible" });
    }

    res.status(200).json({
      message: "Precio actualizado correctamente",
      cardId,
      currentPrice: price,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

