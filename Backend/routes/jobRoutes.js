const express = require("express");

const router = express.Router();

const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobsStats,
} = require("../controllers/jobControllers");

const protect  = require("../middleware/authMiddleware");

router.route("/").post(protect, createJob).get(protect, getJobs);

router.get("/stats", protect, getJobsStats);

router.route("/:id").put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
