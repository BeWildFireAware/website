export default function StationSection({ stationData, stationError }) {
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
    </section>
  );
}
