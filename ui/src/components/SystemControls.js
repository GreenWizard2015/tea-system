import React from 'react';
import { Button } from 'react-bootstrap';

import { useWaterPumpAPI } from '../contexts/WaterPumpAPIContext';
import { useNotificationsSystem } from '../contexts/NotificationsContext.js';

function SystemControls({ pouringTime, systemStatus }) {
  const waterPump = useWaterPumpAPI().API;
  const NotificationsSystem = useNotificationsSystem();

  const handleStart = async () => {
    try {
      await waterPump.start(pouringTime);
      NotificationsSystem.alert('Water pump started successfully!');
    } catch (error) {
      NotificationsSystem.alert('Error starting water pump: ' + error.message);
    }
  };

  const handleStop = async () => {
    try {
      await waterPump.stop();
      NotificationsSystem.alert('Water pump stopped successfully!');
    } catch (error) {
      NotificationsSystem.alert('Error stopping water pump: ' + error.message);
    }
  };

  const isRunning = systemStatus.pump.running;
  return (
    <>
      <Button variant="primary" onClick={handleStart} disabled={isRunning}>
        Start
      </Button>{' '}
      <Button variant="secondary" onClick={handleStop} disabled={!isRunning}>
        Stop
      </Button>
    </>
  );
}

export default SystemControls;