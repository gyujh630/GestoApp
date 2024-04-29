import App from "@renderer/App";
import RenderPdf from "@renderer/pages/RenderPdf";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";

const Router = () => {
    return (
      <BrowserRouter>
      <div className="full">
          <NavBar></NavBar>
          <div className="body">
          <Routes>
            <Route path="/" element={<App/>} />
            <Route path="/RenderPdf" element={<RenderPdf/>}/>
          </Routes>
          </div>
      </div>
      </BrowserRouter>
    );
  };

export default Router