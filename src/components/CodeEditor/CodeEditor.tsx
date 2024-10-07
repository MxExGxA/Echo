import { getLanguages, runCode } from "@/utils/apiFunctions";
import { languageType } from "@/utils/types";
import { Editor } from "@monaco-editor/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { EchoUtils } from "@/utils/Utiliteis";
const CodeEditor = ({
  echoUtils,
  toggle,
}: {
  echoUtils: EchoUtils;
  toggle: boolean;
}) => {
  const [language, setLanguage] = useState<{
    language: string;
    version: string;
  }>();

  const [languages, setLanguages] = useState<
    { language: string; version: string }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorValue, setEditorValue] = useState<string>("");
  const [compiledVal, setCompiledVal] = useState<{
    state: string;
    value: string;
  }>({ state: "idle", value: "code result will show here" });
  const [canRun, setCanRun] = useState<boolean>();

  const additionalLanguages: languageType[] = [
    {
      language: "html",
      version: "5",
    },
    { language: "css", version: "3" },
  ];

  const handleExecuteCode = (): void => {
    if (canRun) {
      setCompiledVal({ state: "idle", value: "Executing..." });
      runCode(language as languageType, editorValue)
        .then((res) => {
          setCompiledVal({
            state: res.code === 0 ? "success" : "error",
            value: res.code === 0 ? res.stdout : res.stderr,
          });
        })
        .catch((err: Error) =>
          setCompiledVal({ state: "error", value: err.message })
        );
    }
  };

  const handleEditorCodeChange = (value: string | undefined): void => {
    setEditorValue(value as string);
    echoUtils.echoSocket.emit("editorCodeChanged", {
      value,
      echoID: echoUtils.echoID,
    });
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setLanguage({
      language: e.target.value.split(" ")[0],
      version: e.target.value.split(" ")[1],
    });
    echoUtils.echoSocket.emit("editorLangChanged", {
      language: {
        language: e.target.value.split(" ")[0],
        version: e.target.value.split(" ")[1],
      },
      echoID: echoUtils.echoID,
    });
  };

  useEffect(() => {
    setLanguages(additionalLanguages);

    getLanguages().then((l) => {
      setLanguages((prev) => [...prev, ...l]);
    });

    //on change code editor language
    echoUtils.echoSocket.on("editorLangChanged", (opts: languageType): void => {
      setLanguage(opts);
    });

    //on change code editor value
    echoUtils.echoSocket.on("editorCodeChanged", (opts: string): void => {
      setEditorValue(opts);
    });
  }, []);
  useEffect(() => {
    if (echoUtils.echoEditor) {
      setEditorValue(echoUtils.echoEditor.code);
      setLanguage(echoUtils.echoEditor.language);
    } else {
      setLanguage(languages.find((lang) => lang.language === "javascript"));
    }
  }, [languages]);

  useEffect(() => {
    if (language?.language === "html" || language?.language === "css") {
      setCanRun(false);
    } else {
      setCanRun(true);
    }
  }, [language]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg h-full flex flex-col items-center bg-gray-100 p-5 shadow-md border transition-all duration-300 z-10 max-md:hidden`}
      style={{
        gridColumnStart: 1,
        gridColumnEnd: 7,
        gridRowStart: 1,
        gridRowEnd: 13,
        translate: toggle
          ? 0
          : containerRef.current?.clientWidth &&
            -containerRef.current.clientWidth - 50,
        opacity: toggle ? 1 : 0,
      }}
    >
      <div className="language w-full flex justify-between pb-5">
        <div className="flex items-center">
          <p className="mr-2 font-bold text-gray-700">language</p>
          {languages.length ? (
            <select
              value={language?.language + " " + language?.version}
              onChange={handleLanguageChange}
              className="outline-none w-40 border *:!w-40 bg-transparent text-sm cursor-pointer"
            >
              {languages.map((lang, index) => (
                <option key={index} value={`${lang.language} ${lang.version}`}>
                  {lang.language} {lang.version}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
        </div>
        <div>
          <button
            className={`${
              canRun ? "bg-main-blue" : "bg-gray-300"
            } text-white px-3 py-1 rounded-md`}
            onClick={handleExecuteCode}
            disabled={!canRun}
          >
            Run
          </button>
        </div>
      </div>
      <PanelGroup direction="vertical">
        <Panel order={1} minSize={25} defaultSize={75}>
          <Editor
            value={editorValue}
            onChange={handleEditorCodeChange}
            language={language?.language}
            theme="vs-dark"
          />
        </Panel>
        <PanelResizeHandle className="w-full h-[1px] bg-main-blue my-5" />
        <Panel order={2} minSize={25} defaultSize={25} className="relative">
          <div
            className={`rounded-lg border h-full w-full p-5 ${
              compiledVal.state === "error"
                ? "bg-red-100"
                : compiledVal.state === "success"
                ? "bg-green-100"
                : ""
            }`}
          >
            {compiledVal.value ? compiledVal.value : "no output"}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default CodeEditor;
