import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import OldTestamentJesus1 from "./components/oldtestamentjesus1/OldTestamentJesus1";
import OldTestamentJesus2 from "./components/oldtestamentjesus2/OldTestamentJesus2";
import MessageofHope from "./components/messageofhope/MessageofHope";
import Dashboard from "./components/dashboard/Dashboard";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jesus1" element={<OldTestamentJesus1 />} />
        <Route path="/jesus2" element={<OldTestamentJesus2 />} />
        <Route path="/messageofhope" element={<MessageofHope />} />
      </Routes>
    </Layout>
  );
}

export default App;
