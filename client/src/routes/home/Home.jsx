import MachineBar from "../../components/MachineBar";
import styles from "./Home.module.css";
import { useState } from "react";
import { brands, colors } from "../../utils/Schemas";
import {
  MACHINE_CONDITIONS,
  VENDORS,
  FORM_FACTOR,
} from "../../utils/Enums";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { requestJson } from "../../utils/api";

const Home = () => {
  const navigate = useNavigate();
  const [applianceCategory, setApplianceCategory] = useState(""); // category
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    serial: "",
    form_factor: "",
    color: "",
    condition: "",
    vendor: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const renderOptions = (obj) => {
    return Object.entries(obj).map(([value, label], index) => (
      <option value={value} key={index}>
        {label}
      </option>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirm("Submit?")) return;
    try {
      const data = await requestJson(`/api/create/machine`, {
        method: "POST",
        body: { ...formData, category: applianceCategory },
      });
      toast.success(data.message);
      setFormData({
        brand: "",
        model: "",
        serial: "",
        color: "",
        form_factor: "",
        condition: "",
        vendor: "",
      });
      navigate(`/machine/${data.machine_id}`);
    } catch (error) {
      console.error("[ADD MACHINE ERROR]: ", error);
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className={styles.homePageHeader}>
        <MachineBar
          applianceCategory={applianceCategory}
          setApplianceCategory={setApplianceCategory}
        />
      </div>
      <br />
      <hr />
      <form className={styles.machineFormHome} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="model">Model No.</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="serial">Serial No.</label>
          <input
            type="text"
            name="serial"
            value={formData.serial}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="brand">Brand</label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          >
            <option value="">--Select a brand--</option>
            {renderOptions(brands)}
          </select>
        </div>
        <div>
          <label htmlFor="form_factor">Style</label>
          <select
            name="form_factor"
            value={formData.form_factor}
            onChange={handleChange}
            disabled={!applianceCategory}
            required
          >
            <option value="">
              {applianceCategory
                ? "--select a style--"
                : "--select a category first--"}
            </option>
            {renderOptions(FORM_FACTOR(applianceCategory))}
          </select>
        </div>
        <div>
          <label htmlFor="color">Color</label>
          <select name="color" value={formData.color} onChange={handleChange}>
            <option value="">--select a color--</option>
            {renderOptions(colors)}
          </select>
        </div>
        <div>
          <label htmlFor="condition">Condition</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
          >
            <option value="">--select condition--</option>
            {renderOptions(MACHINE_CONDITIONS)}
          </select>
        </div>
        <div>
          <label htmlFor="vendor">Vendor</label>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            required
          >
            <option value="">--select vendor--</option>
            {renderOptions(VENDORS)}
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default Home;
