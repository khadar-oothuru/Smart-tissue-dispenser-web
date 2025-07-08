import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const SimpleApp = () => {
  console.log("SimpleApp rendered");

  return (
    <Router>
      <div style={{ padding: "20px", backgroundColor: "lightblue" }}>
        <h1>Simple App Test</h1>
        <p>If you can see this, React is working!</p>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/test" element={<div>Test Page</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default SimpleApp;
