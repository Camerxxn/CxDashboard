import Link from "next/link";
import style from "./login.module.scss";
import Header from "@/components/header/header";
import ClientLogin from "./clientLogin";
import { getUserData } from "@/api/user";

const LoginPage = async () => {
    const data = await getUserData();

    return (
        <>
            <title>Login</title>
            <Header userData={data}></Header>
            <ClientLogin></ClientLogin>
            <main className={style.container}>
                <section className={style.login}>
                    <h1>Login</h1>
                    {process.env.NEXT_PUBLIC_GITHUB_OAUTH !== undefined &&
                        <Link href={`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.NEXT_PUBLIC_GITHUB_OAUTH}`}>Login with Github</Link>
                    }
                    {process.env.NEXT_PUBLIC_DISCORD_OAUTH !== undefined &&
                        <Link href={process.env.NEXT_PUBLIC_DISCORD_OAUTH}>Login with Discord</Link>
                    }
                </section>
            </main>
        </>
    );
}

export default LoginPage;
