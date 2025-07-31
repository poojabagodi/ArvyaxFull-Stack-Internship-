const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sessions/public
// @desc    Get all published sessions
// @access  Public
router.get('/sessions/public', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'published' })
      .populate('user_id', 'email')
      .sort({ createdAt: -1 });

    res.json({
      data: {
        sessions
      }
    });

  } catch (error) {
    console.error('Get public sessions error:', error);
    res.status(500).json({
      error: 'Server error while fetching sessions'
    });
  }
});

// @route   GET /api/sessions/my
// @desc    Get current user's sessions
// @access  Private
router.get('/sessions/my', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user._id })
      .populate('user_id', 'email')
      .sort({ updatedAt: -1 });

    res.json({
      data: {
        sessions
      }
    });

  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({
      error: 'Server error while fetching your sessions'
    });
  }
});

// @route   GET /api/sessions/my/:id
// @desc    Get specific session by ID (user's own)
// @access  Private
router.get('/sessions/my/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user._id
    }).populate('user_id', 'email');

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.json({
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Server error while fetching session'
    });
  }
});

// @route   POST /api/sessions/draft
// @desc    Save session as draft
// @access  Private
router.post('/sessions/draft', auth, async (req, res) => {
  try {
    const { id, title, tags, video_url, thumbnail, description, duration } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    let session;

    if (id) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        {
          title: title.trim(),
          tags: Array.isArray(tags) ? tags : [],
          video_url: video_url || '',
          thumbnail: thumbnail || '',
          description: description || '',
          duration: duration || '',
          status: 'draft'
        },
        { new: true, runValidators: true }
      ).populate('user_id', 'email');

      if (!session) {
        return res.status(404).json({
          error: 'Session not found'
        });
      }
    } else {
      // Create new session
      session = new Session({
        user_id: req.user._id,
        title: title.trim(),
        tags: Array.isArray(tags) ? tags : [],
        video_url: video_url || '',
        thumbnail: thumbnail || '',
        description: description || '',
        duration: duration || '',
        status: 'draft'
      });

      await session.save();
      await session.populate('user_id', 'email');
    }

    res.json({
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      error: 'Server error while saving draft'
    });
  }
});

// @route   POST /api/sessions/publish
// @desc    Publish session
// @access  Private
router.post('/sessions/publish', auth, async (req, res) => {
  try {
    const { id, title, tags, video_url, thumbnail, description, duration } = req.body;

    // Validation for publishing
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Title is required for publishing'
      });
    }

    if (!video_url || !video_url.trim()) {
      return res.status(400).json({
        error: 'Video URL is required for publishing'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Description is required for publishing'
      });
    }

    let session;

    if (id) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        {
          title: title.trim(),
          tags: Array.isArray(tags) ? tags : [],
          video_url: video_url.trim(),
          thumbnail: thumbnail || '',
          description: description.trim(),
          duration: duration || '',
          status: 'published'
        },
        { new: true, runValidators: true }
      ).populate('user_id', 'email');

      if (!session) {
        return res.status(404).json({
          error: 'Session not found'
        });
      }
    } else {
      // Create new session
      session = new Session({
        user_id: req.user._id,
        title: title.trim(),
        tags: Array.isArray(tags) ? tags : [],
        video_url: video_url.trim(),
        thumbnail: thumbnail || '',
        description: description.trim(),
        duration: duration || '',
        status: 'published'
      });

      await session.save();
      await session.populate('user_id', 'email');
    }

    res.json({
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Publish session error:', error);
    res.status(500).json({
      error: 'Server error while publishing session'
    });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete session
// @access  Private
router.delete('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.json({
      data: {
        success: true,
        message: 'Session deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      error: 'Server error while deleting session'
    });
  }
});

module.exports = router;

