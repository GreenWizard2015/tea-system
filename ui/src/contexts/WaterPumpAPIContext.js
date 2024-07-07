import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { CWaterPumpAPI } from '../api/CWaterPumpAPI.js';
import { updateSystemStatus } from '../store/slices/SystemStatus.js';
import { changeLastOperationDuration, pumpStartedEvent } from '../store/slices/Temp.js';

const WaterPumpAPIContext = React.createContext();

export function useWaterPumpAPI() {
  return React.useContext(WaterPumpAPIContext);
}

const FETCH_STATUS_INTERVAL = 5000;

function _publicWrapper({ 
  apiObject, apiQueue, _pouringTime, _powerLevel, startTimeRef, onPumpStart
}) {
  if (null == apiObject) return { API: null };
  return {
    API: {
      stopPump: () => {
        apiQueue.push({
          action: async () => {
            startTimeRef.current = null; // reset the start time
            return await apiObject.stop();
          },
          failMessage: 'Failed to stop the pump'
        });
      },
      startPump: () => {
        apiQueue.push({
          action: async () => {
            if (startTimeRef.current === null) {
              startTimeRef.current = Date.now();
              await onPumpStart();
            }
            return await apiObject.start(_pouringTime.current, _powerLevel.current);
          },
          failMessage: 'Failed to start the pump'
        });
      },
    }
  };
}

function _makeStatusAction(apiObject) {
  return {
    action: async () => await apiObject.status(),
    failMessage: 'Failed to get the pump status'
  };
}

async function _processQueue({ apiQueue, lastUpdateTime, statusAction, updateStatus }) {
  const deltaTime = Date.now() - lastUpdateTime.current;
  const hasTasks = (0 < apiQueue.length);
  if ((deltaTime < FETCH_STATUS_INTERVAL) && !hasTasks) return;

  const action = hasTasks ? apiQueue.shift() : statusAction;
  const oldTime = lastUpdateTime.current;
  lastUpdateTime.current = Number.MAX_SAFE_INTEGER; // prevent concurrent tasks, just in case
  try {
    await updateStatus(action);
    lastUpdateTime.current = Date.now();
  } catch (error) {
    lastUpdateTime.current = oldTime;
    if (hasTasks) { // re-queue the action if it failed
      apiQueue.unshift(action);
    }
    throw error;
  }
}

function WaterPumpAPIProviderComponent({
  children,
  apiHost, pouringTime, powerLevel,
  updateStatus,
  changeLastOperationDuration,
  onPumpStart,
}) {
  const _pouringTime = useRef(pouringTime);
  useEffect(() => { _pouringTime.current = pouringTime; }, [pouringTime]);

  const _powerLevel = useRef(powerLevel);
  useEffect(() => { _powerLevel.current = powerLevel; }, [powerLevel]);

  const startTimeRef = useRef(null);
  const { apiObject, apiQueue } = useMemo(
    () => ({
      apiObject: new CWaterPumpAPI({ URL: apiHost }),
      apiQueue: []
    }),
    [apiHost]
  );

  const statusAction = useMemo(() => _makeStatusAction(apiObject), [apiObject]);
  const lastUpdateTime = useRef(0);
  const onTick = useCallback(
    async () => {
      if(null != startTimeRef.current) { // update the total duration of the last operation
        const T = Date.now() - startTimeRef.current;
        changeLastOperationDuration(T);
      }
      _processQueue({ apiQueue, lastUpdateTime, statusAction, updateStatus });
    },
    [apiQueue, lastUpdateTime, statusAction, updateStatus, changeLastOperationDuration]
  );

  useEffect(() => {
    const timer = setInterval(onTick, 100);
    return () => { clearInterval(timer); };
  }, [onTick]);

  const value = useMemo(
    () => _publicWrapper({ apiObject, apiQueue, _pouringTime, _powerLevel, startTimeRef, onPumpStart }),
    [apiObject, apiQueue, _pouringTime, _powerLevel, startTimeRef, onPumpStart]
  );

  return (
    <WaterPumpAPIContext.Provider value={value}>
      {children}
    </WaterPumpAPIContext.Provider>
  );
}

const WaterPumpAPIProvider = connect(
  state => ({
    apiHost: state.UI.apiHost,
    pouringTime: state.UI.pouringTime,
    powerLevel: state.UI.powerLevelInPercents,
  }),
  { 
    updateStatus: updateSystemStatus, changeLastOperationDuration,
    onPumpStart: pumpStartedEvent
  }
)(WaterPumpAPIProviderComponent);

export default WaterPumpAPIProvider;
export { WaterPumpAPIProvider };
