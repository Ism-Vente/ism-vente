
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")("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");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/create-checkout-session", async (req, res) => {
  const { panier } = req.body;

  try {
    const line_items = panier.map(p => ({
      price_data: {
        currency: "eur",
        product_data: { name: p.nom },
        unit_amount: Math.round(p.prix * 100)
      },
      quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      payment_intent_data: {
        description: "Commande IsmVente - Client"
      },
      success_url: "https://ismvente.netlify.app/confirmation.html",
      cancel_url: "https://ismvente.netlify.app/panier.html"
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log("✅ Serveur Stripe lancé sur le port " + PORT));
