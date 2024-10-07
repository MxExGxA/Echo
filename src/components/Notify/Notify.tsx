import { useEffect, useRef } from "react";

const Notify = ({
  notify,
  setNotify,
}: {
  notify: { message: string; type: string };
  setNotify: Function;
}) => {
  const notifyElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notify.message) {
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 2000);
    }
  }, [notify]);

  return (
    <>
      {notify.message ? (
        <div
          ref={notifyElementRef}
          className="bg-gray-200 rounded-full absolute bottom-10 py-2 px-5 text-sm pointer-events-none overflow-hidden !z-50"
        >
          <div
            className={`absolute top-0 left-0 w-full h-full  notify-anime ${
              notify.type === "error"
                ? "bg-red-200"
                : notify.type === "success"
                ? "bg-green-200"
                : "bg-blue-200"
            }`}
          ></div>
          <h1 className="relative">{notify.message}</h1>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Notify;
