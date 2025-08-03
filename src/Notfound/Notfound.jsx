import { useNavigate } from "react-router-dom";

const Notfound = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen min-w-screen flex justify-center items-center flex-col">
      {" "}
      <div className="h-[20rem] w-[40rem] borderborder-black block">
        <img src="./404.gif" alt="404" className="object-cover h-full w-full" />
      </div>
      <h2 className="text-green-600 text-2xl font-bold">404 Page Not Found</h2>
      <button
        onClick={() => {
          navigate("/");
        }}
        className="mt-5 p-0 outline-none border-none text-green-600"
        style={{ backgroundColor: "white" }}
      >
        Go to Home Page
      </button>
    </div>
  );
};

export default Notfound;
