// bloom-deps: react@^18 react-rnd@^10

import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useStore } from "../store";
import { useWindowSize } from "../hooks/useWindowSize";
import { minMarginY, minMarginX, appBarHeight } from "../utils/constants";

export interface TrafficProps {
  id: string;
  close: (id: string) => void;
  aspectRatio: number | undefined;
  max: boolean;
  setMax: (id: string) => void;
  setMin: (id: string) => void;
}

export interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  min: boolean;
  max: boolean;
  z: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
  focus: (id: string) => void;
  close: (id: string) => void;
  setMax: (id: string) => void;
  setMin: (id: string) => void;
}

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
}

// Icon stubs – real icons are provided by the icon library in the actual project
const FullIcon = ({ size }: { size: number }) => (
  <span style={{ fontSize: size }} />
);
const ExitFullIcon = ({ size }: { size: number }) => (
  <span style={{ fontSize: size }} />
);

const TrafficLights = ({
  id,
  close,
  aspectRatio,
  max,
  setMax,
  setMin,
}: TrafficProps) => {
  const disableMax = aspectRatio !== undefined;

  const closeWindow = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    close(id);
  };

  return (
    <div className="traffic-lights flex flex-row absolute left-0 space-x-2 pl-2 mt-1.5">
      <button
        className="window-btn bg-red-500 dark:bg-red-400"
        onClick={closeWindow}
        onTouchEnd={closeWindow}
      >
        <span className="icon i-gg:close text-[9px]" />
      </button>
      <button
        className={`window-btn ${
          max ? "bg-c-400" : "bg-yellow-500 dark:bg-yellow-400"
        }`}
        onClick={() => setMin(id)}
        onTouchEnd={() => setMin(id)}
        disabled={max}
      >
        <span
          className={`icon i-fe:minus text-[10px] ${max ? "invisible" : ""}`}
        />
      </button>
      <button
        className={`window-btn ${
          disableMax ? "bg-c-400" : "bg-green-500 dark:bg-green-400"
        }`}
        onClick={() => setMax(id)}
        onTouchEnd={() => setMax(id)}
        disabled={disableMax}
      >
        {!disableMax && (max ? <ExitFullIcon size={9} /> : <FullIcon size={6} />)}
      </button>
    </div>
  );
};

const Window = (props: WindowProps) => {
  const dockSize = useStore((state: any) => state.dockSize);
  const { winWidth, winHeight } = useWindowSize();

  const initWidth = Math.min(winWidth, props.width || 640);
  const initHeight = Math.min(winHeight, props.height || 400);

  const [state, setState] = useState<WindowState>({
    width: initWidth,
    height: initHeight,
    // "+ winWidth" because of the boundary for windows
    x: winWidth + (winWidth - initWidth) / 2 + (props.x || 0),
    // "- minMarginY" because of the boundary for windows
    y: (winHeight - initHeight - dockSize - minMarginY) / 2 + (props.y || 0),
  });

  useEffect(() => {
    setState({
      ...state,
      width: Math.min(winWidth, state.width),
      height: Math.min(winHeight, state.height),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winWidth, winHeight]);

  const round = props.max ? "rounded-none" : "rounded-lg";
  const minimized = props.min
    ? "opacity-0 invisible transition-opacity duration-300"
    : "";
  const border = props.max ? "" : "border border-gray-500/30";
  const width = props.max ? winWidth : state.width;
  const height = props.max ? winHeight : state.height;
  const disableMax = props.aspectRatio !== undefined;

  const children = React.cloneElement(props.children as React.ReactElement, {
    width: width,
  });

  return (
    <Rnd
      bounds="parent"
      size={{
        width: width,
        height: height,
      }}
      position={{
        x: props.max
          ? winWidth // because of boundary
          : Math.min(
              // "winWidth * 2" because of the boundary for windows
              winWidth * 2 - minMarginX,
              Math.max(
                // "+ winWidth" because we add a boundary for windows
                winWidth - state.width + minMarginX,
                state.x
              )
            ),
        y: props.max
          ? -minMarginY // because of boundary
          : Math.min(
              // "- minMarginY" because of the boundary for windows
              winHeight - minMarginY - (dockSize + 15 + minMarginY),
              Math.max(0, state.y)
            ),
      }}
      onDragStop={(e, d) => {
        setState({ ...state, x: d.x, y: Math.max(0, d.y) });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setState({
          ...state,
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          ...position,
        });
      }}
      minWidth={props.minWidth ? props.minWidth : 200}
      minHeight={props.minHeight ? props.minHeight : 150}
      dragHandleClassName="window-bar"
      disableDragging={props.max}
      enableResizing={!props.max}
      lockAspectRatio={props.aspectRatio}
      lockAspectRatioExtraHeight={props.aspectRatio ? appBarHeight : undefined}
      style={{ zIndex: props.z }}
      onMouseDown={() => props.focus(props.id)}
      className={`overflow-hidden ${round} ${border} shadow-lg shadow-black/30 ${minimized}`}
      id={`window-${props.id}`}
    >
      <div
        className="window-bar relative h-6 text-center bg-c-200"
        onDoubleClick={() => !disableMax && props.setMax(props.id)}
      >
        <TrafficLights
          id={props.id}
          max={props.max}
          aspectRatio={props.aspectRatio}
          setMax={props.setMax}
          setMin={props.setMin}
          close={props.close}
        />
        <span className="font-semibold text-c-700">{props.title}</span>
      </div>
      <div className="innner-window w-full overflow-y-hidden">{children}</div>
    </Rnd>
  );
};

export default Window;