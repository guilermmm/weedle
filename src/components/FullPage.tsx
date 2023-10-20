import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

const FullPage = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-[#FD1B54] h-20 border-b-[20px] border-[#421856] w-full grid grid-cols-3">
        <div className="flex">
          <div className="pl-4 flex items-center">
            <Image src="/button_big.png" alt="Botão principal" width={48} height={48} />
          </div>
          <Link className="pl-4 flex items-center" href={"/classic"}>
            <Image src="/button_red.png" alt="Botão vermelho" width={20} height={20} />
            <div className="font-bold pl-1">Classic</div>
          </Link>
          <Link className="pl-4 flex items-center" href={"/journey"}>
            <Image src="/button_yellow.png" alt="Botão amarelo" width={20} height={20} />
            <div className="font-bold pl-1">Journey</div>
          </Link>
          <Link className="pl-4 flex items-center" href={"/elite"}>
            <Image src="/button_green.png" alt="Botão verde" width={20} height={20} />
            <div className="font-bold pl-1">Elite</div>
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <div>
            <Image width={48} height={48} src="/weedle_head.png" alt="weedle head" />
          </div>
          <div>
            <Image width={96} height={48} src="/weedle_name.png" alt="weedle" />
          </div>
        </div>
        <div className="flex items-center justify-end pr-4">
          {session.data ? (
            <div className="font-bold">{session.data?.user?.name}</div>
          ) : (
            <button onClick={() => signIn("google")}>Login</button>
          )}
          <button onClick={() => signOut()}>
            <Image width={48} height={48} src={"/pokemon_trainer.png"} alt="pokemon trainer" />
          </button>
        </div>
      </nav>
      <div className="border-b-4 border-x-4 border-[#421856] rounded-b-xl mx-5 mb-5 pt-5 flex flex-col items-center grow">
        {children}
      </div>
    </div>
  );
};

export default FullPage;
