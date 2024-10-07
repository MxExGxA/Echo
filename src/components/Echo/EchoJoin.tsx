import Button from "@/components/Buttons/Button";
import EchoCover from "@/components/Echo/EchoCover";
import TextInput from "@/components/inputs/TextInput";
import MediaSetup from "@/components/setup/MediaSetup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import validator from "validator";

const EchoJoin = () => {
  const [echoID, setEchoID] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [media, setMedia] = useState<{ camera: boolean; mic: boolean }>({
    camera: false,
    mic: false,
  });
  const [valid, setValid] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [queries] = useSearchParams();
  const invitation: string = queries.get("invitation") as string;

  const handleJoinEcho = (): void => {
    if (echoID && username && valid) {
      setLoading(true);
      navigate(
        `/echo/${echoID}?action=join&name=${username}&camera=${media.camera}&mic=${media.mic}`
      );
    }
  };

  const validateUserName = (value: string) => {
    const trimmedUsername = value.trim();
    const length = validator.isLength(trimmedUsername, { min: 3, max: 20 });
    setValid(length);
    return length;
  };

  useEffect(() => {
    const validate = validateUserName(username);
    if (username.length !== 0) {
      if (!validate) {
        setError("username Length must be between 3 to 20");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  }, [username]);

  useEffect(() => {
    if (invitation) {
      setEchoID(invitation);
    }
  }, [queries]);

  return (
    <EchoCover>
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <h1 className="text-2xl text-main-blue my-10">Join Echo</h1>
        <MediaSetup name={username} setMedia={setMedia} />
        <div className="flex flex-col">
          <TextInput
            placeholder="Enter echo id"
            value={echoID}
            onChange={(e) => setEchoID(e.target.value)}
            readOnly={invitation ? true : false}
          />
          <TextInput
            error={error}
            placeholder="Enter user name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            text={"Join"}
            type={"primary"}
            onClick={handleJoinEcho}
            loading={loading}
          />
        </div>
      </div>
    </EchoCover>
  );
};

const JoinWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <EchoJoin />
  </Suspense>
);

export default JoinWithSuspense;
