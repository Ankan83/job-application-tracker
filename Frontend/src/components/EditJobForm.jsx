import { useState } from "react";
import { updateJob } from "../services/JobService";
import { toast } from "react-toastify";
import "../styles/components/EditJobForm.css";

function EditJobForm({ job, onJobUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    company: job.company,
    position: job.position,
    status: job.status,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateJob(job._id, formData);
      toast.success("Job Application updated successfully!");
      onJobUpdated();
    } catch (error) {
      console.error(error);
      console.error("Response:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to update job application. Please try again.",
      );
    }
  };

  return (
    <form className="edit-job-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="company"
        value={formData.company}
        onChange={handleChange}
      />
      <input
        type="text"
        name="position"
        value={formData.position}
        onChange={handleChange}
      />
      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>
      <div className="form-actions">
        <button type="submit">Update</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditJobForm;
