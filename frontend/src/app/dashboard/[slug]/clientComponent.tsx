"use client";

import { NextPage } from "next";
import style from "./server.module.scss";
import { BaseSyntheticEvent, Component, ReactNode, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getCookie } from "@/utils/cookie";
import { useRouter } from "next/navigation";
import { CxSocket } from "@/socket/cxsocket";
import { GarrysMod } from "./garrysmod";
import { Minecraft } from "./minecraft";
import Link from "next/link";

export const SetServerName = (props: {dashID: string}) => {
    const [serverName, setServerName] = useState<string>("");
    const router = useRouter();

    const submit = async (e: BaseSyntheticEvent) => {
        e.preventDefault();
        const req = await axios({
            "method": "POST",
            "url": process.env.NEXT_PUBLIC_DASHBOARD_API + "/integration/changeServerName",
            "data": {
                "dashID": props.dashID,
                "serverName": serverName
            },
            "headers": {
                "authorization": `${getCookie("token")}`
            }
        });

  
        router.refresh();
        window.location.reload();
    }

    return (
        <div className={style.popup}>
            <div className={style.content}>
                <div style={{"textAlign": "center"}}>
                    <h2>Please set a name for this server</h2>
                    <span style={{"opacity": "0.5"}}>(This can be changed later)</span>
                </div>
                <form onSubmit={submit} style={{"display": "flex", "gap": "1rem"}}>
                    <input onChange={(e: BaseSyntheticEvent) => setServerName(e.target.value)} type="text" name="servername" id="servername" placeholder="Server Name" />
                    <input type="submit" value="Set Name" />
                </form>
            </div>
        </div>
    );
}

export class SocketComponent extends Component<any, any> {
    socket = new CxSocket("");

    constructor(props: {dashID: string, id: number, gameType: string, serverInfo: any}) {
        super(props);
        this.socket.dashID = props.dashID;
        this.state = {
            id: props.id,
            online: false,
            gameType: props.gameType,
            serverInfo: props.serverInfo,
            view: <></>,
            customCommand: false, 
            command: ""
        }
    }

    showCustomCommand(showing: boolean = true): void {
        this.setState({"customCommand": showing}); 
    }

    componentDidMount(): void {
        this.socket.events.push(
            {
                "id": "initialConnect",
                "do": (data: any) => {
                    this.socket.send({
                        "id": "clientConnect",
                        "dashID": this.socket.dashID
                    });
                }
            },
            {
                "id": "connectionResponse",
                "do": (data: {id: string, online: boolean}) => {
                    this.setState({online: data.online});
                }
            },
            {
                "id": "updateServerStatus",
                "do": (data: {id: string, online: boolean}) => {
                    this.setState({online: data.online});
                }
            }, 
            {
                "id": "forceExitServer",
                "do": (data: {id: string, reason: string}) => {
                    useRouter().push("/dashboard");
                    if (typeof(window) !== undefined) {
                        window.location.href = "/dashboard";
                    }
                }
            }
        )
        this.socket.connect();
        switch (this.state.gameType) {
            case "gmod":
                this.setState({view: <GarrysMod serverData={this.state.serverInfo} socket={this.socket}></GarrysMod>});
                break;
            case "mc":
                this.setState({view: <Minecraft serverData={this.state.serverInfo} socket={this.socket}></Minecraft>});
                break;
        }
    }

    render(): ReactNode {
  
        if (!this.state.online) {
            return (
                <section style={{"display": "flex", "gap": "2rem", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "width": "100%"}}>
                    <h1 style={{"margin": "0", "fontSize": "4rem", "textAlign": "center"}}>Server currently offline!</h1>
                    <Link style={{"fontSize": "2rem", "fontWeight": "900"}} href={`dashboard/${this.state.id + 1}/config`}>Edit your server</Link>
                </section>
            )
        }

        return (
            <>
                {this.state.customCommand && <>
                    <div className={style.popup} style={{"position": "fixed", "top": "0"}}>
                        <div className={style.command}>
                            <h2>Execute Command</h2>
                            <input type="text" placeholder="Command to execute" onChange={(e: BaseSyntheticEvent) => this.setState({command: e.target.value})} name="command"></input>
                            <button onClick={() => {
                                this.socket.send({
                                    "id": "gameCommand",
                                    "dashID": this.socket.dashID,
                                    "command": this.state.command 
                                });

                                this.showCustomCommand(false);
                            }}>Execute</button>
                            <button onClick={() => this.showCustomCommand(false)}>Cancel</button>
                        </div> 
                    </div> 
                </>}
                <button className={style.commandButton} onClick={() => this.showCustomCommand(true)}>Execute Command</button>
                {this.state.view}
            </>
        );
    }
}

const ServerPageClient: NextPage<{children: any}> = ({children}) => {
    return (
        <>
            {children}
        </>
    );
}

export default ServerPageClient;
