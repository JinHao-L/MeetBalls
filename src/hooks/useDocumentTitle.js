import { useEffect, useRef } from "react";

const DEFAULT_TITLE = 'MeetBalls';

export default function useDocumentTitle(title, prevailOnUnmount = false) {
  const defaultTitle = useRef(document.title || DEFAULT_TITLE);

  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
  }, [title]);

  useEffect(() => {
    return () => {
      if (prevailOnUnmount) return;
      document.title = defaultTitle.current;
    };
  }, []);
}