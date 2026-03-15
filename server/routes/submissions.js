/**
 * Submissions API Routes — Supabase
 * Handles listing and reviewing story submissions (Admin portal)
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authRequired } = require('../middleware/auth');

// Middleware to check if user is admin
const adminRequired = async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      return res.status(403).json({ error: 'Admin or moderator access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Auth check failed' });
  }
};

/**
 * GET /api/v1/submissions
 * List all submissions (Admin)
 */
router.get('/', authRequired, adminRequired, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { status, limit = 50, page = 1 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('submissions')
      .select('*, stories!inner(title, author_name), profiles!user_id(username, display_name)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error, count } = await query
      .order('submitted_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({
      success: true,
      data: submissions,
      count,
      page: Number(page),
      pages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('List submissions error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/submissions/:id
 * Get single submission details (Admin)
 */
router.get('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const { data: submission, error } = await supabaseAdmin
      .from('submissions')
      .select('*, stories(*), profiles!user_id(username, display_name)')
      .eq('id', req.params.id)
      .single();

    if (error || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/v1/submissions/:id/review
 * Admin approve, reject, or request revision
 */
router.patch('/:id/review', authRequired, adminRequired, async (req, res) => {
  try {
    const subId = req.params.id;
    const { status, review_notes } = req.body;

    if (!['approved', 'rejected', 'revision_requested'].includes(status)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }

    // 1. Get submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('id', subId)
      .single();

    if (fetchError || !submission) return res.status(404).json({ error: 'Submission not found' });

    // 2. Update submission
    const { data: updatedSub, error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({
        status,
        review_notes: review_notes || '',
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', subId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Update story status based on submission status
    let storyStatus = 'in_review';
    if (status === 'approved') storyStatus = 'published';
    if (status === 'rejected') storyStatus = 'rejected';
    if (status === 'revision_requested') storyStatus = 'draft';

    const { error: storyError } = await supabaseAdmin
      .from('stories')
      .update({ status: storyStatus })
      .eq('id', submission.story_id);

    if (storyError) throw storyError;

    return res.json({ success: true, data: updatedSub });
  } catch (error) {
    console.error('Review submission error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
