# @buildcores/render-client

A React component for interactive 360-degree video rendering with drag-to-scrub functionality.

## Installation

```bash
npm install @buildcores/render-client
```

## Usage

```tsx
import React from "react";
import { BuildRender } from "@buildcores/render-client";

function App() {
  return (
    <div>
      <BuildRender
        src="/path/to/your/360-video.mp4"
        size={500}
        onLoadStart={() => console.log("Video loading started")}
        onCanPlay={() => console.log("Video can play")}
        onProgress={(progress) => console.log(`Loading: ${progress}%`)}
      />
    </div>
  );
}
```

## Props

| Prop               | Type                         | Default        | Description                                  |
| ------------------ | ---------------------------- | -------------- | -------------------------------------------- |
| `src`              | `string`                     | **Required**   | Video source URL                             |
| `size`             | `number`                     | **Required**   | Video size in pixels (width and height)      |
| `mouseSensitivity` | `number`                     | `0.005`        | Mouse drag sensitivity                       |
| `touchSensitivity` | `number`                     | `0.01`         | Touch drag sensitivity                       |
| `instructionDelay` | `number`                     | `2000`         | Delay before showing bounce instruction (ms) |
| `instructionIcon`  | `string`                     | _default icon_ | Custom instruction icon URL                  |
| `onLoadStart`      | `() => void`                 | -              | Callback when video loading starts           |
| `onCanPlay`        | `() => void`                 | -              | Callback when video can start playing        |
| `onProgress`       | `(progress: number) => void` | -              | Callback with loading progress (0-100)       |

## Features

- **Drag to scrub**: Mouse and touch support for video scrubbing
- **Circular playback**: Video loops seamlessly when dragging past boundaries
- **Loading states**: Built-in loading overlay with progress bar
- **Bounce instruction**: Animated hint showing users they can drag
- **Responsive**: Adapts to the specified size
- **TypeScript**: Full TypeScript support

## Advanced Usage

```tsx
import { BuildRender, useVideoScrubbing } from "@buildcores/render-client";

// You can also use the hooks directly if needed
function CustomVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isDragging, handleMouseDown, handleTouchStart } =
    useVideoScrubbing(videoRef);

  return (
    <video
      ref={videoRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <source src="video.mp4" type="video/mp4" />
    </video>
  );
}
```

## License

ISC
