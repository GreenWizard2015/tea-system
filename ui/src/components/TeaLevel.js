import React, { useEffect, useState } from 'react';
import './TeaLevel.css';
import cup from './cup.jpg';
import { connect } from 'react-redux';
import { changeEstimatedTeaLevel, changeStartTeaLevel } from '../store/slices/Temp';
import { changeSpeed } from '../store/slices/UI';

const bottomLevel = 20; // where the tea starts (0%)
const maxLevel = 80; // where the tea ends (100%)

function toRealLevel(level) {
  const H = maxLevel - bottomLevel;
  return (level / 100 * H) + bottomLevel;
}

function toPercentage(realLevel) {
  const H = maxLevel - bottomLevel;
  return (realLevel - bottomLevel) / H * 100;
}

function TeaLevel({ 
  lastOperationDuration, speed, startTeaLevel, estimatedTeaLevel,
  changeStartTeaLevel, changeEstimatedTeaLevel, changeSpeed, lastTeaLevel,
}) {
  const [calcSpeed, setCalcSpeed] = useState(speed);
  // update the estimated level if speed or duration changes
  useEffect(() => {
    const estimatedLevel = startTeaLevel + speed * lastOperationDuration / 1000;
    changeEstimatedTeaLevel(estimatedLevel);
  }, [lastOperationDuration, speed, startTeaLevel, changeEstimatedTeaLevel]);

  const handleCupClick = (e) => {
    const { top, height } = e.target.getBoundingClientRect();
    const clickY = e.clientY;
    const clickedPosition = top - clickY + height;
    const clickedPercentage = (clickedPosition / height) * 100;
    const newLevel = toPercentage(clickedPercentage);
    // limit the new level to the range [0, 100]
    const level = Math.min(Math.max(newLevel, 0), 100);
    changeStartTeaLevel( level );
    // find speed
    const newSpeed = (level - lastTeaLevel) / (lastOperationDuration / 1000);
    setCalcSpeed(newSpeed);
  };

  function onSpeedSet(e) {
    e.preventDefault();
    changeSpeed(calcSpeed);
  }

  return (
    <>
      <div>
        <div className="tea-glass">
          <div className="tea-container">
            <img src={cup} alt="Cup" className="cup-image" draggable="false" 
              onClick={handleCupClick}
            />
            <div className="tea-level" style={{ bottom: `${toRealLevel(startTeaLevel)}%` }}>
              {startTeaLevel.toFixed(0)}%
            </div>
            
            <div className="est-tea-level" style={{ bottom: `${toRealLevel(estimatedTeaLevel)}%` }}>
              {estimatedTeaLevel.toFixed(0)}%
            </div>

            <div className="prev-tea-level" style={{ bottom: `${toRealLevel(lastTeaLevel)}%` }}>
              {lastTeaLevel.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      <div>
        <input 
          type="number" step="0.01" 
          value={calcSpeed.toFixed(2)} 
          onChange={(e) => setCalcSpeed(parseFloat(e.target.value))} 
        />
        <button onClick={onSpeedSet}>Set Speed</button>
      </div>
    </>
  );
}

export default connect(
  state => ({
    lastOperationDuration: state.Temp.lastOperationDuration,
    speed: state.UI.speed,
    startTeaLevel: state.Temp.startTeaLevel,
    estimatedTeaLevel: state.Temp.estimatedTeaLevel,
    lastTeaLevel: state.Temp.prevTeaLevel,
  }), 
  { changeStartTeaLevel, changeEstimatedTeaLevel, changeSpeed }
)(TeaLevel);