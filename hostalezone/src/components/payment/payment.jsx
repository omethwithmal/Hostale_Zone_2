import React, { useState } from "react";
import axios from "../../api/axios";

function Payment() {
  const [amount, setAmount] = useState("");
  const [studentId, setStudentId] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/payment", {
        studentId,
        amount,
      });

      alert("Payment Successful!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Payment Failed!");
    }
  };

  return (
    <div>
      <h2>Make Payment</h2>
      <form onSubmit={handlePayment}>
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <br />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <br />
        <button type="submit">Pay</button>
      </form>
    </div>
  );
}

export default Payment;