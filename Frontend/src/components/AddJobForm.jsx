import { useState } from "react";
import { createJob } from "../services/JobService";
import { toast } from "react-toastify";
import "../styles/components/AddJobForm.css";

function AddJobForm({ onJobAdded }) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "Applied",
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
      await createJob(formData);

      setFormData({
        company: "",
        position: "",
        status: "Applied",
      });
      toast.success("Job Application added successfully!");
      onJobAdded();
    } catch (error) {
      console.error(error);
      console.error("Response:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to add job application. Please try again.",
      );
    }
  };

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="company"
        placeholder="Company Name"
        value={formData.company}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="position"
        placeholder="Position"
        value={formData.position}
        onChange={handleChange}
        required
      />
      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>
      <button type="submit">Save Application</button>
    </form>
  );
}

export default AddJobForm;
