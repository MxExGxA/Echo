import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import MediaSetup from "@/components/setup/MediaSetup";
import EchoCover from "@/components/Echo/EchoCover";
import Button from "@/components/Buttons/Button";
import validator from "validator";

const EchoCreate = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [media, setMedia] = useState<{ camera: boolean; mic: boolean }>({
    camera: false,
    mic: false,
  });
  const [valid, setValid] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const handleCreateEcho = () => {
    if (valid) {
      setLoading(true);
      const echoID: string = uuid();
      navigate(
        `/echo/${echoID}?action=create&name=${username.trim()}&camera=${
          media.camera
        }&mic=${media.mic}`
      );
    } else {
      setError("username Length must be between 3 to 20");
    }
  };

  const handleUserName = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
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

  return (
    <EchoCover>
      <div className="relative h-screen w-full flex flex-col items-center justify-center">
        <h1 className="text-2xl text-main-blue my-10">Create new Echo</h1>
        <MediaSetup name={username} setMedia={setMedia} />
        <div className="flex flex-col">
          <TextInput
            placeholder="Enter user name"
            onChange={handleUserName}
            value={username}
            error={error}
          />
          <Button
            text={"Create"}
            type="primary"
            onClick={handleCreateEcho}
            loading={loading}
          />
        </div>
      </div>
    </EchoCover>
  );
};

export default EchoCreate;
