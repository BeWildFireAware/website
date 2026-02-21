export default function DispatchAreasSection({
  dispatchData,
  dispatchError,
}) {
  // Set content based on whether there's an error
  let content;

  if (dispatchError) {
    // Show error message if data fetch failed
    content = (
      <div className="error-message">
        <p className="error-title">Error with DispatchArea table:</p>
        <p className="error-body">{dispatchError.message}</p>
      </div>
    );
  } else {
    // Show dispatch areas as cards if data loaded successfully
    content = (
      <div>
        <p className="record-count">
          Total Area: {dispatchData?.length ?? 0}
        </p>

        <div className="cards-grid">
          {dispatchData?.map((dispatchArea) => (
            <div key={dispatchArea.Dispatch_ID} className="area-card">
              <h3 className="dashboard-subheading">
                {dispatchArea.DispatchName ?? 'Unnamed Area'}
              </h3>
              <p>Dispatch ID: {dispatchArea.Dispatch_ID}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="DispatchArea-section">
      <h2 className="dashboard-heading">Dispatch Areas</h2>
      {content}
    </section>
  );
}
