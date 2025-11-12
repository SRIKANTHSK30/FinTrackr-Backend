import { Router } from "express";
import prisma from "@/utils/prisma";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Card
 *   description: Card management API
 */

/**
 * @swagger
 * /api/v1/cards:
 *   get:
 *     summary: Get all cards
 *     tags: [Card]
 *     responses:
 *       200:
 *         description: List of all cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *       500:
 *         description: Failed to fetch cards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (_req, res) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { created_at: "desc" },
    });
    return res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return res.status(500).json({ error: "Failed to fetch cards" });
  }
});

/**
 * @swagger
 * /api/v1/cards/{id}:
 *   get:
 *     summary: Get a single card by ID
 *     tags: [Card]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const card = await prisma.card.findUnique({
      where: { id: Number(id) },
    });

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    return res.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    return res.status(500).json({ error: "Failed to fetch card" });
  }
});

/**
 * @swagger
 * /api/v1/cards:
 *   post:
 *     summary: Create a new card
 *     tags: [Card]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - holder
 *               - number
 *               - expiry
 *               - balance
 *               - status
 *               - bank
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [VISA, MASTERCARD, RUPAY, MAESTRO, AMEX]
 *               holder:
 *                 type: string
 *               number:
 *                 type: string
 *               expiry:
 *                 type: string
 *               balance:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, blocked, expired]
 *               bank:
 *                 type: string
 *               gradient:
 *                 type: string
 *               border:
 *                 type: string
 *           example:
 *             type: VISA
 *             holder: John Doe
 *             number: 1234 5678 9012 3456
 *             expiry: 12/26
 *             balance: 5000
 *             status: active
 *             bank: HDFC Bank
 *             gradient: from-blue-500 to-purple-600
 *             border: border-blue-500
 *     responses:
 *       201:
 *         description: Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", async (req, res) => {
  try {
    const { type, holder, number, expiry, balance, status, bank, gradient, border } = req.body;

    const newCard = await prisma.card.create({
      data: {
        type,
        holder,
        number,
        expiry,
        balance,
        status,
        bank,
        gradient,
        border,
      },
    });

    return res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating card:", error);
    return res.status(500).json({ error: "Failed to create card" });
  }
});

/**
 * @swagger
 * /api/v1/cards/{id}:
 *   put:
 *     summary: Update an existing card
 *     tags: [Card]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Card'
 *           example:
 *             type: MASTERCARD
 *             holder: Jane Doe
 *             number: 9876 5432 1098 7654
 *             expiry: 11/27
 *             balance: 7000
 *             status: active
 *             bank: ICICI Bank
 *             gradient: from-green-500 to-teal-600
 *             border: border-green-500
 *     responses:
 *       200:
 *         description: Card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedCard = await prisma.card.update({
      where: { id: Number(id) },
      data,
    });

    return res.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return res.status(500).json({ error: "Failed to update card" });
  }
});

/**
 * @swagger
 * /api/v1/cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     tags: [Card]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Card deleted successfully
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    return res.status(500).json({ error: "Failed to delete card" });
  }
});

export default router;
