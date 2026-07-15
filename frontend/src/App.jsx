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

function App() {
  const { data: home } = useFetch("/api/home");

  return (
    <BrowserRouter>
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
