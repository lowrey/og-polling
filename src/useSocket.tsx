import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SERVER_URL = "http://66.175.216.128:3089";

const useBeforeUnload = (value: any) => {
  const handleBeforeunload = (e: any) => {
    let returnValue;
    if (typeof value === "function") {
      returnValue = value(e);
    } else {
      returnValue = value;
    }
    if (returnValue) {
      e.preventDefault();
      e.returnValue = returnValue;
    }
    return returnValue;
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeunload);
    return () => window.removeEventListener("beforeunload", handleBeforeunload);
    // eslint-disable-next-line
  }, []);
};

export const useSocket = ({
  roomId,
}: {
  roomId: string;
}) => {
  const [polls, setPolls] = useState<{
    [pollName: string]: {
      pollName: string;
      username: string;
      address: string;
      value: string;
      timestamp: number;
    }[]
  }>({});
  const [active, setActive] = useState<
    { [pollName: string]: { status: string; timestamp: number; }; }
  >({});

  // const [userId] = useLocalStorage({
  //   key: "userId",
  //   initialValue: nanoid(8)
  // });
  // const [username] = useLocalStorage({ key: "username" });

  const socketRef = useRef<any>();

  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
      query: { roomId }
    });
    socketRef.current?.on("polls", (newPolls: any) => {
      setPolls(newPolls);
    });
    socketRef.current?.on("activePolls", (newActive: any) => {
      setActive(newActive);
    });
    socketRef.current?.emit("polls:get");
    socketRef.current?.emit("activePolls:get");
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const vote = useCallback(
    ({ pollName, value, username }: { pollName: string; value: string; username: string; }) => {
      console.log('emit polls:vote', pollName, value);
      console.log(socketRef.current);
      socketRef.current?.emit("polls:vote", { pollName, value, username });
      socketRef.current?.emit("polls:get");
    },
    []
  );
  const makeActive = useCallback(
    ({ pollName, isActive }: {
      pollName: string;
      isActive: { status: string; timestamp: number; };
    }) => {
      socketRef.current?.emit("activePolls:makeActive", { pollName, isActive });
      socketRef.current?.emit("activePolls:get");
    },
    []
  );

  useBeforeUnload(() => {
    // socketRef.current?.emit("user:leave", username);
  });

  return { polls, active, vote, makeActive };
};
