// Type for music play status, ended means queue is empty, playing means that music is currently going, and paused means that queue is either empty or full, but is not playing
export type PlayStatus = "ended" | "playing" | "paused";
