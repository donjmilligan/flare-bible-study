import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import OldTestamentJesus1 from "./components/oldtestamentjesus1/OldTestamentJesus1";
import Dashboard from "./components/dashboard/Dashboard";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jesus1" element={<OldTestamentJesus1 />} />
      </Routes>
    </Layout>
  );
}

export default App;
