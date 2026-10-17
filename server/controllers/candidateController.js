const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

const VALID_STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
const VALID_SORT_FIELDS = ['name', 'appliedAt', 'createdAt', 'experience'];

// @desc    Get all candidates (with search, filter, sort, pagination)
// @route   GET /api/candidates
const getCandidates = async (req, res, next) => {
  try {
    const {
      search,
      stage,
      job,
      skills,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by stage
    if (stage) {
      const stages = stage.split(',').filter((s) => VALID_STAGES.includes(s));
      if (stages.length) filter.stage = { $in: stages };
    }

    // Filter by job
    if (job) filter.job = job;

    // Filter by skills (comma-separated)
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length) {
        filter.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
      }
    }

    // Sorting
    const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'appliedAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .populate('job', 'title department status')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum),
      Candidate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: candidates,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('job', 'title department location status');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a candidate
// @route   POST /api/candidates
const createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, skills, experience, job, stage, appliedAt } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate job exists if provided
    if (job) {
      const jobDoc = await Job.findById(job);
      if (!jobDoc) {
        return res.status(404).json({ success: false, message: 'Referenced job not found' });
      }
    }

    const candidate = await Candidate.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
      experience: experience || 0,
      job: job || null,
      stage: stage || 'Applied',
      appliedAt: appliedAt || new Date(),
    });

    const populated = await candidate.populate('job', 'title department status');
    res.status(201).json({ success: true, data: populated, message: 'Candidate created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
const updateCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, skills, experience, job, stage, appliedAt } = req.body;

    // Check email uniqueness if email is being changed
    if (email) {
      const existing = await Candidate.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A candidate with this email already exists' });
      }
    }

    // Validate job if provided
    if (job) {
      const jobDoc = await Job.findById(job);
      if (!jobDoc) {
        return res.status(404).json({ success: false, message: 'Referenced job not found' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (experience !== undefined) updateData.experience = experience;
    if (job !== undefined) updateData.job = job || null;
    if (stage !== undefined) updateData.stage = stage;
    if (appliedAt !== undefined) updateData.appliedAt = appliedAt;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('job', 'title department status');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, data: candidate, message: 'Candidate updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate stage only
// @route   PATCH /api/candidates/:id/stage
const updateCandidateStage = async (req, res, next) => {
  try {
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, message: 'Stage is required' });
    }
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}`,
      });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { stage },
      { new: true, runValidators: true }
    ).populate('job', 'title department status');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, data: candidate, message: `Stage updated to ${stage}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  updateCandidateStage,
  deleteCandidate,
};
