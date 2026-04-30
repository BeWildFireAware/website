export default function inputsPage() {
    return(
    <main className="learn-more-file">
    <h2>Weather &amp; Fuel Inputs</h2>

            <h3>Remote Automated Weather Stations (RAWS)</h3>
            <p>Remote Automated Weather Stations (RAWS) are specialized stations designed for wildfire monitoring. These stations have been installed across federal lands, including areas managed by the National Park Service, United States Forest Service, Bureau of Land Management, and Bureau of Indian Affairs. RAWS measures a variety of environmental factors critical for fire danger assessment: temperature, humidity, wind speed, wind direction, gusts, and precipitation. For snow, the gauge requires the moisture to melt before it can be measured as precipitation. Additionally, RAWS can measure solar radiation and fuel temperatures, and some are equipped to monitor soil moisture and soil temperature.</p>
            <p>These stations are quite remote. They operate on batteries charged by solar panels and transmit information hourly via the Geostationary Operational Environmental Satellite (GOES) antenna. The collected data is downloaded to the National Fire Danger Rating System (NFDRS), which processes this information to determine fire risk levels. Each measurement plays an important role: temperature and humidity affect fuel moisture, wind influences fire spread, and precipitation impacts drought and fire conditions. By providing this comprehensive data, RAWS helps inform fire management decisions and support wildfire prevention efforts.</p>

            <h3>Relative Humidity</h3>
            <p>Relative humidity (RH) is the percentage of moisture in the air compared to what it can hold at a given temperature and pressure. RH is measured with automated stations or psychrometers using National Weather Service tables for the elevation. It matters because air and dead forest fuels constantly exchange moisture; low RH dries fuels, high RH adds moisture. Light fuels like grass and pine needles quickly respond to RH changes. Lower RH increases fire risk.</p>

            <h3>Fuel and Soil Moisture</h3>
            <p>Fuel calculations are adjusted to reflect current moisture percentages based on inputs received from the Remote Automated Weather Stations (RAWS). The Keetch-Byram Drought Index (KBDI) incorporates maximum temperature and rainfall data.</p>
            <p>These calculations inform the weighting of fuel types (V, W, Y, X, Z), resulting in the following metrics: Ignition Component (IC), Spread Component (SC), Burning Index (BI), and Energy Release Component (ERC). Additionally, the Severe Fire Danger Index has been developed by combining BI and ERC.</p>
            <p>Fuel moisture is assessed for live herbaceous fuels (both annual and perennial) as well as woody fuels (including shrubs, branches, and foliage) and dead fuels. These are calculated values representing the approximate moisture content of the fuel. Moisture levels in live fuels fluctuate throughout the growing season and differ across various climate classes. There are 20 distinct fuel models reflecting the diversity of vegetation within an area, which managers may utilize when evaluating fire danger.</p>

            <section className="doc-section">
            <h3>Dead Fuel Moisture</h3>
            <p>Dead fuel moisture refers to the moisture content of dead organic fuels, expressed as a percentage of the oven-dry weight of the sample. Dead fuel moisture is exclusively influenced by environmental exposure and is essential in determining fire potential. Dead fuel moistures are classified according to time lag, which denotes the time required for a fuel particle of a specified size to achieve 63% equilibrium between its initial moisture content and the surrounding environment.</p>
            <p>Within the National Fire Danger Rating System (NFDRS), dead fuels are categorized into four time lag classes:</p>
            <p><strong>1 hour</strong> — Fine, flashy fuels such as dried herbaceous plants or round wood less than 1/4" diameter. This classification also includes the topmost layer of forest litter. Rapidly responds to changes in weather conditions.</p>
            <p><strong>10 hours</strong> — Round wood ranging from 3/4" to 1" in diameter, and the litter layer extending 3" to 4" below the surface. Moisture levels are obtained via observation or from standardized "10-Hr Fuel Sticks."</p>
            <p><strong>100 hours</strong> — Fuels with diameters from 1" to 3". Moisture is calculated using a 24-hour average boundary condition, including day length, hours of precipitation, and daily temperature and humidity fluctuations.</p>
            <p><strong>1000 hours</strong> — Fuels with diameters from 3" to 6". Moisture is determined using a 7-day average boundary condition based on day length, rainfall duration, and daily temperature and humidity ranges.</p>
            <p>Dead fuels, which are not attached to living trees, are categorized according to their size and corresponding drying times: 1-hour, 10-hour, 100-hour, 1000-hour, and x-hour (10,000 hour or greater). Fuel size refers to the rate at which dead vegetation responds to atmospheric conditions by drying out or absorbing moisture. Dead fuel moisture can range from 0% to 30%, with higher moisture content decreasing the likelihood of ignition and sustained combustion.</p>
            <p>A practical illustration: a 10-hour fuel will require ten hours of sunshine to dry out following periods of elevated moisture, rain, or high humidity, whereas a 1-hour fuel dries within one hour under similar conditions. In timber fuel types, 1000-hour fuels are primarily employed to assess fire danger, while in grasslands, 1-hour fuels and live fuel moisture are critical indicators.</p>
            </section>

            <h3>Live Fuel Moisture</h3>
            <p>Live fuel moisture refers to the water content of living herbaceous plants, expressed as a percentage of their oven-dry weight. Typically, herbaceous fuel moisture values begin at lower levels and increase rapidly as the growing season progresses; lower percentages indicate drier materials and heightened fire danger.</p>
            <p>Live fuel moisture is sampled from actively growing plant material to determine whether the fuel is in a dormant, growing, or drying stage. Moisture ranges from approximately 30% to 300%, depending on the life cycle stage and fuel type. The dormant stage, commonly occurring in winter, is characterized by moisture levels below 80%. During the growing stage, moisture content increases, peaks, and then declines as plants transition into the drying phase.</p>
            <p>These seasonal stages can be classified as pre-Greenup, summer dryness, and winter dormancy. Each period is associated with potential rapid fire spread and challenging suppression conditions, particularly when compounded by dry fuels and wind. Grass serves as a useful indicator: green, growing grass resists burning, whereas brown, dormant grass ignites readily. Significant fire growth often occurs when fuel moisture levels range between 80% and 150%.</p>
            <p>Live fuel moisture is divided into herbaceous (grasses) and woody (shrubs and trees) types. FEMS measures both, but environmental factors and changing classifications can cause differences from ground measurements.</p>

            <section className="doc-section">
            <h3>Keetch-Byram Drought Index (KBDI)</h3>
            <p>The Keetch-Byram Drought Index (KBDI) gauges drought severity and its impact on wildfire potential. Ranging from 0 (saturated soil) to 800, it estimates how much precipitation (in 100ths of inches) is needed to fully saturate the top 8 inches of soil. As KBDI rises, vegetation experiences more moisture stress; at higher levels, live plants die and add to flammable material, while duff and litter layers become increasingly susceptible to fire.</p>
            <p>KBDI is calculated using weather station latitude, average annual rainfall, maximum air temperature, and recent precipitation. It is used outside the National Fire Danger Rating System but often accompanies NFDRS outputs.</p>
            <p><strong>KBDI = 0–200:</strong> Soil and large fuels remain moist, limiting fire intensity—common in the spring after winter rains.</p>
            <p><strong>KBDI = 200–400:</strong> Early growing season; duff and litter start drying and contribute to fire.</p>
            <p><strong>KBDI = 400–600:</strong> Late summer/early fall; duff and litter actively promote fire intensity and burn readily.</p>
            <p><strong>KBDI = 600–800:</strong> Severe drought with frequent wildfires; expect intense fires, downwind spotting, and burning of live fuels.</p>
            <p>High KBDI values also increase the risk of fire rekindling well after initial suppression.</p>
            </section>
            <h3>Growing Season Index</h3>
            <p>The growing season index is a sophisticated metric that models plant health by indicating periods of active growth ("green up") versus dormancy. It relies on complex calculations from indices generated by RAWS stations.</p>
    </main>
    );
}