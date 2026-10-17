const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    // Aggregation: count by stage
    const stageCountsAgg = await Candidate.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
        },
      },
    ]);

    // Build stage map
    const stageCounts = {
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0,
    };
    stageCountsAgg.forEach(({ _id, count }) => {
      if (_id in stageCounts) stageCounts[_id] = count;
    });

    // Total candidates
    const totalCandidates = await Candidate.countDocuments();

    // Active applications = not Hired and not Rejected
    const activeApplications = await Candidate.countDocuments({
      stage: { $nin: ['Hired', 'Rejected'] },
    });

    // Jobs stats
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'Open' });

    // Recent candidates (last 10)
    const recentCandidates = await Candidate.find()
      .populate('job', 'title department')
      .sort({ appliedAt: -1 })
      .limit(10)
      .select('name email stage job appliedAt skills experience');

    // Candidates by job (top 5)
    const candidatesByJob = await Candidate.aggregate([
      { $match: { job: { $ne: null } } },
      {
        $group: {
          _id: '$job',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: { path: '$jobInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          jobTitle: '$jobInfo.title',
          department: '$jobInfo.department',
          count: 1,
        },
      },
    ]);

    // Pipeline: stage order data for visualization
    const pipelineData = [
      { stage: 'Applied', count: stageCounts.Applied },
      { stage: 'Screening', count: stageCounts.Screening },
      { stage: 'Interview', count: stageCounts.Interview },
      { stage: 'Offer', count: stageCounts.Offer },
      { stage: 'Hired', count: stageCounts.Hired },
      { stage: 'Rejected', count: stageCounts.Rejected },
    ];

    res.json({
      success: true,
      data: {
        metrics: {
          totalCandidates,
          activeApplications,
          interviewsScheduled: stageCounts.Interview,
          offersMade: stageCounts.Offer,
          hired: stageCounts.Hired,
          rejected: stageCounts.Rejected,
          totalJobs,
          openJobs,
        },
        stageCounts,
        pipelineData,
        recentCandidates,
        candidatesByJob,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
