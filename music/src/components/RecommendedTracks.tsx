import Image from "next/image";
import { Play } from "lucide-react";

const RecommendedTracks: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl kor mt-2 mb-4 text-amber-200/90">추천 음악</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2 scrollbar-hidden">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex-shrink-0 w-44 group relative bg-black/40 rounded-lg p-3"
          >
            <div className="relative">
              <Image
                src={`https://picsum.photos/200/200?random=${item + 4}`}
                alt="Random Album Cover"
                width={200}
                height={200}
                className="w-full aspect-square object-cover rounded-lg"
                priority
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
              <button className="absolute bottom-2 right-2 p-3 bg-amber-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={20} fill="white" />
              </button>
            </div>
            <h3 className="font-medium text-sm text-amber-50">
              노래 제목 {item}
            </h3>
            <p className="text-xs text-amber-200/60">가수</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedTracks;
