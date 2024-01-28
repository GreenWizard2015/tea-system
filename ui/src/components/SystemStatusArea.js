import React from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import TimerArea from '../components/TimerArea';

function _systemStatus(status) {  
  if (null === status) {
    return (<b>Not connected</b>);
  }
  
  const pump = status.pump;
  const color = pump.running ? "green" : "black";
  return (
    <>
      <strong>Time since last update:</strong>{' '}
        <TimerArea startTime={status.updated} />
      {' | '}
      <span style={{color: color}}>
        <strong>Pump Running:</strong> {pump.running ? "Yes" : "No"}
      </span>
    </>
  );
}

export function SystemStatusAreaComponent({ status }) {
  return (
    <Card className="my-3">
      <Card.Body>
        <Card.Title>System Status</Card.Title>
        <Card.Text>
          {_systemStatus(status)}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default connect(
  state => ({
    status: state.systemStatus
  }), []
)(SystemStatusAreaComponent);