import { useEffect, useState } from "react";
import { getJobs, deleteJob } from "../services/JobService";
import AddJobForm from "../components/AddJobForm";
import EditJobForm from "../components/EditJobForm";
import { getJobsStats } from "../services/JobService";
import JobStatusChart from "../components/JobStatusChart";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

import "../styles/pages/Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 5;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const statsData = await getJobsStats();
      setStats(statsData);
      const data = await getJobs();
      
      setJobs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job application?",
    );

    if (!confirmDelete) return;

    try {
      await deleteJob(id);

      const remainingJobs = jobs.filter((job) => job._id !== id);

      const remainingPages = Math.max(
        1,
        Math.ceil(remainingJobs.length / jobsPerPage),
      );

      if (currentPage > remainingPages) {
        setCurrentPage(remainingPages);
      }

      toast.success("Job Application removed successfully!");

      fetchJobs();
    } catch (error) {
      console.error("Delete Error:", error);
      console.error("Responses:", error.response?.data);

      toast.error(
        error.response?.data?.message || "Failed to remove job application.",
      );
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully!");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader size={50} />
        <h2>Loading Applications...</h2>
      </div>
    );
  }

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch = job.company
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.dateApplied) - new Date(a.dateApplied);
        case "oldest":
          return new Date(a.dateApplied) - new Date(b.dateApplied);
        case "az":
          return a.company.localeCompare(b.company);
        case "za":
          return b.company.localeCompare(a.company);
        default:
          return 0;
      }
    });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));

  const exportToCSV = () => {
    const headers = ["Company", "Position", "Status", "Date Applied"];

    const rows = jobs.map((job) => [
      job.company,
      job.position,
      job.status,
      new Date(job.dateApplied).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "job_applications.csv");
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>💼 Job Tracker</h1>
          <p>Track and manage your job applications</p>
        </div>

        <div className="nav-right">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>

            <span>{user?.name}</span>
          </div>

          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            Add Application
          </button>

          <button className="export-btn" onClick={exportToCSV}>
            Export CSV
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <JobStatusChart stats={stats} />

      <div className="stats-container">
        <div className="stat-card">
          <h3>📊 Total Applications</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>📄 Applied</h3>
          <p>{stats.applied}</p>
        </div>
        <div className="stat-card">
          <h3>🎯 Interview</h3>
          <p>{stats.interview}</p>
        </div>
        <div className="stat-card">
          <h3>🎉 Offer</h3>
          <p>{stats.offer}</p>
        </div>
        <div className="stat-card">
          <h3>❌ Rejected</h3>
          <p>{stats.rejected}</p>
        </div>
      </div>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by company..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
          }}
          className="filter-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Company A - Z</option>
          <option value="za">Company Z - A</option>
        </select>
      </div>

      <p className="results-count">
        Showing {filteredJobs.length} application
        {filteredJobs.length !== 1 ? "s" : ""}
      </p>

      {editingJob && (
        <div className="modal-overlay" onClick={() => setEditingJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setEditingJob(null)}
            >
              ✕
            </button>

            <h2 className="modal-title">Edit Application</h2>

            <EditJobForm
              job={editingJob}
              onJobUpdated={() => {
                fetchJobs();

                setSearchTerm("");
                setCurrentPage(1);

                setEditingJob(null);
              }}
              onCancel={() => setEditingJob(null)}
            />
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowAddModal(false)}
            >
              ✕
            </button>

            <h2 className="modal-title">Add New Application</h2>

            <AddJobForm
              onJobAdded={() => {
                fetchJobs();

                setSearchTerm("");
                setCurrentPage(1);

                setShowAddModal(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="table-section">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Modify</th>
              <th>Remove</th>
            </tr>
          </thead>

          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  📂 No applications available
                </td>
              </tr>
            ) : (
              currentJobs.map((job) => {
                return (
                  <tr key={job._id}>
                    <td>{job.company}</td>
                    <td>{job.position}</td>
                    <td>
                      <span
                        className={`status-badge ${job.status.toLowerCase()}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td>{new Date(job.dateApplied).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingJob(job);
                        }}
                      >
                        Modify
                      </button>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          handleDelete(job._id);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <footer className="dashboard-footer">
        Built with React • Node.js • Express • MongoDB
      </footer>
    </div>
  );
}

export default Dashboard;
