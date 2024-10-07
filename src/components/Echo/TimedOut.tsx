const TimedOut = () => {
  const handleRetry = (): void => {
    window.location.reload();
  };
  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Echo joining request timed out.</h1>
      <button className="text-main-red" onClick={handleRetry}>
        Retry?
      </button>
    </div>
  );
};
export default TimedOut;
