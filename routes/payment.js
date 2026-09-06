const express = require('express');
const axios = require('axios');
const AccessCode = require('../models/AccessCode');
const auth = require('../middleware/auth');

const router = express.Router();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const PRICING = {
  '3-hours': 25 * 100, // in kobo
  '6-hours': 50 * 100,
  '24-hours': 110 * 100,
};

// Initiate payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { tier } = req.body;

    if (!tier || !PRICING[tier]) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const amount = PRICING[tier];
    const user = req.user;

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: user.email,
        amount,
        metadata: {
          userId: user.id,
          tier,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    res.json({
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference required' });
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      const { tier } = response.data.data.metadata;
      const price = PRICING[tier] / 100;

      const accessCode = new AccessCode({
        userId: req.user.id,
        tier,
        price,
        paymentReference: reference,
      });
      await accessCode.save();

      res.json({
        message: 'Payment successful',
        accessCode: accessCode.code,
        tier,
        expiresAt: accessCode.expiresAt,
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
