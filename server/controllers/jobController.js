const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// @desc    Get all jobs
// @route   GET /api/jobs
const getJobs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Attach candidate count per job
    const jobIds = jobs.map((j) => j._id);
    const counts = await Candidate.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const jobsWithCount = jobs.map((j) => ({
      ...j.toObject(),
      candidateCount: countMap[j._id.toString()] || 0,
    }));

    res.json({ success: true, data: jobsWithCount, count: jobsWithCount.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    const { title, department, location, employmentType, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Job title is required' });
    }

    const job = await Job.create({ title, department, location, employmentType, description, status });
    res.status(201).json({ success: true, data: job, message: 'Job created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const { title, department, location, employmentType, description, status } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: 'Job title cannot be empty' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { title, department, location, employmentType, description, status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: job, message: 'Job updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Unlink candidates from this job
    await Candidate.updateMany({ job: req.params.id }, { $set: { job: null } });
    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };
