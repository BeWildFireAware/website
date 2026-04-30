export default function outputsPage() {
    return(
    <main className="learn-more-file">
    <h2>NFDRS Outputs</h2>

            <h3>Energy Release Component (ERC)</h3>
            <p>The Energy Release Component quantifies the available energy, measured in British Thermal Units (BTU) per square foot, within the flaming front of a fire. This metric reflects the potential heat release per unit area in the flaming zone and serves as an important indicator for several wildfire management activities. ERC is cumulative, increasing as live fuels cure and dead fuels dry, thus offering an effective measure of drought conditions. The scale is open-ended and, like other National Fire Danger Rating System (NFDRS) components, is relative. For example, an ERC value of 24 indicates twice the potential heat release compared to an ERC value of 12. ERC calculations are weighted toward 1000-hour fuels, with additional input from 100-, 10-, and 1-hour fuels. To ensure consistency across Fire Danger Rating Areas, raw ERC values are converted to percentages, enabling comparability nationwide—such that a 90% ERC in Colorado, California, or Montana represents equivalent conditions, regardless of regional variations.</p>

            <h3>Burning Index (BI)</h3>
            <p>The Burning Index measures the effect of fire behavior on containment efforts. Its open-ended scale adequately captures fire problems even during periods of low to moderate danger. BI values represent the upper limits expected within a rating area; thus, if a fire occurs under the most adverse fuel, weather, and topographic conditions, these numbers indicate probable fireline intensities and flame lengths. BI is derived from both Spread and Energy Release Components. For uniformity across Fire Danger Rating Areas, BI values are standardized to percentages, ensuring that a 90% BI has consistent meaning throughout the United States, regardless of state or FDRA.</p>

            <h3>Ignition Component (IC)</h3>
            <p>The Ignition Component expresses the probability that a firebrand will ignite a wildfire requiring suppression, ranging from 0 to 100. An IC of 100 implies every firebrand will cause an actionable fire if it contacts receptive fuel, while an IC of zero indicates none would do so under those conditions. The focus is on actionable ignition. IC calculation incorporates fuel temperature and 1-hour fuel moisture. Theoretically, an IC of 60 means approximately 60% of firebrands contacting wildland fuels will require suppression.</p>
            <p>Key factors include firebrand contact with dead fuel, dryness of the fuel particle, and attainment of the kindling point (approximately 380°C). Live material reduces ignition efficiency; consequently, IC adjustments account for the percentage of live herbaceous vegetation. Dead fine fuel moisture is determined by current weather conditions, air temperature, and relative humidity at the time of the fire weather observation.</p>

            <h3>Spread Component (SC)</h3>
            <p>The Spread Component assesses the forward spread rate of wildfire, measured in feet per minute, based on wind, slope, topography, and fuel properties. Each fuel type necessitates a specific SC table due to variability in moisture content among fine fuels and living, woody plants. The scale is unbounded; for instance, an SC value of 30 corresponds to a forward fire spread rate of 30 feet per minute.</p>
            <p>SC is primarily computed from dead fuel moisture—mainly 1-hour and 10-hour, with some contribution from 100-hour fuel moisture. Utilizing a mathematical model, the Spread Component integrates wind speed, slope, fine fuel moisture (including green herbaceous plants), and moisture in foliage and twigs of living woody plants to determine the worst-case forward rate of spread at the fire's head.</p>
    </main>
    );
}