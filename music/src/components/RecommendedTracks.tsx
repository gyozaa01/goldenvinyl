import Image from "next/image";

const RecommendedTracks = () => {
  return (
    <div>
      <h2 className="text-3xl kor mt-2 mb-4 text-amber-200/90">추천 음악</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex-shrink-0 w-44">
            <Image
              src={`https://picsum.photos/200/200?random=${item + 4}`}
              alt="Album cover"
              width={200}
              height={200}
              className="w-full aspect-square object-cover rounded-lg mb-2"
            />
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
