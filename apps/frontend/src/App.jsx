import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";

import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}

export default App;
