import "./App.css";
import { Routes, Route } from "react-router-dom";
import EchoHome from "@/components/Echo/EchoHome";
import Navbar from "@/components/Navbar";
import EchoController from "@/components/Echo/EchoController";
import EchoCreate from "@/components/Echo/EchoCreate";
import JoinWithSuspense from "@/components/Echo/EchoJoin";
import Kicked from "@/components/Echo/Kicked";

function App() {
  return (
    <>
      <Navbar />
      <main className="font-poppins">
        <Routes>
          <Route path="/" element={<EchoHome />} />
          <Route path="/echo/:echoID/" element={<EchoController />} />
          <Route path="/echo/create" element={<EchoCreate />} />
          <Route path="/echo/join" element={<JoinWithSuspense />} />
          <Route path="/kicked" element={<Kicked />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
