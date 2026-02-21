export default function FdraSection({ fdraData, fdraError }) {
  // Set content based on whether there's an error
  let content;

  if (fdraError) {
    // Show error message if data fetch failed
    content = (
      <div className="error-message">
        <p className="error-title">FDRA Error</p>
        <p className="error-body">{fdraError.message}</p>
      </div>
    );
  } else {
    // Show FDRA records as cards if data loaded successfully
    content = (
      <div>
        <p className="record-count">
          Total Records: {fdraData?.length ?? 0}
        </p>

        <div className="cards-grid">
          {fdraData?.map((fdra) => (
            <div key={fdra.FDRA_ID} className="area-card">
              <h3 className="dashboard-subheading">
                {fdra.FDRAname ?? 'Unnamed FDRA'}
              </h3>
              <p className="text-black">AVG_BI: {fdra.AVG_BI}</p>
              <p className="text-black">AVG_ERC: {fdra.AVG_ERC}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="FDRA-section">
      <h2 className="dashboard-heading">FDRA Records</h2>
      {content}
    </section>
  );
}
