import { Routes, Route } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import PhotoDetail from "./pages/PhotoDetail";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/photos/:id" element={<PhotoDetail />} />
      </Routes>
    </>
  );
}

export default App;
