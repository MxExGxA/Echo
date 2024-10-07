const Loader = ({ action }: { action: string }) => {
  return (
    <div className="flex justify-center items-center">
      <span className="loader rotate-90"></span>
      <h1 className="text-2xl ml-5 text-main-blue">
        {action === "join" ? "Joining" : "Creating"}
      </h1>
    </div>
  );
};

export default Loader;
