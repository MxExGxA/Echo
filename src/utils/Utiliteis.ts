import {
  Admin,
  codeEditorType,
  Member,
  MessageType,
  socketClient,
} from "./types";

export class EchoUtils {
  private members: (Member | Admin)[] = [];
  private messages: MessageType[] = [];
  private editor: codeEditorType | undefined = undefined;
  private id: string = "";
  private adminId: string = "";

  constructor(private socket: socketClient) {
    socket.on("echoCreated", (opts) => {
      this.members = opts.members;
      this.messages = opts.messages;
      this.adminId = opts.members[0].id;
    });

    socket.on("joinRequestApproved", (opts) => {
      this.members = opts.members;
      this.messages = opts.messages;
      this.editor = opts.editor;
      this.adminId = opts.members[0].id;
    });

    socket.on("memberJoined", (opts) => {
      this.members = opts.members;
      this.messages = opts.messages;
    });

    socket.on("memberLeft", (opts) => {
      this.members = opts.members;
      this.messages = opts.messages;
      this.adminId = opts.members.find((member: Admin) => member.isAdmin).id;
    });

    socket.on("makeAdmin", (opts) => {
      this.members = opts.members;
      this.messages = opts.messages;
      this.adminId = opts.members.find((member: Admin) => member.isAdmin).id;
    });
  }

  createEcho(echoID: string, creator: Member): boolean | void {
    try {
      this.id = echoID;
      this.socket.emit("createEcho", { echoID, creator });
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  joinEcho(echoID: string, member: Member): boolean | void {
    try {
      this.id = echoID;
      this.socket.emit("joinEcho", { echoID, member });
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  leaveEcho(): void {
    this.socket.disconnect();
  }

  approveJoinRequest(opts: { echoID: string; member: Member }): boolean | void {
    try {
      this.socket.emit("requestApproved", opts);
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  denyJoinRequest(opts: { echoID: string; member: Member }): boolean | void {
    try {
      this.socket.emit("requestDenied", opts);
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  sendMessage(opts: MessageType): boolean | void {
    try {
      this.socket.emit("echoMessage", opts);
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  listMembers(): Member[] {
    return this.members;
  }

  makeAdmin(echoID: string, member: Member): boolean | void {
    try {
      this.socket.emit("makeAdmin", { echoID, member });
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  kickMember(echoID: string, member: Member): boolean | void {
    try {
      this.socket.emit("kickMember", { echoID, member });
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  get echoID(): string {
    return this.id;
  }

  get adminID(): string {
    return this.adminId;
  }

  get echoSocket(): socketClient {
    {
      return this.socket;
    }
  }

  get messagesHistory(): MessageType[] {
    return this.messages;
  }

  get echoEditor(): codeEditorType | undefined {
    return this.editor;
  }
}
