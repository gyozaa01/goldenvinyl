import { Play, Pause } from "lucide-react";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  size?: number; // 아이콘 크기
  btnSize?: string;
  className?: string;
}

const PlayPauseButton = ({
  isPlaying,
  onClick,
  size = 24,
  btnSize = "w-12 h-12",
  className = "rounded-full bg-amber-600/90 flex items-center justify-center",
}: PlayPauseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${btnSize} ${className} focus:outline-none`}
    >
      {isPlaying ? <Pause size={size} /> : <Play size={size} />}
    </button>
  );
};

export default PlayPauseButton;
