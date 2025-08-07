import React, { useState } from "react";
import axios from "axios";

const merchantOptions = [
  { name: "Amazon", value: 0 },
  { name: "Walmart", value: 1 },
  { name: "Target", value: 2 },
  { name: "BestBuy", value: 3 },
  { name: "Starbucks", value: 4 }
];

const categoryOptions = [
  { name: "Grocery", value: 0 },
  { name: "Electronics", value: 1 },
  { name: "Clothing", value: 2 },
  { name: "Travel", value: 3 },
  { name: "Personal Care", value: 4 }
];

const UserView = ({ cc_num, auth, name }) => {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState(merchantOptions[0].value);
  const [category, setCategory] = useState(categoryOptions[0].value);
  const [hour12, setHour12] = useState(12);
  const [ampm, setAmpm] = useState("PM");
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const day_of_week = now.getDay();
    let hour_of_day = hour12 % 12;
    if (ampm === "PM") hour_of_day += 12;

    const payload = {
      cc_num,
      amt: parseFloat(amount),
      lat: 40.7128,
      long: -74.006,
      city_pop: 8000000,
      merch_lat: 40.7306,
      merch_long: -73.9352,
      age: 35,
      hour_of_day,
      day_of_week,
      merchant_index: merchant,
      category_index: category
    };

    try {
      const res = await axios.post("http://localhost:8000/predict", payload, {
        auth: { username: auth.username, password: auth.password }
      });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      alert("Error submitting transaction");
    }
  };

  return (
    <div className="user-container">
      <h2 className="welcome">Welcome, {name}</h2>
      <p className="cc-num">CC Num: {cc_num}</p>
      <div className="card">
        <h3>Submit Transaction</h3>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="number"
            placeholder="Transaction Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="flex-row">
            <select value={merchant} onChange={(e) => setMerchant(Number(e.target.value))}>
              {merchantOptions.map((m, idx) => (
                <option key={idx} value={m.value}>{m.name}</option>
              ))}
            </select>

            <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
              {categoryOptions.map((c, idx) => (
                <option key={idx} value={c.value}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-row">
            <select value={hour12} onChange={(e) => setHour12(Number(e.target.value))}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>

            <div className="ampm-toggle">
              <button
                type="button"
                className={ampm === "AM" ? "active" : ""}
                onClick={() => setAmpm("AM")}
              >
                AM
              </button>
              <button
                type="button"
                className={ampm === "PM" ? "active" : ""}
                onClick={() => setAmpm("PM")}
              >
                PM
              </button>
            </div>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default UserView;
