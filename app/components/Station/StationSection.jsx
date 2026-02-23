export default function StationSection({ stationData, stationError }) {
<<<<<<< HEAD
  // Set content based on whether there's an error
  let content;

  if (stationError) {
    // Show error message if data fetch failed
    content = (
      <div className="error-message">
        <p className="error-title">Station Error</p>
        <p className="error-body">{stationError.message}</p>
      </div>
    );
  } else {
    // Show FDRA records as cards if data loaded successfully
    content = (
      <div>
        <p className="record-count">
          Total Records: {stationData?.length ?? 0}
        </p>

        <div className="cards-grid">
          {stationData?.slice(0, 5).map((station) => (//limit to 5 for display
            <div key={station.Record_ID} className="area-card">
              <h3 className="dashboard-subheading">
                {station.Station_Name ?? 'Unnamed Station'}
              </h3>
              <p className="text-black">record: {station.Record_ID}</p>
              <p className="text-black">Station ID: {station.Station_ID}</p>
              <p className="text-black">Station FDRA ID: {station.FDRA_ID}</p>
              <p className="text-black">BI: {station.BI}</p>
              <p className="text-black">ERC: {station.ERC}</p>
              <p className="text-black">NFDR Type: {station.NFDRType}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="Station-section">
      <h2 className="dashboard-heading">Station Records</h2>
      {content}
=======
  // super‑simple summary list – just show count and a few names
  return (
    <section className="Station-section">
      <h2 className="dashboard-heading">Station Records</h2>
      {stationError ? (
        <p className="error-body">{stationError.message}</p>
      ) : (
        <>
          <p>Total records: {stationData?.length ?? 0}</p>
          <ul>
            {stationData?.slice(0, 5).map((s) => (
              <li key={s.Record_ID}>
                {s.Station_Name || 'Unnamed'}{' '}
                {s.NFDRType ? `(${s.NFDRType})` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
>>>>>>> ea7079f8ed3cf5cdd2a9daafd9bfd5d63142f5df
    </section>
  );
}
