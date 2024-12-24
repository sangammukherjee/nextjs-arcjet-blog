import fetch from "node-fetch";

export async function POST(req, res) {
  try {
    const orderDetails = req.body;

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer A21AAL6tdpvi4TW5_Og-NRVvTr6UEmYe5a-DJ2A4cKzaJ41cn0XouxYQDf360_MkKI2sMBNbre4Wag_w4XwPEzgbSD-UNn4zg`,
        },
        body: JSON.stringify(orderDetails),
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    }
  } catch (e) {
    return {
      error: "Some error occured! Please try after some time",
    };
  }
}
