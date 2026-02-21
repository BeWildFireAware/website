export default function StatusSection({
  dispatchError,
  fdraError,
  stationError,
}) {
  // Determine dispatch status based on error
  let dispatchStatus;

  if (dispatchError) {
    dispatchStatus = {
      className: 'status-error',
      message: 'Error',
      textClass: 'status-text-error'
    };
  } else {
    dispatchStatus = {
      className: 'status-success',
      message: 'Connected',
      textClass: 'status-text-success'
    };
  }

  // Determine FDRA status based on error
  let fdraStatus;

  if (fdraError) {
    fdraStatus = {
      className: 'status-error',
      message: 'Error',
      textClass: 'status-text-error'
    };
  } else {
    fdraStatus = {
      className: 'status-success',
      message: 'Connected',
      textClass: 'status-text-success'
    };
  }

  //Determin StationRecord status based on error
  let stationStatus;
  if (stationError) {
    stationStatus = {
      className: 'status-error',
      message: 'Error',
      textClass: 'status-text-error'
    };
  } else {
    stationStatus = {
      className: 'status-success',  
      message: 'Connected',
      textClass: 'status-text-success'
    };
  }

  return (
    <section className="status-section">
      <h2 className="Connection Status">Connection Status</h2>

      <div className="status-grid">
        {/* Dispatch Area connection status */}
        <div className={`status-card ${dispatchStatus.className}`}>
          <p className="status-DispatchArea">DispatchArea</p>
          <p className={dispatchStatus.textClass}>
            {dispatchStatus.message}
          </p>
        </div>

        {/* FDRA connection status */}
        <div className={`status-card ${fdraStatus.className}`}>
          <p className="status-FDRA">FDRA</p>
          <p className={fdraStatus.textClass}>
            {fdraStatus.message}
          </p>
        </div>

        {/* StationRecord connection status */}
        <div className={`status-card ${stationStatus.className}`}>
          <p className="status-StationRecord">StationRecord</p>
          <p className={stationStatus.textClass}>
            {stationStatus.message}
          </p>
        </div>
      </div>
    </section>
  );

  
}
