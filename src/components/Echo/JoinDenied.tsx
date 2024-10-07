import { Icon } from "@iconify/react";

const JoinDenied = () => {
  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Icon icon="line-md:phone-off" className="text-6xl text-main-red mb-5" />
      <h1>Your Join Request has been Denied!</h1>
      <button className="text-main-red" onClick={handleRetry}>
        Retry
      </button>
    </div>
  );
};

export default JoinDenied;
