import { useState, useEffect } from "react";

export const useLocalStorage = ({
  key,
  initialValue
}: {
  key: string;
  initialValue?: string;
}) => {
  const [value, setValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    let parse = initialValue;
    try {
      parse = JSON.parse(item ?? '');
    }
    catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
    // eslint-disable-next-line
  }, [value]);

  return [value, setValue];
};
