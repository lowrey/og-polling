import { noop } from "lodash";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { AppContext } from "./App";
import { BarChart, createChartData } from "./BarChart";
import { useSocket } from "./useSocket";

export function ParticipantForm(props: any) {
  const { setToast } = useContext(AppContext);
  const { search } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const [username, setUsername] = useState(queryParams.get("name") ?? "");
  const [points, setPoints] = useState(queryParams.get("points") ?? "");
  const [pollsVotedOn, setPollsVotedOn] = useState([] as string[]);
  const { polls, active, vote } = useSocket({
    roomId: "polls"
  });
  const valueChange = useCallback(
    (fn: (value: string) => void) => (e: any) => fn(e.target.value),
    []
  );
  const handleUsernameChange = valueChange(setUsername);
  const handlePointsChange = valueChange(setPoints);
  const activePoll = useMemo(() => {
    let poll;
    for (const [key, value] of Object.entries(active)) {
      if (value.status === "active") {
        poll = { ...value, pollName: key };
      }
    }
    return poll;
  }, [active]);
  const shownPoll = useMemo(() => {
    let poll;
    for (const [key, value] of Object.entries(active)) {
      if (value.status === "show") {
        poll = { ...value, pollName: key };
      }
    }
    return poll;
  }, [active]);
  const activePollName = useMemo(() => activePoll?.pollName ?? "", [
    activePoll
  ]);
  const shownPollName = useMemo(() => shownPoll?.pollName ?? "", [shownPoll]);
  const chartData = useMemo(() => createChartData(polls, shownPollName), [
    polls,
    shownPollName
  ]);
  const voteButtonDisabled = useMemo(
    () =>
      activePollName === "" ||
      username === "" ||
      points === "" ||
      pollsVotedOn.includes(activePollName),
    [activePollName, username, points, pollsVotedOn]
  );
  const voteTooltip = (props: any) => {
    if (voteButtonDisabled && !pollsVotedOn.includes(activePollName)) {
      let disabledMessage =
        "You need a username and some points before you can vote!";
      if (activePollName === "") {
        disabledMessage =
          "There needs to be an active poll before you can vote!";
      }
      return (
        <Tooltip id="button-tooltip" {...props}>
          {disabledMessage}
        </Tooltip>
      );
    }
    return <></>;
  };
  return (
    <div className="container">
      <div className="row">
        <Form className="inputs col-md">
          <Form.Group
            className="mb-3"
            controlId="username"
            onChange={handleUsernameChange}
          >
            <Form.Control
              type="name"
              placeholder="Username"
              value={username}
              onChange={noop}
            />
          </Form.Group>
          {activePollName !== "" && (
            <>
              <div>
                <b>{activePollName}</b>
              </div>
              <Form.Group
                className="mb-3"
                controlId="points"
                onChange={handlePointsChange}
              >
                {[1, 2, 3, 5, 8, 13, 21].map((val) => (
                  <Form.Check
                    inline
                    type="radio"
                    name="points"
                    label={val}
                    key={val}
                    value={val}
                  />
                ))}
              </Form.Group>
            </>
          )}
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={voteTooltip}
          >
            <span>
              <Button
                variant="primary"
                type="button"
                onClick={(e: any) => {
                  vote({ pollName: activePollName, value: points, username });
                  setPollsVotedOn([...pollsVotedOn, activePollName]);
                  setToast("Vote submitted!");
                }}
                style={{ margin: "5px" }}
                disabled={voteButtonDisabled}
              >
                Vote
              </Button>
            </span>
          </OverlayTrigger>
        </Form>
      </div>
      {chartData.datasets[0].data.length > 0 && shownPollName !== "" && (
        <div className="row">
          <BarChart chartData={chartData} title={shownPollName} />
        </div>
      )}
    </div>
  );
}
