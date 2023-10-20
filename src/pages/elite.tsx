import FullPage from "../components/FullPage";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

function getRanking() {
  return axios
    .get<{
      classicScore: {
        name: string | null;
        classicScore: number;
      }[];
      journeyScore: {
        name: string | null;
        journeyScore: number;
      }[];
    }>("/api/score")
    .then(res => res.data);
}

const Elite = () => {
  const [classicScore, setClassicScore] = useState<{ name: string | null; classicScore: number }[]>(
    [],
  );
  const [journeyScore, setJourneyScore] = useState<{ name: string | null; journeyScore: number }[]>(
    [],
  );

  const session = useSession();

  useEffect(() => {
    getRanking().then(({ classicScore, journeyScore }) => {
      setClassicScore(classicScore);
      setJourneyScore(journeyScore);
    });
  }, []);

  return (
    <FullPage>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-3xl font-bold">Elite</h1>
        <div className="flex flex-row items-center justify-center w-full h-full">
          <div className="flex flex-col items-center w-1/2 h-full">
            <h2 className="text-2xl font-bold">Classic</h2>
            <table className="table-auto w-4/5 text-white rounded-lg mt-4">
              <thead className="bg-[#421856] border-2 border-[#421856] rounded">
                <tr>
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {classicScore.map(({ name, classicScore }, index) => (
                  <tr
                    key={index}
                    className={cn({
                      "bg-yellow-400 text-black": session.data?.user?.name === name,
                    })}
                  >
                    <td className="border-2 border-[#421856] px-4 py-2">{index + 1}</td>
                    <td className="border-2 border-[#421856] px-4 py-2">{name || "Anonymous"}</td>
                    <td className="border-2 border-[#421856] px-4 py-2">{classicScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center w-1/2 h-full">
            <h2 className="text-2xl font-bold">Journey</h2>
            <table className="table-auto w-4/5 text-white rounded-lg mt-4">
              <thead className="bg-[#421856] border-2 border-[#421856] rounded">
                <tr>
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {journeyScore.map(({ name, journeyScore }, index) => (
                  <tr
                    key={index}
                    className={cn({
                      "bg-yellow-400 text-black": session.data?.user?.name === name,
                    })}
                  >
                    <td className="border-2 border-[#421856] px-4 py-2">{index + 1}</td>
                    <td className="border-2 border-[#421856] px-4 py-2">{name || "Anonymous"}</td>
                    <td className="border-2 border-[#421856] px-4 py-2">{journeyScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default Elite;
