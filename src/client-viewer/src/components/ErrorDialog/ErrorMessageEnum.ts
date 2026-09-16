export const ErrorMessage = {
	UNKNOWN_ERROR: 'An unknown error occurred',
	DENY_TO_CONNECT: 'You were not allowed to connect',
	WRONG_PASSWORD: 'Wrong password, ask the host for the correct one and retry',
	DISCONNECTED: 'You were disconnected',
	NOT_ALLOWED: 'You were not allowed to connect',
	WEBRTC_ERROR: 'WebRTC error occurred',
} as const;

export type ErrorMessageType = (typeof ErrorMessage)[keyof typeof ErrorMessage];
