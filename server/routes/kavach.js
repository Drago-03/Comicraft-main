const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

/**
 * @swagger
 * /api/v1/kavach/scan:
 *   post:
 *     tags:
 *       - KAVACH
 *     summary: Trigger KAVACH scanning pipeline
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - story_id
 *             properties:
 *               story_id:
 *                 type: string
 *               scan_type:
 *                 type: string
 *                 default: full
 *     responses:
 *       201:
 *         description: Scan successfully queued
 */
router.post('/scan', authRequired, async (req, res) => {
  try {
    const { story_id, scan_type = 'full' } = req.body;
    const user_id = req.user.id; // from auth middleware

    if (!story_id) {
      return res.status(400).json({ error: 'story_id is required' });
    }

    // Create a new scan record in Supabase
    const { data: scan, error } = await supabaseAdmin
      .from('kavach_scans')
      .insert({
        story_id,
        user_id,
        scan_type,
        status: 'queued',
        pipeline_step: 0,
        pipeline_log: [],
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: In a real implementation this would trigger an async worker queue
    res.status(201).json({ success: true, scan });
  } catch (error) {
    console.error('Error starting KAVACH scan:', error);
    res.status(500).json({ error: 'Failed to start scan', details: error.message });
  }
});

/**
 * @swagger
 * /api/v1/kavach/scan/{id}:
 *   get:
 *     tags:
 *       - KAVACH
 *     summary: Get status of a KAVACH scan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scan details
 */
router.get('/scan/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: scan, error } = await supabaseAdmin
      .from('kavach_scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    res.json({ success: true, scan });
  } catch (error) {
    console.error('Error fetching KAVACH scan:', error);
    res.status(500).json({ error: 'Failed to fetch scan', details: error.message });
  }
});

/**
 * @swagger
 * /api/v1/kavach/appeals:
 *   post:
 *     tags:
 *       - KAVACH
 *     summary: File DMCA counterclaim
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - takedown_id
 *               - justification
 *               - digital_signature
 *             properties:
 *               takedown_id:
 *                 type: string
 *               justification:
 *                 type: string
 *               digital_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appeal submitted successfully
 */
router.post('/appeals', authRequired, async (req, res) => {
  try {
    const { takedown_id, justification, digital_signature } = req.body;
    
    if (!takedown_id || !justification || !digital_signature) {
      return res.status(400).json({ error: 'takedown_id, justification, and digital_signature are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('dmca_takedowns')
      .update({ 
        status: 'counter_notice',
        reviewer_notes: justification,
        digital_signature,
        updated_at: new Date().toISOString()
      })
      .eq('id', takedown_id)
      .select()
      .single();
      
    if (error) throw error;

    res.json({ success: true, message: 'Appeal submitted successfully', data });
  } catch (error) {
    console.error('Error submitting appeal:', error);
    res.status(500).json({ error: 'Failed to submit appeal', details: error.message });
  }
});

module.exports = router;
