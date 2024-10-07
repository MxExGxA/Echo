import { Socket } from "socket.io-client";
import { EchoUtils } from "./Utiliteis";

export interface Member {
  name: string;
  id: string;
}

export interface Admin extends Member {
  isAdmin: boolean;
}

export interface MessageType {
  type: string;
  fromID: string;
  fromName: string;
  message: string;
}

export interface joinRequest {
  member: Member;
  echoID: string;
  echoUtils: EchoUtils;
}

export type socketClient = Socket;

export type echoProps = {
  params: {
    echoID: string;
  };
};

export type requestDialogProps = {
  name: string;
  echoUtils: EchoUtils;
};

export type layoutType = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

export type languageType = {
  language: string;
  version: string;
};

export type codeEditorType = {
  language: { language: string; version: string };
  code: string;
};

export type mediaType = {
  camera: { id: string | undefined; toggle: boolean };
  screen: { id: string | undefined; toggle: boolean };
  mic: { id: string | undefined; toggle: boolean };
};

export type statusType = {
  joined?: boolean;
  denied?: boolean;
  notExist?: boolean;
  created?: boolean;
  echoExist?: boolean;
  timedOut?: boolean;
  invalidData?: boolean;
  echoIsFull?: boolean;
};
