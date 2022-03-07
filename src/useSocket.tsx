import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SERVER_URL = "http://66.175.216.128:3089";

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
  return { polls, active, vote, makeActive };
};
