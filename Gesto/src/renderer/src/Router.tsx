import App from "@renderer/App";
import RenderPdf from "@renderer/pages/RenderPdf";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Presentation from "./pages/Presentation";
import PreparePresentation from "./pages/PreparePresentation";
import RecognizeGesture from "./pages/RecognizeGesture";

const Router = () => {
    return (
      <BrowserRouter>
      <div className="full">
          <NavBar></NavBar>
          <div className="body">
          <Routes>
            <Route path="/" element={<App/>} />
            <Route path="/RenderPdf" element={<RenderPdf/>}/>
            <Route path="/Presentation" element={<Presentation/>}/>
            <Route path="/PreparePresentation" element={<PreparePresentation/>}/>
            <Route path="/RecognizeGesture" element={<RecognizeGesture/>}/>
          </Routes>
          </div>
      </div>
      </BrowserRouter>
    );
  };

export default Router