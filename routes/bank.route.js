// routes/bank.route.js
import express from 'express'
import { getBanks, deleteSubaccount } from '../controller/bank/bank.controller.js'

const router = express.Router()

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Retrieve list of supported banks from Chapa
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of banks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 130
 *                       slug:
 *                         type: string
 *                         example: abay_bank
 *                       name:
 *                         type: string
 *                         example: Abay Bank
 *                       swift:
 *                         type: string
 *                         example: ABAYETAA
 *                       acct_length:
 *                         type: integer
 *                         example: 16
 *                       currency:
 *                         type: string
 *                         example: ETB
 *                       is_active:
 *                         type: integer
 *                         example: 1
 */
router.get('/', getBanks)

router.delete('/:id', deleteSubaccount)


export default router
