import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
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
  const chalk = "var(--chalk)";
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

function Layout() {
  const { data: home } = useFetch("/api/home");
  return (
    <>
      <FieldLines />
      <Nav hero={home?.hero} />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/teams", element: <Teams /> },
      { path: "/teams/:id", element: <TeamProfile /> },
      { path: "/players/:id", element: <Player /> },
      { path: "/bracket", element: <Bracket /> },
      { path: "/leaders", element: <Leaders /> },
      { path: "*", element: <ErrorBox error={new Error("404")} /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
