import { cn, type NumberComparisonResult, type TypeComparisonResult } from "../lib/utils";

type Props = {
  children?: React.ReactNode;
  boolean?: boolean;
  number?: NumberComparisonResult;
  type?: TypeComparisonResult;
};

const Tip = ({ boolean, number, type, children }: Props) => {
  return (
    <div
      className={cn("relative w-20 h-24 rounded-lg border-[#421856] border-r-4 border-b-4", {
        "bg-[#4CBB6B]": boolean === true || number?.value === "equal" || type === "completely",
        "bg-[#E3C559]": number?.proximity === "close" || type === "partially",
        "bg-[#9F898F]": boolean === false || number?.proximity === "far" || type === "not",
      })}
    >
      <div className="flex flex-col h-full w-full font-bold items-center p-1 justify-center pb-2">
        {children}
      </div>

      {number !== undefined &&
        number.value !== "equal" &&
        (number.value === "less" ? (
          <div className="absolute left-8 bottom-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black" />
        ) : (
          <div className="absolute left-8 top-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-black" />
        ))}
    </div>
  );
};

export default Tip;
