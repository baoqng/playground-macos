export function useWindowSize() {
  const [state, setState] = useState({
    winWidth: window.innerWidth,
    winHeight: window.innerHeight
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setState({
          winWidth: window.innerWidth,
          winHeight: window.innerHeight
        });
        timeoutRef.current = null;
      }, 150);
    };

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return state;
}
