import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import OldTestamentJesus1 from "./components/oldtestamentjesus1/OldTestamentJesus1";
import OldTestamentJesus2 from "./components/oldtestamentjesus2/OldTestamentJesus2";
import MessageofHope from "./components/messageofhope/MessageofHope";
import Empires from "./components/empires/Empires";
import Flare from "./components/flare/Flare";
import SignUp from "./components/auth/SignUp";
import Login from "./components/auth/Login";
import WhatIsSpirit from "./components/whatspirit/WhatIsSpirit";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Layout>
            <Flare />
          </Layout>
        }
      />
      <Route
        path="/jesus1"
        element={
          <Layout>
            <OldTestamentJesus1 />
          </Layout>
        }
      />
      <Route
        path="/jesus2"
        element={
          <Layout>
            <OldTestamentJesus2 />
          </Layout>
        }
      />
      <Route
        path="/messageofhope"
        element={
          <Layout>
            <MessageofHope />
          </Layout>
        }
      />
      <Route
        path="/empires"
        element={
          <Layout>
            <Empires />
          </Layout>
        }
      />
      <Route
        path="/whatisspirit"
        element={
          <Layout>
            <WhatIsSpirit />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
