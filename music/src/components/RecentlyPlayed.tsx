import { Play } from "lucide-react";
import Image from "next/image";

const RecentlyPlayed = () => {
  return (
    <div>
      <h2 className="text-3xl kor mb-4 text-amber-200/90">최근 재생된 음악</h2>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="group relative bg-black/40 rounded-lg p-3">
            <div className="relative">
              <Image
                src={`https://picsum.photos/200/200?random=${item}`}
                alt="Album cover"
                width={200}
                height={200}
                className="w-full aspect-square object-cover rounded-lg"
                priority={true}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
              <button className="absolute bottom-2 right-2 p-3 bg-amber-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={20} fill="white" />
              </button>
            </div>
            <h3 className="font-medium mt-2 text-amber-50">노래 제목</h3>
            <p className="text-sm text-amber-200/60">가수</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayed;
