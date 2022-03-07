import React, { useCallback, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { BarChart, createChartData } from "./BarChart";
import { useSocket } from "./useSocket";

export function PresenterForm(props: any) {
  const [username, setUsername] = useState('');
  const [pollName, setPollName] = useState('');
  const [points, setPoints] = useState('');
  const { polls, active, vote, makeActive } = useSocket({
    roomId: "polls",
  });
  const valueChange = useCallback((fn: (value: string) => void) => (e: any) => fn(e.target.value), []);
  const handleUsernameChange = valueChange(setUsername);
  const handlePollnameChange = valueChange(setPollName);
  const handlePointsChange = valueChange(setPoints);
  const activePoll = useMemo(() => {
    let poll;
    for (const [key, value] of Object.entries(active)) {
      if (value.status === 'active' || value.status === 'show') {
        poll = { ...value, pollName: key };
      }
    }
    return poll;
  }, [active]);
  const activePollName = useMemo(() => activePoll?.pollName ?? '', [activePoll]);
  const chartData = useMemo(() => createChartData(polls, activePollName), [polls, activePollName]);
  // console.log(username, pollName, points);
  // console.log(polls, active);
  return (
    <div className="container">
      <div className="row">
        <Form className="inputs col-md">
          <Form.Group className="mb-3" controlId="username" onChange={handleUsernameChange}>
            <Form.Control type="name" placeholder="Username" value={username} onChange={() => { return; }} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="pollName" onChange={handlePollnameChange}>
            <Form.Control type="name" placeholder="Poll name" value={pollName} onChange={() => { return; }} />
          </Form.Group>
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
                vote({ pollName, value: points, username });
              }}
              style={{ margin: "5px" }}
            >
              Vote
            </Button>
            <Button
              variant="success"
              type="button"
              onClick={(e: any) => {
                makeActive({
                  pollName, isActive: {
                    status: 'active',
                    timestamp: Date.now()
                  }
                });
              }}
              style={{ margin: "5px" }}
            >
              Activate
            </Button>
            <Button
              variant="warning"
              type="button"
              onClick={(e: any) => {
                makeActive({
                  pollName, isActive: {
                    status: 'show',
                    timestamp: Date.now()
                  }
                });
              }}
              style={{ margin: "5px" }}
            >
              Show
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={(e: any) => {
                makeActive({
                  pollName, isActive: {
                    status: 'inactive',
                    timestamp: Date.now()
                  }
                });
              }}
              style={{ margin: "5px" }}
            >
              Inactivate
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={(e: any) => {
                setPollName('');
              }}
              style={{ margin: "5px" }}
            >
              Reset
            </Button>
          </Form.Group>
        </Form>
      </div>
      {chartData.datasets[0].data.length > 0 && activePollName !== '' &&
        <div className="row">
          <BarChart chartData={chartData} title={pollName} />
        </div>
      }
    </div>
  );
}
