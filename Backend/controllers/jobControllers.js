const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {
    const { company, position, status } = req.body;

    const job = await Job.create({
      company,
      position,
      status,
      user: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      user: req.user.id,
    });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "job not found",
      });
    }

    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Job Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getJobsStats = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id });

    const stats = {
      total: jobs.length,
      applied: jobs.filter((job) => job.status === "Applied").length,
      interview: jobs.filter((job) => job.status === "Interview").length,
      offer: jobs.filter((job) => job.status === "Offer").length,
      rejected: jobs.filter((job) => job.status === "Rejected").length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobsStats,
};
