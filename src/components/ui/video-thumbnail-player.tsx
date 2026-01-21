import * as React from "react";
import { cn } from "../../utils/cn";
import { Play, X } from "lucide-react";

// Interface for component props
interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
    thumbnailUrl: string;
    videoUrl: string;
    title: string;
    description?: string;
    aspectRatio?: "16/9" | "4/3" | "1/1";
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
    (
        {
            className,
            thumbnailUrl,
            videoUrl,
            title,
            description,
            aspectRatio = "16/9",
            ...props
        },
        ref
    ) => {
        // State to manage the visibility of the video modal
        const [isModalOpen, setIsModalOpen] = React.useState(false);

        // Effect to handle the 'Escape' key press for closing the modal
        React.useEffect(() => {
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setIsModalOpen(false);
                }
            };
            window.addEventListener("keydown", handleEsc);
            return () => {
                window.removeEventListener("keydown", handleEsc);
            };
        }, []);

        // Prevent body scroll when modal is open
        React.useEffect(() => {
            if (isModalOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }, [isModalOpen]);


        return (
            <>
                <div
                    ref={ref}
                    className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-lg shadow-lg bg-zinc-900 border border-zinc-800",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        className
                    )}
                    style={{ aspectRatio: aspectRatio.replace('/', '/') }}
                    onClick={() => setIsModalOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
                    tabIndex={0}
                    aria-label={`Play video: ${title}`}
                    {...props}
                >
                    {/* Thumbnail Image */}
                    <img
                        src={thumbnailUrl}
                        alt={`Thumbnail for ${title}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play Button */}
                    {/* Play Button / Brand Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            {/* Brand Logo */}
                            <img
                                src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"
                                alt="Play"
                                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl opacity-90 group-hover:opacity-100" // Logo transparency
                            />
                            {/* Play Icon Centered on Logo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-8 h-8 md:w-10 md:h-10 fill-white text-white drop-shadow-lg opacity-90" />
                            </div>
                        </div>
                    </div>

                    {/* Title and Description */}
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <div className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded inline-block mb-2 tracking-widest">
                            ASSISTA AGORA
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-2 mb-1">{title}</h3>
                        {description && (
                            <p className="text-sm text-zinc-300 line-clamp-1">{description}</p>
                        )}
                    </div>
                </div>

                {/* Video Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-[99999] flex animate-in fade-in-0 items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
                        aria-modal="true"
                        role="dialog"
                        onClick={() => setIsModalOpen(false)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 z-50 rounded-full bg-zinc-800/50 p-3 text-white transition-colors hover:bg-red-600 border border-white/10"
                            aria-label="Close video player"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Video Iframe */}
                        <div className="w-full h-full max-h-[85vh] max-w-7xl flex items-center justify-center relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                            <iframe
                                src={videoUrl}
                                title={title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                )}
            </>
        );
    }
);
VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
