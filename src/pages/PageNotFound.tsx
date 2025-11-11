import { Button } from "../components/ui/button";
import PNFImage from "../assets/images/page-not-found.png";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2 justify-center">
        <img src={PNFImage} alt="Page Not found illustration" />
        <h1 className="text-4xl font-semibold text-[#1A1A1A]">
          Oops! page not found
        </h1>
        <p className="text-[#808080]">
          We are sorry, the page you requested could not be found. It may have
          been moved or deleted.
        </p>
        <Button
          className="bg-[#CC5500] rounded-full h-12 px-8 font-semibold mt-5 hover:bg-[#CC5500]/90"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
