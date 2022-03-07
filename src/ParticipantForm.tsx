import React, { useCallback, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { BarChart, createChartData } from "./BarChart";
import { useSocket } from "./useSocket";

export function ParticipantForm(props: any) {
  const [username, setUsername] = useState('');
  const [points, setPoints] = useState('');
  const { polls, active, vote } = useSocket({
    roomId: "polls",
  });
  const valueChange = useCallback((fn: (value: string) => void) => (e: any) => fn(e.target.value), []);
  const handleUsernameChange = valueChange(setUsername);
  const handlePointsChange = valueChange(setPoints);
  const activePoll = useMemo(() => {
    let poll;
    for (const [key, value] of Object.entries(active)) {
      if (value.status === 'active') {
        poll = { ...value, pollName: key };
      }
    }
    return poll;
  }, [active]);
  const shownPoll = useMemo(() => {
    let poll;
    for (const [key, value] of Object.entries(active)) {
      if (value.status === 'show') {
        poll = { ...value, pollName: key };
      }
    }
    return poll;
  }, [active]);
  const activePollName = useMemo(() => activePoll?.pollName ?? '', [activePoll]);
  const shownPollName = useMemo(() => shownPoll?.pollName ?? '', [shownPoll]);
  const chartData = useMemo(() => createChartData(polls, shownPollName), [polls, shownPollName]);
  return (
    <div className="container">
      <div className="row">
        <Form className="inputs col-md">
          <Form.Group className="mb-3" controlId="username" onChange={handleUsernameChange}>
            <Form.Control type="name" placeholder="Username" value={username} onChange={() => { return; }} />
          </Form.Group>
          {activePollName !== '' && <div>Voting on: {activePollName}</div>}
          <Form.Group className="mb-3" controlId="points" onChange={handlePointsChange}>
            <div>
              <Form.Label>Points:</Form.Label>
            </div>
            {[1, 2, 3, 5, 8, 13, 21].map((val) => (
              <Form.Check inline type="radio" name="points" label={val} key={val} value={val} />
            ))}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formName">
            <Button
              variant="primary"
              type="button"
              onClick={(e: any) => {
                vote({ pollName: activePollName, value: points, username });
              }}
              style={{ margin: "5px" }}
              disabled={activePollName === ''}
            >
              Vote
            </Button>
          </Form.Group>
        </Form>
      </div>
      {chartData.datasets[0].data.length > 0 && shownPollName !== '' &&
        <div className="row">
          <BarChart chartData={chartData} title={shownPollName} />
        </div>
      }
    </div >
  );
}
