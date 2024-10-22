import { useState } from "react";
import { FaCode } from "react-icons/fa";
import CodeEditor from "../CodeEditor/CodeEditor";
import { EchoUtils } from "@/utils/Utiliteis";
import Call from "../Calls/Call.tsx";
import ToggleButton from "../Buttons/ToggleButton";

const DynamicLayout = ({ echoUtils }: { echoUtils: EchoUtils }) => {
  const [toggleEditor, setToggleEditor] = useState<boolean>(false);

  const handleToggleCodeEditor = () => {
    setToggleEditor(!toggleEditor);
  };

  return (
    <div className="h-screen max-h-screen w-screen relative grid grid-cols-12 grid-rows-12 gap-5">
      <CodeEditor echoUtils={echoUtils} toggle={toggleEditor} />
      <ToggleButton
        toggle={toggleEditor}
        icon={<FaCode />}
        onClick={handleToggleCodeEditor}
        bottom={166}
        className="max-md:hidden"
      />
      <Call echoUtils={echoUtils} editorToggled={toggleEditor} />
    </div>
  );
};

export default DynamicLayout;
