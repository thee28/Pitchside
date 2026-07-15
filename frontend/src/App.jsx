import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Teams from "./pages/Teams";
import TeamProfile from "./pages/TeamProfile";
import Player from "./pages/Player";
import Bracket from "./pages/Bracket";
import Leaders from "./pages/Leaders";
import { ErrorBox } from "./components/Page";
import { useFetch } from "./api";

function FieldLines() {
  const chalk = "#FAFAF7";
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.22 }}>
      <div style={{ position: "absolute", left: 24, right: 24, top: "52%", height: 2, transform: "translateY(-50%)", background: chalk }} />
      <div style={{ position: "absolute", left: "50%", top: "52%", width: 460, height: 460, transform: "translate(-50%,-50%)", border: `2px solid ${chalk}`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: "50%", top: "52%", width: 12, height: 12, transform: "translate(-50%,-50%)", borderRadius: "50%", background: chalk }} />
      <div style={{ position: "absolute", left: -50, bottom: -50, width: 100, height: 100, border: `2px solid ${chalk}`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", right: -50, bottom: -50, width: 100, height: 100, border: `2px solid ${chalk}`, borderRadius: "50%" }} />
    </div>
  );
}

function App() {
  const { data: home } = useFetch("/api/home");

  return (
    <BrowserRouter>
      <FieldLines />
      <Nav hero={home?.hero} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamProfile />} />
        <Route path="/players/:id" element={<Player />} />
        <Route path="/bracket" element={<Bracket />} />
        <Route path="/leaders" element={<Leaders />} />
        <Route path="*" element={<ErrorBox error={new Error("404")} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
