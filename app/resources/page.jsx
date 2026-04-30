export default function resourcesPage() {
    return(
    <>
    <h2>Resources</h2>
            <p>Helpful external links for wildfire tracking, air quality, weather warnings, and fire danger forecasting.</p>

            <h3>Active Wildfires</h3>

            <div class="resource-item">
                <h4><a href="https://app.watchduty.org/" target="_blank">WatchDuty</a></h4>
                <p>The most current information on wildfires in the US. Track active fires with real-time updates and mapping.</p>
            </div>

            <div class="resource-item">
                <h4><a href="https://www.nifc.gov/nicc-files/sitreprt.pdf" target="_blank">National Situation Report</a></h4>
                <p>The National Interagency Fire Center's daily situation report on wildfire activity across the United States.</p>
            </div>

            <h3>Air Quality &amp; Smoke</h3>

            <div class="resource-item">
                <h4><a href="https://fire.airnow.gov/" target="_blank">AirNow Fire &amp; Smoke Map</a></h4>
                <p>Where is this smoke coming from? Track smoke plumes and their sources across the country.</p>
            </div>

            <div class="resource-item">
                <h4><a href="https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp604800%2FcC0#1/19.5/-30" target="_blank">PurpleAir</a></h4>
                <p>How is the air quality in my area or where I want to visit? Real-time air quality monitoring from a network of sensors.</p>
            </div>

            <h3>Weather &amp; Red Flag Warnings</h3>

            <div class="resource-item">
                <h4><a href="https://www.weather.gov/wrh/fire?wfo=gjt" target="_blank">National Weather Service — Grand Junction</a></h4>
                <p>Fire weather forecasts and red flag warnings for the Grand Junction, Colorado forecast area.</p>
            </div>

            <div class="resource-item">
                <h4><a href="https://www.weather.gov/pub/fire" target="_blank">National Weather Service — Pueblo</a></h4>
                <p>Fire weather forecasts and red flag warnings for the Pueblo, Colorado forecast area.</p>
            </div>

            <h3>Fire Danger Forecasting</h3>

            <div class="resource-item">
                <h4><a href="https://firedanger.cr.usgs.gov/viewer/index.html" target="_blank">USGS Wildfire Danger Forecast</a></h4>
                <p>Wildfire danger forecasting using satellite technology. View forecasts for large fire probability and fire spread probability for days 1 through 7. A great cross-reference with BeWildfireAware fire danger forecasting.</p>
            </div>
    </>
    );
}