import { languageType } from "./types";

// get available languages from piston api
const getLanguages = async () => {
  const response = await fetch("https://emkc.org/api/v2/piston/runtimes");
  const languages = await response.json();
  return languages;
};

//run code and get the result
const runCode = async (language: languageType, code: string) => {
  console.log(language, code);

  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: language.language,
      version: language.version,
      files: [
        {
          content: code,
        },
      ],
    }),
  });

  const result = await response.json();
  return result.run;
};

export { getLanguages, runCode };
