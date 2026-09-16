import { useEffect, useRef, useState, useCallback } from 'react';
import { OverlayToaster, Position } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import VideoJSPlayer from '../../components/VideoJSPlayer';
import PlayerControlPanel from '../../components/PlayerControlPanel';
import {
	COMPARISON_CANVAS_ID,
	PLAYER_WRAPPER_ID,
} from '../../constants/appConstants';
import { type VideoQualityType } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import { togglePlayerFullscreen } from '../../utils/playerFullscreen';

interface PlayerViewProps {
	isWithControls: boolean;
	setIsWithControls: (_: boolean) => void;
	handlePlayPause: () => void;
	isPlaying: boolean;
	setPlaying: (playing: boolean) => void;
	setVideoQuality: (_: VideoQualityType) => void;
	videoQuality: VideoQualityType;
	screenSharingSourceType: ScreenSharingSourceType;
	streamUrl: MediaStream | null;
	cursorPosition: CursorPosition | null;
}

type IOSVideoElement = HTMLVideoElement & {
	webkitEnterFullscreen?: () => void;
	webkitExitFullscreen?: () => void;
	webkitSupportsFullscreen?: boolean;
	webkitDisplayingFullscreen?: boolean;
};

function PlayerView(props: PlayerViewProps) {
	const { t } = useTranslation();
	const {
		screenSharingSourceType,
		setIsWithControls,
		isWithControls,
		handlePlayPause,
		isPlaying,
		setPlaying,
		setVideoQuality,
		videoQuality,
		streamUrl,
		cursorPosition,
	} = props;

	// const player = useRef(null);

	const videoRef = useRef<HTMLVideoElement>(null);
	const toasterRef = useRef<Awaited<ReturnType<typeof OverlayToaster.create>> | null>(null);
	// no external player ref needed for video.js variant

	const [isFlipped, setIsFlipped] = useState(false);
	const [rotationDegrees, setRotationDegrees] = useState(0);
	const [viewportVersion, setViewportVersion] = useState(0);

	useEffect(() => {
		const handleResize = () => {
			setViewportVersion((prev) => prev + 1);
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	// Mirror/rotate the live video element(s). Covers both the native
	// <video> and the one video.js creates imperatively. At 90°/270° the
	// frame is scaled to fit so it can't overflow into the control bar.
	useEffect(() => {
		const container = document.getElementById(PLAYER_WRAPPER_ID);
		const rect = container?.getBoundingClientRect();
		let fitScale = 1;
		if (
			rect &&
			rect.width > 0 &&
			rect.height > 0 &&
			rotationDegrees % 180 !== 0
		) {
			fitScale = Math.min(
				rect.width / rect.height,
				rect.height / rect.width,
			);
		}
		const transform = `scale(${fitScale}) rotate(${rotationDegrees}deg)${isFlipped ? ' scaleX(-1)' : ''}`;
		if (videoRef.current) {
			videoRef.current.style.transform = transform;
		}
		container?.querySelectorAll('video').forEach((video) => {
			video.style.transform = transform;
		});
	}, [isFlipped, rotationDegrees, streamUrl, isWithControls, viewportVersion]);

	const handleToggleFlip = useCallback(() => {
		setIsFlipped((prev) => !prev);
	}, []);

	const handleRotateClockwise = useCallback(() => {
		setRotationDegrees((prev) => (prev + 90) % 360);
	}, []);

	// Presenter cursor highlight: map the host-relative cursor position onto
	// the displayed video (contain-fit), hide it when updates stop arriving.
	const [cursorPx, setCursorPx] = useState<{
		left: number;
		top: number;
	} | null>(null);
	const cursorHideTimer = useRef<number | null>(null);

	useEffect(() => {
		if (cursorHideTimer.current !== null) {
			window.clearTimeout(cursorHideTimer.current);
			cursorHideTimer.current = null;
		}
		if (!cursorPosition || !streamUrl) {
			setCursorPx(null);
			return;
		}
		const container = document.getElementById(PLAYER_WRAPPER_ID);
		if (!container) return;
		const rect = container.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		const video = container.querySelector('video');
		const sourceWidth = video?.videoWidth || rect.width;
		const sourceHeight = video?.videoHeight || rect.height;
		const scale = Math.min(
			rect.width / sourceWidth,
			rect.height / sourceHeight,
		);
		const drawnWidth = sourceWidth * scale;
		const drawnHeight = sourceHeight * scale;
		setCursorPx({
			left: (rect.width - drawnWidth) / 2 + cursorPosition.x * drawnWidth,
			top:
				(rect.height - drawnHeight) / 2 + cursorPosition.y * drawnHeight,
		});
		cursorHideTimer.current = window.setTimeout(() => {
			setCursorPx(null);
		}, 1500);
		return () => {
			if (cursorHideTimer.current !== null) {
				window.clearTimeout(cursorHideTimer.current);
				cursorHideTimer.current = null;
			}
		};
	}, [cursorPosition, streamUrl]);

	// Auto-hide the control bar after 3s idle while streaming; any pointer
	// activity brings it back.
	const [areControlsHidden, setAreControlsHidden] = useState(false);
	const hideControlsTimer = useRef<number | null>(null);

	const pokeControlsVisible = useCallback(() => {
		setAreControlsHidden(false);
		if (hideControlsTimer.current !== null) {
			window.clearTimeout(hideControlsTimer.current);
			hideControlsTimer.current = null;
		}
		hideControlsTimer.current = window.setTimeout(() => {
			setAreControlsHidden(true);
		}, 3000);
	}, []);

	useEffect(() => {
		pokeControlsVisible();
		return () => {
			if (hideControlsTimer.current !== null) {
				window.clearTimeout(hideControlsTimer.current);
				hideControlsTimer.current = null;
			}
		};
	}, [pokeControlsVisible, streamUrl]);

	useEffect(() => {
		if (!streamUrl) return;

		// html5 video mode
		if (isWithControls && videoRef.current) {
			if (streamUrl instanceof MediaStream) {
				videoRef.current.srcObject = streamUrl;
			} else {
				videoRef.current.src = streamUrl;
			}
			videoRef.current.play().catch((error) => {
				console.error('Error playing video:', error);
			});
			return;
		}

		// video.js mode (default) doesn't need imperative src assignment here
	}, [streamUrl, isWithControls]);

	useEffect(() => {
		if (isWithControls) {
			if (!videoRef.current) return;
			if (isPlaying) {
				videoRef.current.play().catch((error) => {
					console.error('Error playing video:', error);
				});
			} else {
				videoRef.current.pause();
			}
		}
		// react-player play/pause is handled via its `playing` prop
	}, [isPlaying, isWithControls]);

	// initialize toaster
	useEffect(() => {
		const initToaster = async () => {
			if (!toasterRef.current) {
				toasterRef.current = await OverlayToaster.create({
					position: Position.BOTTOM,
				});
			}
		};
		initToaster();
	}, []);

	// wrap handlePlayPause to show toaster notifications
	const handlePlayPauseWithNotification = useCallback(() => {
		const nextPlaying = !isPlaying;
		handlePlayPause();
		
		// show notification after a small delay to ensure state is updated
		setTimeout(() => {
			if (toasterRef.current) {
				toasterRef.current.show({
					message: nextPlaying ? t('Video stream is playing') : t('Video stream is paused'),
					intent: nextPlaying ? 'success' : 'warning',
					timeout: 2000,
				});
			}
		}, 50);
	}, [handlePlayPause, isPlaying, t]);

	// handle iPhone fullscreen exit - detect when video stops and auto-resume
	useEffect(() => {
		if (!streamUrl) return;

		const getVideoElement = (): IOSVideoElement | null => {
			if (isWithControls && videoRef.current) {
				return videoRef.current as IOSVideoElement;
			}
			const container = document.getElementById(PLAYER_WRAPPER_ID);
			if (!container) return null;
			const maybeVideo = container.querySelector('video');
			if (!(maybeVideo instanceof HTMLVideoElement)) return null;
			return maybeVideo as IOSVideoElement;
		};

		const handleFullscreenEnd = () => {
			// small delay to ensure video state is updated after fullscreen exit
			setTimeout(() => {
				const video = getVideoElement();
				if (!video) return;

				// check if video is paused after exiting fullscreen
				if (video.paused) {
					// sync play state - ensure button shows "Play" instead of "Pause"
					setPlaying(false);

					// show warning notification that video stopped and user needs to click play
					if (toasterRef.current) {
						toasterRef.current.show({
							message: t('Video stream paused after exiting fullscreen. Please click Play to continue.'),
							intent: 'warning',
							timeout: 5000,
						});
					}
				} else {
					// video is playing, but state might be wrong - sync it
					if (!isPlaying) {
						setPlaying(true);
					}
				}
			}, 150);
		};

		const attachListener = (video: IOSVideoElement | null) => {
			if (video) {
				video.addEventListener('webkitendfullscreen', handleFullscreenEnd);
			}
		};

		const detachListener = (video: IOSVideoElement | null) => {
			if (video) {
				video.removeEventListener('webkitendfullscreen', handleFullscreenEnd);
			}
		};

		let currentVideo: IOSVideoElement | null = getVideoElement();
		attachListener(currentVideo);

		// watch for video element changes (especially for VideoJSPlayer)
		const container = document.getElementById(PLAYER_WRAPPER_ID);
		let observer: MutationObserver | null = null;

		if (container) {
			observer = new MutationObserver(() => {
				const newVideo = getVideoElement();
				if (newVideo !== currentVideo) {
					detachListener(currentVideo);
					currentVideo = newVideo;
					attachListener(currentVideo);
				}
			});
			observer.observe(container, { childList: true, subtree: true });
		}

		return () => {
			detachListener(currentVideo);
			if (observer) {
				observer.disconnect();
			}
		};
	}, [streamUrl, isWithControls, isPlaying, setPlaying, t]);

	// @ts-ignore
	return (
		<div
			onMouseMove={pokeControlsVisible}
			onTouchStart={pokeControlsVisible}
			style={{
				position: 'absolute',
				zIndex: 1,
				top: 0,
				left: 0,
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					maxHeight: areControlsHidden && streamUrl ? '0px' : '160px',
					opacity: areControlsHidden && streamUrl ? 0 : 1,
					overflow: 'hidden',
					transition:
						'max-height 300ms ease-in-out, opacity 300ms ease-in-out',
					pointerEvents:
						areControlsHidden && streamUrl ? 'none' : 'auto',
				}}
			>
				<PlayerControlPanel
				onSwitchChangedCallback={(isEnabled) => setIsWithControls(isEnabled)}
				isDefaultPlayerTurnedOn={isWithControls}
				handleClickFullscreen={() => {
					const result = togglePlayerFullscreen();
					if (result === 'failed') {
						console.warn('Unable to toggle fullscreen');
					}
					return result;
				}}
				handleClickPlayPause={handlePlayPauseWithNotification}
				isPlaying={isPlaying}
				setVideoQuality={setVideoQuality}
				selectedVideoQuality={videoQuality}
				screenSharingSourceType={screenSharingSourceType}
				isFlipped={isFlipped}
				onToggleFlip={handleToggleFlip}
				rotationDegrees={rotationDegrees}
				onRotateClockwise={handleRotateClockwise}
				/>
			</div>
			<div
				id="video-container"
				style={{
					margin: '0 auto',
					position: 'relative',
					flex: 1,
					width: '100%',
					height: '100%',
					minHeight: 0,
					backgroundColor: 'black',
				}}
			>
				<div
					id={PLAYER_WRAPPER_ID}
					className="player-wrapper"
					style={{
						position: 'relative',
						width: '100%',
						height: '100%',
						backgroundColor: 'black',
					}}
				>
					{isWithControls ? (
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							className="absolute top-0 left-0 w-full h-full"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'contain',
								backgroundColor: 'black',
							}}
						/>
					) : (
						<VideoJSPlayer
							stream={streamUrl}
							playing={isPlaying}
							containerEl={document.getElementById(PLAYER_WRAPPER_ID)}
						/>
					)}
					{cursorPx && streamUrl && (
						<div
							style={{
								position: 'absolute',
								left: `${cursorPx.left}px`,
								top: `${cursorPx.top}px`,
								width: '28px',
								height: '28px',
								marginLeft: '-14px',
								marginTop: '-14px',
								borderRadius: '50%',
								border: '3px solid #a89bf5',
								boxShadow:
									'0 0 12px rgba(168, 155, 245, 0.9), inset 0 0 6px rgba(168, 155, 245, 0.5)',
								pointerEvents: 'none',
								zIndex: 5,
								transition: 'left 100ms linear, top 100ms linear',
							}}
						/>
					)}
				</div>
				<canvas id={COMPARISON_CANVAS_ID} style={{ display: 'none' }}></canvas>
			</div>
		</div>
	);
}

export default PlayerView;
