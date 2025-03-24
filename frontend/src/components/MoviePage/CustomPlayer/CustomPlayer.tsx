"use client"
import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import ReactPlayer from "react-player"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
    videoUrl: string
    onError: (err: Error) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onError }) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.5)
    const [isMuted, setIsMuted] = useState(false)
    const [played, setPlayed] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const playerRef = useRef<ReactPlayer>(null)
    const playerContainerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handlePlayPause = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setIsPlaying((prev) => !prev)
        showControlsTemporarily()
    }, [])

    const handleVolumeChange = useCallback((newVolume: number[]) => {
        setVolume(newVolume[0])
        setIsMuted(newVolume[0] === 0)
        showControlsTemporarily()
    }, [])

    const handleToggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMuted((prev) => !prev)
        showControlsTemporarily()
    }, [])

    const handleProgress = useCallback((state: { played: number }) => {
        setPlayed(state.played)
    }, [])

    const handleDuration = useCallback((duration: number) => {
        setDuration(duration)
    }, [])

    const handleSeek = useCallback((time: number[]) => {
        playerRef.current?.seekTo(time[0])
        showControlsTemporarily()
    }, [])

    const handleRewind = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        const currentTime = playerRef.current?.getCurrentTime() || 0
        playerRef.current?.seekTo(Math.max(currentTime - 10, 0))
        showControlsTemporarily()
    }, [])

    const handleFastForward = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            const currentTime = playerRef.current?.getCurrentTime() || 0
            playerRef.current?.seekTo(Math.min(currentTime + 10, duration))
            showControlsTemporarily()
        },
        [duration],
    )

    const toggleFullscreen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
        showControlsTemporarily()
    }, [])

    const adjustVolume = useCallback((direction: "up" | "down") => {
        setVolume((prevVolume) => {
            const newVolume = direction === "up" ? prevVolume + 0.1 : prevVolume - 0.1
            return Math.max(0, Math.min(1, newVolume))
        })
        setIsMuted(false)
        showControlsTemporarily()
    }, [])

    const showControlsTemporarily = useCallback(() => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false)
        }, 1500)
    }, [])

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
                return // Don't handle key events when focus is on textarea or input
            }
            switch (event.code) {
                case "Space":
                    event.preventDefault()
                    handlePlayPause(event as unknown as React.MouseEvent)
                    break
                case "ArrowLeft":
                    handleRewind(event as unknown as React.MouseEvent)
                    break
                case "ArrowRight":
                    handleFastForward(event as unknown as React.MouseEvent)
                    break
                case "ArrowUp":
                    event.preventDefault()
                    adjustVolume("up")
                    break
                case "ArrowDown":
                    event.preventDefault()
                    adjustVolume("down")
                    break
                case "KeyF":
                    toggleFullscreen(event as unknown as React.MouseEvent)
                    break
                default:
                    break
            }
        }
        document.addEventListener("keydown", handleKeyPress)
        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [handlePlayPause, handleRewind, handleFastForward, adjustVolume, toggleFullscreen])

    useEffect(() => {
        showControlsTemporarily()
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [showControlsTemporarily])

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000)
        const mm = date.getUTCMinutes().toString().padStart(2, "0")
        const ss = date.getUTCSeconds().toString().padStart(2, "0")
        return `${mm}:${ss}`
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        showControlsTemporarily()
    }

    return (
        <div
            ref={playerContainerRef}
            className={`relative overflow-hidden ${
                isFullscreen ? "fixed inset-0 z-50 bg-black" : "w-full mx-auto rounded-xl"
            }`}
            onMouseMove={showControlsTemporarily}
            onMouseDown={handleMouseDown}
        >
            <div className={`${isFullscreen ? "h-screen" : "aspect-video"}`}>
                <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    volume={volume}
                    muted={isMuted}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onError={(e: any) => onError(new Error(`Video playback error: ${e}`))}
                />
            </div>
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 space-y-4 transition-opacity duration-300 ${
                    showControls ? "opacity-100" : "opacity-0"
                }`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">{formatTime(played * duration)}</span>
                    <div className="flex-grow relative h-1">
                        <Slider
                            value={[played]}
                            max={1}
                            step={0.001}
                            onValueChange={(value) => handleSeek([value[0] * duration])}
                            className="flex-grow"
                        />
                        <div
                            className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                            style={{ width: `${played * 100}%` }}
                        />
                    </div>
                    <span className="text-white text-sm font-medium">{formatTime(duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handlePlayPause}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                        >
                            {isPlaying ?
                                <Pause className="h-5 w-5" /> :
                                <Play className="h-5 w-5 ml-0.5" />
                            }
                        </Button>
                        <Button
                            onClick={handleRewind}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                        >
                            <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={handleFastForward}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                        >
                            <SkipForward className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={handleToggleMute}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        <div className="w-24 px-2">
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={1}
                                step={0.01}
                                onValueChange={handleVolumeChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={toggleFullscreen}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                    >
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Video info overlay at the top */}
            <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
            }`}>
                <div className="flex items-center">
                    <div className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">HD</div>
                    <div className="text-white/80 text-xs">Playing now</div>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer
